import pandas as pd
import os
import joblib
import numpy as np

# --- 1. Setup and Configuration ---
print("--- Script Start: Finding a multi-state sample ---")

try:
    # Load the entire dataset
    df = pd.read_csv('/Users/saahilp/Desktop/Hackathon/obd-samples-new.csv')
    print(f"✅ Loaded {len(df)} rows from synthetic_hierarchical_data.csv")
except FileNotFoundError:
    print("❌ Error: synthetic_hierarchical_data.csv not found. Please ensure the file exists.")
    exit()

output_path = 'obd-samples_new.csv'

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
    'Engine': {'features': engine_features},
    'Brake': {'features': brake_features},
    'Battery': {'features': battery_features}
}

RUL_THRESHOLD = 30  # Attention below this value
CRITICAL_THRESHOLD = 20 # Critical below this value

models = {}
all_models_loaded = True
for comp_name in components.keys():
    try:
        # Only RUL models are needed for status classification based on RUL
        models[f'rul_{comp_name.lower()}'] = joblib.load(f'saved_models/rul_{comp_name.lower()}_regressor.pkl')
    except FileNotFoundError as e:
        print(f"❌ Error: Could not load RUL model for {comp_name}. {e}")
        all_models_loaded = False

if not all_models_loaded:
    print("\n--- Cannot proceed without all RUL models. Exiting. ---")
    exit()
print("✅ All RUL models loaded successfully.")


# --- 3. Define Prediction and Status Function ---
def get_component_status(data_row, comp_name):
    """Predicts RUL and determines the health status for a single component."""
    model = models.get(f'rul_{comp_name.lower()}')
    if not model:
        return None, "Unknown"

    # Prepare features for prediction
    features = pd.DataFrame([data_row[components[comp_name]['features']]])
    
    # Predict RUL
    try:
        rul = model.predict(features)[0]
    except Exception as e:
        print(f"Warning: RUL prediction failed for {comp_name} on a row. Error: {e}")
        return None, "Unknown"

    # Determine status based on RUL thresholds
    if rul <= CRITICAL_THRESHOLD:
        status = "Critical"
    elif rul < RUL_THRESHOLD:
        status = "Attention"
    else:
        status = "Healthy"
        
    return rul, status

# --- 4. Find a sample with one of each status ---
print("\n--- Searching for a single sample with Critical, Attention, and Healthy components ---")
found_sample = None
for index, row in df.iterrows():
    statuses = {}
    for comp_name in components.keys():
        rul, status = get_component_status(row, comp_name)
        if status != "Unknown":
            statuses[comp_name] = status

    # Check if this row has one of each status
    if len(statuses) == 3 and set(statuses.values()) == {"Critical", "Attention", "Critical"}:
        print(f"\n✅ Found a perfect multi-state sample at index {index}!")
        
        # Add a 'label' for identification in the app
        row['label'] = f"Sample {index} (Multi-State)"
        found_sample = row
        
        # Print details of the found sample
        print("  - Details:")
        for comp, stat in statuses.items():
            print(f"    - {comp}: {stat}")
        break # Stop searching once we find one

# --- 5. Save the new sample to a CSV file ---
if found_sample is not None:
    # Create a DataFrame from the single found sample
    sample_df = pd.DataFrame([found_sample])
    
    # Reorder columns to have 'label' first for clarity
    cols = ['label'] + [c for c in sample_df.columns if c != 'label']
    sample_df = sample_df[cols]
    
    sample_df.to_csv(output_path, index=False)
    print(f"\nSuccessfully created '{output_path}' with the multi-state sample.")
else:
    print("\n❌ Could not find a single sample matching the criteria.")
    print("Consider adjusting thresholds or using a more diverse dataset.")

print("\n--- Script End ---")


