import pandas as pd
import numpy as np
import joblib
import os
from sklearn.metrics import mean_squared_error, classification_report
from sklearn.model_selection import train_test_split

# --- 1. Setup and Configuration ---
print("--- Model Evaluation Script ---")

MODELS_DIR = 'saved_models'
DATA_PATH = '/Users/saahilp/Hackathon/GearGenie/backend/baseline/synthetic_hierarchical_data.csv'

# Check if models directory exists
if not os.path.exists(MODELS_DIR):
    print(f"Error: Models directory '{MODELS_DIR}' not found.")
    print("Please run the training script first to generate the models.")
    exit()

# Load the dataset
try:
    df = pd.read_csv(DATA_PATH)
    print(f"Successfully loaded data from '{DATA_PATH}'")
except FileNotFoundError:
    print(f"Error: Dataset not found at '{DATA_PATH}'.")
    exit()

# Define feature sets for each component
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

# --- 2. Split Data to Get the Test Set ---
# Use the same random_state and test_size as the training script to get the identical test set
_, df_test = train_test_split(df, test_size=0.2, random_state=42)
print(f"Test set contains {len(df_test)} samples.")

# --- 3. Evaluate RUL Models ---
print("\n--- Evaluating RUL Regression Models ---")
for comp_name, details in components.items():
    model_path = os.path.join(MODELS_DIR, f'rul_{comp_name.lower()}_regressor.pkl')
    
    try:
        regressor = joblib.load(model_path)
        print(f"\nEvaluating RUL model for: {comp_name}")
        
        X_test = df_test[details['features']]
        y_test = df_test[details['rul_col']]
        
        y_pred = regressor.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        
        print(f"  RMSE on Test Set: {rmse:.4f}")
        
    except FileNotFoundError:
        print(f"\nCould not find RUL model for {comp_name} at '{model_path}'. Skipping.")

# --- 4. Evaluate Classification Models ---
print("\n--- Evaluating Failure Classification Models ---")
for comp_name, details in components.items():
    clf_model_path = os.path.join(MODELS_DIR, f'classifier_{comp_name.lower()}_model.pkl')
    le_model_path = os.path.join(MODELS_DIR, f'classifier_{comp_name.lower()}_le.pkl')

    try:
        classifier = joblib.load(clf_model_path)
        le = joblib.load(le_model_path)
        print(f"\nEvaluating classification model for: {comp_name}")

        # Filter the test set for failures of the specific component
        comp_test_df = df_test[df_test['component'] == comp_name].copy()
        
        if comp_test_df.empty:
            print(f"  No failure data for {comp_name} in the test set. Skipping.")
            continue

        X_test_comp = comp_test_df[details['features']]
        y_test_comp_cat = comp_test_df['failure_category']
        y_test_comp_enc = le.transform(y_test_comp_cat)

        y_pred_enc = classifier.predict(X_test_comp)
        
        print(f"  Classification Report for {comp_name} on Test Set:")
        print(classification_report(y_test_comp_enc, y_pred_enc, target_names=le.classes_, zero_division=0))

    except FileNotFoundError:
        print(f"\nCould not find classification model or label encoder for {comp_name}. Skipping.")

print("\n--- Model Evaluation Complete ---")
