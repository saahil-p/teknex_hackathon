import pandas as pd
import joblib
import numpy as np

# --- 1. Setup and Configuration ---
print("--- Script Start: Verifying multi-state failure samples ---")

try:
    # Load the samples that were created
    samples_df = pd.read_csv('../obd-samples-new.csv')
    print(f"✅ Loaded {len(samples_df)} samples from obd-samples-new.csv")
except FileNotFoundError:
    print("❌ Error: obd-samples-new.csv not found. Please run the picksample.py script first.")
    exit()

# --- 2. Load Models and Feature Definitions (Mirrors main.py) ---
print("\n--- Loading trained models and configurations ---")
try:
    # RUL models are sufficient for status classification based on RUL
    rul_models = {
        "engine":  joblib.load("../saved_models/rul_engine_regressor.pkl"),
        "brake":   joblib.load("../saved_models/rul_brake_regressor.pkl"),
        "battery": joblib.load("../saved_models/rul_battery_regressor.pkl")
    }
    print("✅ All RUL models loaded successfully.")
except FileNotFoundError as e:
    print(f"❌ Error loading a model: {e}. Cannot proceed.")
    exit()

# Define features for each component
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

component_features = {
    "engine": engine_features,
    "brake": brake_features,
    "battery": battery_features
}

# Define RUL thresholds for status classification
RUL_THRESHOLD = 30
CRITICAL_THRESHOLD = 20

# --- 3. Prediction Function (Simplified from main.py) ---
def get_component_status(data_row, comp_name):
    """Predicts RUL and determines the health status for a single component."""
    model = rul_models.get(comp_name)
    if not model:
        return "Unknown"

    # Prepare features for prediction, ensuring all are present
    try:
        features = pd.DataFrame([data_row[component_features[comp_name]]])
    except KeyError as e:
        print(f"❌ Missing feature for {comp_name}: {e}")
        return "Unknown"

    # Predict RUL
    try:
        rul = model.predict(features)[0]
    except Exception as e:
        print(f"Warning: RUL prediction failed for {comp_name}. Error: {e}")
        return "Unknown"

    # Determine status based on RUL thresholds from main.py
    # This logic should exactly match the status determination in main.py
    if rul <= CRITICAL_THRESHOLD:
        # In main.py, this corresponds to "⚠ Critical - immediate service required"
        return "Critical"
    elif rul < RUL_THRESHOLD:
        # In main.py, this corresponds to "🟡 Attention soon"
        return "Attention"
    else:
        # In main.py, this corresponds to "🟢 Healthy"
        return "Healthy"

# --- 4. Test Each Sample and Verify ---
print("\n--- Verifying samples meet the multi-failure criteria ---")
all_tests_passed = True
for index, sample in samples_df.iterrows():
    print(f"\n--- Testing Sample {index + 1} (ID: {sample.get('vehicle_id', 'N/A')}) ---")
    
    # Get status for each component
    statuses = {
        "engine": get_component_status(sample, "engine"),
        "brake": get_component_status(sample, "brake"),
        "battery": get_component_status(sample, "battery")
    }
    
    print("  - Predicted Component Statuses:")
    for comp, stat in statuses.items():
        print(f"    - {comp.capitalize()}: {stat}")

    # Verification check: must have at least one 'Critical' and one 'Attention'
    status_set = set(statuses.values())
    if "Critical" in status_set and "Attention" in status_set:
        print("  - ✅ VERIFICATION PASSED: Sample has at least one 'Critical' and one 'Attention' component.")
    else:
        print("  - ❌ VERIFICATION FAILED: Sample does not meet the required criteria.")
        all_tests_passed = False

# --- 5. Final Report ---
print("\n--------------------")
if all_tests_passed:
    print("✅ All samples passed verification.")
else:
    print("❌ One or more samples failed verification.")
print("--- Script End ---")
