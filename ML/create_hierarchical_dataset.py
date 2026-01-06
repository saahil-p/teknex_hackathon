import pandas as pd
import numpy as np

print("Loading the original dataset...")
try:
    df = pd.read_csv('/Users/saahilp/Hackathon/GearGenie/backend/baseline/demo_risk_dataset.csv')
except FileNotFoundError:
    print("Error: demo_risk_dataset.csv not found. Make sure the path is correct.")
    exit()

print("Processing data to create hierarchical structure...")

# Define mappings from specific failures to components
engine_failures = [
    'Catalytic Converter Failure', 'Coolant Leak', 'Engine Oil Replacement',
    'Fuel Injector Failure', 'Fuel Pump Failure', 'Ignition Coil Failure',
    'Mass Airflow Sensor Failure', 'Oxygen Sensor Failure', 'Spark Plug Failure',
    'Timing Chain Failure', 'Transmission Failure'
]
brake_failures = ['ABS sensor failure', 'Brakes worn out']
battery_failures = ['CCA less than limit', 'Low on Charge']

def get_component(failure_type):
    if failure_type in engine_failures:
        return 'Engine'
    elif failure_type in brake_failures:
        return 'Brake'
    elif failure_type in battery_failures:
        return 'Battery'
    else:
        return 'None'

df['component'] = df['failure_type'].apply(get_component)

# Create component-specific RULs
# If a component is failing, its RUL is the main RUL. Otherwise, set a high RUL (e.g., max RUL in dataset).
max_rul = df['RUL'].max()
df['RUL_Engine'] = np.where(df['component'] == 'Engine', df['RUL'], max_rul)
df['RUL_Brake'] = np.where(df['component'] == 'Brake', df['RUL'], max_rul)
df['RUL_Battery'] = np.where(df['component'] == 'Battery', df['RUL'], max_rul)

# Clean up the failure_type for classification (set to 'No Failure' if component is 'None')
df['failure_category'] = np.where(df['component'] == 'None', 'No Failure', df['failure_type'])


# Select relevant columns for the new dataset
output_columns = [
    # Identifiers
    'vehicle_id', 'timestamp',
    # Sensor data (features)
    'odometer_reading', 'engine_temp_c', 'engine_rpm', 'oil_pressure_psi',
    'coolant_temp_c', 'fuel_level_percent', 'fuel_consumption_lph',
    'engine_load_percent', 'throttle_pos_percent', 'air_flow_rate_gps',
    'exhaust_gas_temp_c', 'vibration_level', 'engine_hours',
    'brake_fluid_level_psi', 'brake_pad_wear_mm', 'brake_temp_c',
    'abs_fault_indicator', 'brake_pedal_pos_percent', 'wheel_speed_fl_kph',
    'wheel_speed_fr_kph', 'wheel_speed_rl_kph', 'wheel_speed_rr_kph',
    'battery_voltage_v', 'battery_current_a', 'battery_temp_c',
    'alternator_output_v', 'battery_charge_percent', 'battery_health_percent',
    'vehicle_speed_kph', 'ambient_temp_c', 'humidity_percent',
    # Hierarchical Targets
    'component', 'failure_category',
    'RUL_Engine', 'RUL_Brake', 'RUL_Battery'
]

df_hierarchical = df[output_columns].copy()

# Save the new dataset
output_path = '/Users/saahilp/Hackathon/GearGenie/backend/baseline/hierarchical_vehicle_data.csv'
df_hierarchical.to_csv(output_path, index=False)

print(f"Successfully created hierarchical dataset at: {output_path}")
print("\nNew dataset structure:")
print(df_hierarchical.head())
print("\nComponent distribution:")
print(df_hierarchical['component'].value_counts())
