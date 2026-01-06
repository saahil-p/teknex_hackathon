import pandas as pd
from imblearn.over_sampling import SMOTE
import numpy as np

print("--- Starting Synthetic Data Generation ---")

# Load the existing hierarchical data
try:
    df = pd.read_csv('/Users/saahilp/Hackathon/GearGenie/backend/baseline/hierarchical_vehicle_data.csv')
    print("Successfully loaded 'hierarchical_vehicle_data.csv'.")
except FileNotFoundError:
    print("Error: 'hierarchical_vehicle_data.csv' not found. Please ensure the file exists.")
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

components = {
    'Engine': {'features': engine_features},
    'Brake': {'features': brake_features},
    'Battery': {'features': battery_features}
}

# Separate the 'Normal' data from the failure data
normal_df = df[df['component'] == 'Normal'].copy()
failure_df = df[df['component'] != 'Normal'].copy()

print("\nOriginal failure distribution:")
print(failure_df['failure_category'].value_counts())

# This will hold our newly generated dataframes
augmented_dfs = [failure_df]

# We want to generate enough data to have at least this many samples per failure class
TARGET_SAMPLES_PER_CLASS = 200

for comp_name, details in components.items():
    comp_failure_df = failure_df[failure_df['component'] == comp_name]
    
    if comp_failure_df.empty:
        print(f"\nNo failure data for {comp_name}, skipping.")
        continue

    print(f"\nProcessing component: {comp_name}")
    
    features = details['features']
    X = comp_failure_df[features]
    y = comp_failure_df['failure_category']

    # Calculate how many samples to generate for each class
    class_counts = y.value_counts()
    sampling_strategy = {}
    for class_name, count in class_counts.items():
        if count < TARGET_SAMPLES_PER_CLASS:
            sampling_strategy[class_name] = TARGET_SAMPLES_PER_CLASS
    
    if not sampling_strategy:
        print(f"All classes for {comp_name} already meet the target sample count.")
        continue

    print(f"SMOTE sampling strategy for {comp_name}: {sampling_strategy}")

    # Apply SMOTE
    smote = SMOTE(sampling_strategy=sampling_strategy, random_state=42, k_neighbors=min(class_counts.min() - 1, 5))
    X_res, y_res = smote.fit_resample(X, y)

    # Create a new dataframe for the synthetic data
    synthetic_df = pd.DataFrame(X_res, columns=features)
    synthetic_df['failure_category'] = y_res
    synthetic_df['component'] = comp_name

    # For other columns not in features, we'll forward-fill from the original data
    # This is a simple way to handle other metadata
    original_meta_cols = comp_failure_df.drop(columns=features + ['failure_category', 'component'])
    for col in original_meta_cols.columns:
        synthetic_df[col] = comp_failure_df[col].iloc[0] if not comp_failure_df.empty else 0


    # We only want the newly generated samples, not the original ones that SMOTE includes
    # So we'll drop the original number of samples from the resampled data
    new_samples_df = synthetic_df.iloc[len(X):]
    
    # Add a bit of noise to make the synthetic data more varied
    for feature in features:
        noise = np.random.normal(0, df[feature].std() * 0.05, len(new_samples_df))
        new_samples_df[feature] = new_samples_df[feature] + noise

    augmented_dfs.append(new_samples_df)
    print(f"Generated {len(new_samples_df)} new synthetic samples for {comp_name}.")


# Combine the original 'Normal' data with all failure data (original + synthetic)
final_df = pd.concat([normal_df] + augmented_dfs, ignore_index=True)

# Save the new dataset
output_path = '/Users/saahilp/Hackathon/GearGenie/backend/baseline/synthetic_hierarchical_data.csv'
final_df.to_csv(output_path, index=False)

print("\n--- Synthetic Data Generation Complete ---")
print(f"New dataset saved to: {output_path}")
print("\nFinal data distribution:")
print(final_df['failure_category'].value_counts())
