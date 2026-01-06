import pandas as pd
import os
import joblib
import numpy as np

# --- 1. Setup and Configuration ---
print("--- Script Start: Finding and Verifying Correctly Predicted Samples ---")

try:
    df = pd.read_csv('/Users/saahilp/Hackathon/GearGenie/backend/baseline/synthetic_hierarchical_data.csv')
except FileNotFoundError:
    print("Error: synthetic_hierarchical_data.csv not found. Please ensure the file exists.")
    exit()

output_path = 'obd-samples.csv'

# --- 2. Load Models ---
print("\n--- Loading trained models ---")
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

RUL_THRESHOLD = 30
models = {}
for comp_name in components.keys():
    try:
        models[f'rul_{comp_name.lower()}'] = joblib.load(f'saved_models/rul_{comp_name.lower()}_regressor.pkl')
        models[f'clf_{comp_name.lower()}'] = joblib.load(f'saved_models/classifier_{comp_name.lower()}_model.pkl')
        models[f'le_{comp_name.lower()}'] = joblib.load(f'saved_models/classifier_{comp_name.lower()}_le.pkl')
    except FileNotFoundError as e:
        print(f"Warning: Could not load model for {comp_name}. {e}")
        continue

def predict_hierarchical_failure(data_row):
    predicted_ruls = {}
    for comp_name, details in components.items():
        model = models.get(f'rul_{comp_name.lower()}')
        if model:
            features = pd.DataFrame([data_row[details['features']]])
            rul = model.predict(features)[0]
            predicted_ruls[comp_name] = rul

    for comp_name, rul in predicted_ruls.items():
        if rul < RUL_THRESHOLD:
            clf_model = models.get(f'clf_{comp_name.lower()}')
            le = models.get(f'le_{comp_name.lower()}')
            
            if clf_model and le:
                features = pd.DataFrame([data_row[components[comp_name]['features']]])
                prediction_encoded = clf_model.predict(features)[0]
                failure_class = le.inverse_transform([prediction_encoded])[0]
                return comp_name, failure_class
    
    return "None", "No Failure"

# --- 3. Find and collect samples that are predicted correctly ---
print("\n--- Searching for correctly predicted samples for each failure class ---")
correct_samples = []
failure_groups = df.groupby(['component', 'failure_category'])

for (component, failure_category), group in failure_groups:
    print(f"Searching for: Component='{component}', Failure='{failure_category}'")
    found = False
    for index, row in group.iterrows():
        predicted_component, predicted_failure = predict_hierarchical_failure(row)
        
        if predicted_component == component and predicted_failure == failure_category:
            print(f"  > Found a correct sample at index {index}.")
            correct_samples.append(row)
            found = True
            break 
    if not found:
        print(f"  > Could not find a correctly predicted sample for this class.")

# --- 4. Save the new samples to a CSV file ---
if correct_samples:
    samples_df = pd.DataFrame(correct_samples)
    samples_df.to_csv(output_path, index=False)
    print(f"\nSuccessfully created '{output_path}' with {len(samples_df)} correctly predicted samples.")
else:
    print("\nNo correctly predicted samples were found.")

# --- 5. Final Verification (Optional) ---
print("\n--- Verifying the new samples from the created file ---")
try:
    verification_samples = pd.read_csv(output_path)
    for index, row in verification_samples.iterrows():
        actual_component = row['component']
        actual_failure = row['failure_category']
        predicted_component, predicted_failure = predict_hierarchical_failure(row)
        
        print(f"\nSample {index+1}:")
        print(f"  Actual:    Component='{actual_component}', Failure='{actual_failure}'")
        print(f"  Predicted: Component='{predicted_component}', Failure='{predicted_failure}'")
        
        if actual_component == predicted_component and actual_failure == predicted_failure:
            print("  Result: CORRECT")
        else:
            print("  Result: INCORRECT")
except FileNotFoundError:
    print(f"'{output_path}' was not created because no correct samples were found.")

print("\n--- Script End ---")

