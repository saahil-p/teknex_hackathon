import pandas as pd
from imblearn.over_sampling import SMOTE
from sklearn.preprocessing import LabelEncoder

# Load the dataset
try:
    df = pd.read_csv('/Users/saahilp/Hackathon/GearGenie/backend/baseline/demo_risk_dataset.csv')
except FileNotFoundError:
    print("Error: demo_risk_dataset.csv not found. Please check the file path.")
    exit()

# Feature selection
features = [
    'odometer_reading', 'engine_temp_c', 'engine_rpm', 'oil_pressure_psi',
    'coolant_temp_c', 'fuel_level_percent', 'fuel_consumption_lph',
    'engine_load_percent', 'throttle_pos_percent', 'air_flow_rate_gps',
    'exhaust_gas_temp_c', 'vibration_level', 'engine_hours',
    'brake_fluid_level_psi', 'brake_pad_wear_mm', 'brake_temp_c',
    'abs_fault_indicator', 'brake_pedal_pos_percent', 'wheel_speed_fl_kph',
    'wheel_speed_fr_kph', 'wheel_speed_rl_kph', 'wheel_speed_rr_kph',
    'battery_voltage_v', 'battery_current_a', 'battery_temp_c',
    'alternator_output_v', 'battery_charge_percent', 'battery_health_percent',
    'vehicle_speed_kph', 'ambient_temp_c', 'humidity_percent'
]

target = 'failure_type'

# Drop rows with missing target values and features
df_class = df.dropna(subset=[target] + features).copy()

# Encode the target variable
le = LabelEncoder()
df_class[target] = le.fit_transform(df_class[target])

X = df_class[features]
y = df_class[target]

# Handle class imbalance using SMOTE
# We need to adjust k_neighbors for classes with very few samples
n_samples_per_class = y.value_counts()
min_samples = n_samples_per_class.min()
k_neighbors = 1 if min_samples <= 2 else min(5, min_samples - 1)

print(f"Using k_neighbors={k_neighbors} for SMOTE.")
smote = SMOTE(random_state=42, k_neighbors=k_neighbors)
X_resampled, y_resampled = smote.fit_resample(X, y)

# Create a new DataFrame with the augmented data
df_augmented = pd.DataFrame(X_resampled, columns=features)
df_augmented[target] = y_resampled

# Decode the target variable back to its original string representation
df_augmented[target] = le.inverse_transform(df_augmented[target])

# Save the augmented dataset to a new CSV file
output_path = '/Users/saahilp/Hackathon/GearGenie/backend/baseline/augmented_risk_dataset.csv'
df_augmented.to_csv(output_path, index=False)

print(f"\nAugmented dataset saved to: {output_path}")
print("\nOriginal class distribution:")
print(y.value_counts())
print("\nAugmented class distribution:")
print(df_augmented[target].value_counts())
