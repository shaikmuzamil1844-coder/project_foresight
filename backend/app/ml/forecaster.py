import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.metrics import mean_absolute_error, mean_squared_error
from backend.app.ml.feature_engineering import create_time_series_features

try:
    from xgboost import XGBRegressor
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

try:
    from lightgbm import LGBMRegressor
    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False

from sklearn.ensemble import GradientBoostingRegressor

class DemandForecaster:
    def __init__(self, model_type="xgboost"):
        self.model_type = model_type
        self.model = None
        self.feature_cols = [
            'day_of_week', 'month', 'day_of_month', 'is_weekend',
            'lag_1', 'lag_7', 'lag_14', 'lag_28',
            'rolling_mean_7', 'rolling_mean_14', 'rolling_mean_28',
            'rolling_std_7', 'rolling_std_14', 'rolling_std_28'
        ]

    def _get_model(self):
        if self.model_type == "xgboost" and HAS_XGBOOST:
            return XGBRegressor(n_estimators=100, learning_rate=0.05, max_depth=5, random_state=42)
        elif self.model_type == "lightgbm" and HAS_LIGHTGBM:
            return LGBMRegressor(n_estimators=100, learning_rate=0.05, max_depth=5, random_state=42, verbose=-1)
        else:
            return GradientBoostingRegressor(n_estimators=100, learning_rate=0.05, max_depth=5, random_state=42)

    def train_and_forecast(self, df_history: pd.DataFrame, horizon_days: int = 30):
        """
        Train ML model on df_history and generate future demand forecast for horizon_days.
        Returns:
            metrics (mae, rmse, mape)
            forecast_df (date, predicted_demand, lower_bound, upper_bound)
        """
        df_feat = create_time_series_features(df_history, target_col="units_sold")
        
        # Validation Split: Last 30 days for evaluation
        train_df = df_feat.iloc[:-30] if len(df_feat) > 60 else df_feat.iloc[:-7]
        test_df = df_feat.iloc[-30:] if len(df_feat) > 60 else df_feat.iloc[-7:]

        X_train, y_train = train_df[self.feature_cols], train_df['units_sold']
        X_test, y_test = test_df[self.feature_cols], test_df['units_sold']

        self.model = self._get_model()
        self.model.fit(X_train, y_train)

        preds_eval = self.model.predict(X_test)
        preds_eval = np.maximum(0, preds_eval)

        # Evaluation metrics
        mae = float(mean_absolute_error(y_test, preds_eval))
        rmse = float(np.sqrt(mean_squared_error(y_test, preds_eval)))
        
        # MAPE with non-zero divisor stability
        y_test_non_zero = np.where(y_test == 0, 1e-5, y_test)
        mape = float(np.mean(np.abs((y_test - preds_eval) / y_test_non_zero)) * 100)

        # Retrain on full historical dataset
        X_full, y_full = df_feat[self.feature_cols], df_feat['units_sold']
        self.model.fit(X_full, y_full)

        # Recursive Multi-Step Horizon Forecast
        last_date = pd.to_datetime(df_history['date']).max()
        current_history = df_feat.copy()
        
        forecast_rows = []
        for i in range(1, horizon_days + 1):
            next_date = last_date + timedelta(days=i)
            
            # Build feature vector for next_date
            next_row = {
                'date': next_date,
                'units_sold': 0, # placeholder
                'day_of_week': next_date.dayofweek,
                'month': next_date.month,
                'day_of_month': next_date.day,
                'is_weekend': 1 if next_date.dayofweek in [5, 6] else 0,
            }

            units_series = current_history['units_sold'].values
            
            # Extract lags
            for lag in [1, 7, 14, 28]:
                next_row[f'lag_{lag}'] = units_series[-lag] if len(units_series) >= lag else units_series[0]

            # Extract rolling stats
            for window in [7, 14, 28]:
                window_data = units_series[-window:] if len(units_series) >= window else units_series
                next_row[f'rolling_mean_{window}'] = np.mean(window_data)
                next_row[f'rolling_std_{window}'] = np.std(window_data) if len(window_data) > 1 else 0.0

            feat_vector = pd.DataFrame([next_row])[self.feature_cols]
            pred_demand = float(self.model.predict(feat_vector)[0])
            pred_demand = float(max(0.0, round(pred_demand, 2)))

            # Confidence bounds (+/- 1.96 * RMSE)
            margin = float(1.96 * max(1.0, rmse))
            lower_bound = float(max(0.0, round(pred_demand - margin, 2)))
            upper_bound = float(round(pred_demand + margin, 2))

            forecast_rows.append({
                'date': next_date.strftime('%Y-%m-%d'),
                'predicted_demand': float(pred_demand),
                'lower_bound': float(lower_bound),
                'upper_bound': float(upper_bound)
            })


            # Append prediction to history for subsequent lag generation
            next_row['units_sold'] = pred_demand
            current_history = pd.concat([current_history, pd.DataFrame([next_row])], ignore_index=True)

        return {
            'mae': round(mae, 2),
            'rmse': round(rmse, 2),
            'mape': round(mape, 2),
            'forecast': forecast_rows
        }
