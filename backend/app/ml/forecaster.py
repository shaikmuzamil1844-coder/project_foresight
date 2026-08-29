import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.ensemble import GradientBoostingRegressor

# Dual-import support: local dev (backend.app...) vs Vercel (app...)
try:
    from backend.app.ml.feature_engineering import create_time_series_features
except ImportError:
    from app.ml.feature_engineering import create_time_series_features


class DemandForecaster:
    """
    Lightweight demand forecaster using scikit-learn GradientBoostingRegressor.
    Replaces XGBoost/LightGBM to keep the Vercel deployment under 50 MB.
    Accuracy is comparable for short-horizon retail time-series.
    """

    def __init__(self):
        self.model = None
        self.feature_cols = [
            "day_of_week", "month", "day_of_month", "is_weekend",
            "lag_1", "lag_7", "lag_14", "lag_28",
            "rolling_mean_7", "rolling_mean_14", "rolling_mean_28",
            "rolling_std_7", "rolling_std_14", "rolling_std_28",
        ]

    def _build_model(self):
        return GradientBoostingRegressor(
            n_estimators=150,
            learning_rate=0.05,
            max_depth=4,
            subsample=0.8,
            min_samples_leaf=3,
            random_state=42,
        )

    def train_and_forecast(self, df_history: pd.DataFrame, horizon_days: int = 30):
        """
        Train on df_history and produce a horizon_days forward forecast.
        Returns dict with keys: mae, rmse, mape, forecast (list of dicts).
        """
        df_feat = create_time_series_features(df_history, target_col="units_sold")

        # Validation split: hold-out last 14 or 30 days
        hold_out = 30 if len(df_feat) > 60 else 14
        train_df = df_feat.iloc[:-hold_out]
        test_df  = df_feat.iloc[-hold_out:]

        if len(train_df) < 5:
            # Not enough data – fall back to mean predictor
            mean_val = float(df_feat["units_sold"].mean())
            forecast_rows = []
            last_date = pd.to_datetime(df_history["date"]).max()
            for i in range(1, horizon_days + 1):
                d = last_date + timedelta(days=i)
                forecast_rows.append({
                    "date": d.strftime("%Y-%m-%d"),
                    "predicted_demand": mean_val,
                    "lower_bound": max(0.0, mean_val - 5),
                    "upper_bound": mean_val + 5,
                })
            return {"mae": 0.0, "rmse": 0.0, "mape": 0.0, "forecast": forecast_rows}

        X_train = train_df[self.feature_cols]
        y_train = train_df["units_sold"]
        X_test  = test_df[self.feature_cols]
        y_test  = test_df["units_sold"]

        self.model = self._build_model()
        self.model.fit(X_train, y_train)

        preds_eval = np.maximum(0, self.model.predict(X_test))

        mae  = float(mean_absolute_error(y_test, preds_eval))
        rmse = float(np.sqrt(mean_squared_error(y_test, preds_eval)))
        y_nz = np.where(y_test == 0, 1e-5, y_test.values)
        mape = float(np.mean(np.abs((y_test.values - preds_eval) / y_nz)) * 100)

        # Retrain on full data
        X_full = df_feat[self.feature_cols]
        y_full = df_feat["units_sold"]
        self.model.fit(X_full, y_full)

        # Recursive multi-step forecast
        last_date      = pd.to_datetime(df_history["date"]).max()
        current_history = df_feat.copy()
        forecast_rows  = []

        for i in range(1, horizon_days + 1):
            next_date = last_date + timedelta(days=i)
            units_series = current_history["units_sold"].values

            next_row = {
                "date":         next_date,
                "units_sold":   0,
                "day_of_week":  next_date.dayofweek,
                "month":        next_date.month,
                "day_of_month": next_date.day,
                "is_weekend":   1 if next_date.dayofweek in [5, 6] else 0,
            }

            for lag in [1, 7, 14, 28]:
                next_row[f"lag_{lag}"] = (
                    units_series[-lag] if len(units_series) >= lag else units_series[0]
                )

            for window in [7, 14, 28]:
                wdata = units_series[-window:] if len(units_series) >= window else units_series
                next_row[f"rolling_mean_{window}"] = float(np.mean(wdata))
                next_row[f"rolling_std_{window}"]  = float(np.std(wdata)) if len(wdata) > 1 else 0.0

            feat_vec     = pd.DataFrame([next_row])[self.feature_cols]
            pred_demand  = float(max(0.0, round(float(self.model.predict(feat_vec)[0]), 2)))
            margin       = float(1.96 * max(1.0, rmse))
            lower_bound  = float(max(0.0, round(pred_demand - margin, 2)))
            upper_bound  = float(round(pred_demand + margin, 2))

            forecast_rows.append({
                "date":             next_date.strftime("%Y-%m-%d"),
                "predicted_demand": pred_demand,
                "lower_bound":      lower_bound,
                "upper_bound":      upper_bound,
            })

            next_row["units_sold"] = pred_demand
            current_history = pd.concat(
                [current_history, pd.DataFrame([next_row])], ignore_index=True
            )

        return {
            "mae":      round(mae, 2),
            "rmse":     round(rmse, 2),
            "mape":     round(mape, 2),
            "forecast": forecast_rows,
        }
