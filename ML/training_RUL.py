import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor
from imblearn.ensemble import BalancedRandomForestClassifier
from sklearn.metrics import mean_squared_error, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# --- 1. Setup and Configuration ---
print("--- Script Start: Hierarchical Predictive Maintenance with Model Tuning ---")

os.makedirs('saved_models', exist_ok=True)

try:
    df = pd.read_csv('/Users/saahilp/Hackathon/GearGenie/backend/baseline/synthetic_hierarchical_data.csv')
except FileNotFoundError:
    print("Error: synthetic_hierarchical_data.csv not found. Please run generate_synthetic_data.py first.")
    exit()

base_features = ['odometer_reading', 'vehicle_speed_kph', 'ambient_temp_c', 'humidity_percent']
engine_features = base_features + [
    'engine_temp_c', 'engine_rpm', 'oil_pressure_psi', 'coolant_temp_c',
    'fuel_level_percent', 'fuel_consumption_lph', 'engine_load_percent',
    'throttle_pos_percent', 'air_flow_rate_gps', 'exhaust_gas_temp_c',
    'vibration_level', 'engine_hours'
]
brake_features = base_features + [
    'brake_fluid_level_psi', 'brake_pad_wear_mm', 'brake_temp_c',
    'abs_fault_indicator', 'brake_pedal_pos_percent', 'wheel_speed_fl_kph',
    'wheel_speed_fr_kph', 'wheel_speed_rl_kph', 'wheel_speed_rr_kph'
]
battery_features = base_features + [
    'battery_voltage_v', 'battery_current_a', 'battery_temp_c',
    'alternator_output_v', 'battery_charge_percent', 'battery_health_percent'
]

components = {
    'Engine': {'features': engine_features, 'rul_col': 'RUL_Engine'},
    'Brake': {'features': brake_features, 'rul_col': 'RUL_Brake'},
    'Battery': {'features': battery_features, 'rul_col': 'RUL_Battery'}
}

# Define parameter grid for hyperparameter tuning
# A smaller grid for faster demonstration
param_grid_reg = {
    'n_estimators': [100, 150],
    'max_depth': [10, 20],
    'min_samples_leaf': [2, 4]
}

param_grid_clf = {
    'n_estimators': [100, 150],
    'max_depth': [10, 20],
    'min_samples_leaf': [2, 4]
}

# --- 2. Train and Save RUL Models with Hyperparameter Tuning ---
print("\n--- Stage 1: Training RUL Prediction Models with GridSearchCV ---")
for comp_name, details in components.items():
    print(f"\nTuning RUL model for: {comp_name}")
    
    X = df[details['features']]
    y = df[details['rul_col']]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    regressor = RandomForestRegressor(random_state=42, n_jobs=-1)
    grid_search = GridSearchCV(estimator=regressor, param_grid=param_grid_reg, cv=3, 
                               scoring='neg_root_mean_squared_error', verbose=1, n_jobs=-1)
    
    grid_search.fit(X_train, y_train)
    
    best_regressor = grid_search.best_estimator_
    print(f"Best Regressor Params for {comp_name}: {grid_search.best_params_}")
    
    y_pred = best_regressor.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    print(f"RMSE for {comp_name} RUL (Tuned): {rmse:.4f}")
    
    model_path = f'saved_models/rul_{comp_name.lower()}_regressor.pkl'
    joblib.dump(best_regressor, model_path)
    print(f"Saved Tuned {comp_name} RUL model to {model_path}")

# --- 3. Train and Save Classification Models with Hyperparameter Tuning ---
print("\n--- Stage 2: Training Failure Classification Models with GridSearchCV ---")
for comp_name, details in components.items():
    print(f"\nTuning classification model for: {comp_name}")
    
    comp_df = df[df['component'] == comp_name].copy()
    
    if len(comp_df) < 20: # Need enough data for splitting and CV
        print(f"Not enough failure data for {comp_name}, skipping classification model.")
        continue
        
    X = comp_df[details['features']]
    y_cat = comp_df['failure_category']
    
    le = LabelEncoder()
    y = le.fit_transform(y_cat)
    
    le_path = f'saved_models/classifier_{comp_name.lower()}_le.pkl'
    joblib.dump(le, le_path)
    print(f"Saved {comp_name} Label Encoder to {le_path}")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Using BalancedRandomForestClassifier for imbalanced data
    classifier = BalancedRandomForestClassifier(random_state=42)
    grid_search_clf = GridSearchCV(estimator=classifier, param_grid=param_grid_clf, cv=3, 
                                   scoring='f1_macro', verbose=1, n_jobs=-1)
    
    grid_search_clf.fit(X_train, y_train)
    
    best_classifier = grid_search_clf.best_estimator_
    print(f"Best Classifier Params for {comp_name}: {grid_search_clf.best_params_}")
    
    y_pred = best_classifier.predict(X_test)
    print(f"Classification Report for {comp_name} (Tuned):")
    print(classification_report(y_test, y_pred, target_names=le.classes_, zero_division=0))
    
    model_path = f'saved_models/classifier_{comp_name.lower()}_model.pkl'
    joblib.dump(best_classifier, model_path)
    print(f"Saved Tuned {comp_name} classification model to {model_path}")

# --- 4. Hierarchical Inference Demonstration (remains the same) ---
print("\n--- Stage 3: Demonstrating Hierarchical Inference with Tuned Models ---")
RUL_THRESHOLD = 30

def predict_hierarchical_failure(data_row):
    print("\n--- Running New Prediction ---")
    print("Input Data (first 5 features):")
    print(data_row[base_features].head())
    
    models = {}
    for comp_name in components.keys():
        try:
            models[f'rul_{comp_name.lower()}'] = joblib.load(f'saved_models/rul_{comp_name.lower()}_regressor.pkl')
            models[f'clf_{comp_name.lower()}'] = joblib.load(f'saved_models/classifier_{comp_name.lower()}_model.pkl')
            models[f'le_{comp_name.lower()}'] = joblib.load(f'saved_models/classifier_{comp_name.lower()}_le.pkl')
        except FileNotFoundError:
            continue

    predicted_ruls = {}
    for comp_name, details in components.items():
        model = models.get(f'rul_{comp_name.lower()}')
        if model:
            features = pd.DataFrame([data_row[details['features']]])
            rul = model.predict(features)[0]
            predicted_ruls[comp_name] = rul
            print(f"Predicted RUL for {comp_name}: {rul:.2f} days")

    for comp_name, rul in predicted_ruls.items():
        if rul < RUL_THRESHOLD:
            print(f"RUL for {comp_name} is LOW ({rul:.2f} < {RUL_THRESHOLD}). Classifying failure...")
            
            clf_model = models.get(f'clf_{comp_name.lower()}')
            le = models.get(f'le_{comp_name.lower()}')
            
            if clf_model and le:
                features = pd.DataFrame([data_row[components[comp_name]['features']]])
                prediction_encoded = clf_model.predict(features)[0]
                failure_class = le.inverse_transform([prediction_encoded])[0]
                
                print(f"\n--- FINAL PREDICTION ---")
                print(f"Component: {comp_name}")
                print(f"Predicted Failure: '{failure_class}'")
                return comp_name, failure_class
        else:
            print(f"RUL for {comp_name} is OK ({rul:.2f} >= {RUL_THRESHOLD}).")

    print("\n--- FINAL PREDICTION ---")
    print("No imminent failure predicted for any component.")
    return "None", "No Failure"

print("\n--- DEMONSTRATION 1: PREDICTING AN ACTUAL FAILURE ---")
sample_failure_row = df[df['component'] == 'Engine'].iloc[0]
predict_hierarchical_failure(sample_failure_row)

print("\n--- DEMONSTRATION 2: PREDICTING A HEALTHY VEHICLE ---")
healthy_sample = sample_failure_row.copy()
healthy_sample['odometer_reading'] = 15000
healthy_sample['engine_temp_c'] = 90
healthy_sample['brake_pad_wear_mm'] = 3
healthy_sample['battery_health_percent'] = 98
healthy_sample['vibration_level'] = 0.5
predict_hierarchical_failure(healthy_sample)

