import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Create a directory to save the plots
output_dir = '/Users/saahilp/Hackathon/EDA/plots'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Load the dataset
try:
    df = pd.read_csv('/Users/saahilp/Hackathon/GearGenie/backend/baseline/demo_risk_dataset.csv')
except Exception as e:
    print(f"Error loading CSV: {e}")
    exit()

# --- 1. Basic Information ---
print("--- Dataset Info ---")
df.info()
print("\n--- Descriptive Statistics ---")
print(df.describe())
print("\n--- First 5 Rows ---")
print(df.head())


# --- 2. Data Visualization ---

# Identify column types
numerical_cols = df.select_dtypes(include=['float64', 'int64']).columns
categorical_cols = df.select_dtypes(include=['object']).columns
# Exclude high-cardinality categorical columns from plotting for clarity
categorical_cols = [col for col in categorical_cols if df[col].nunique() < 20 and col not in ['vehicle_id', 'timestamp', 'failure_date']]


# Plot histograms for numerical columns
print("\n--- Generating Histograms for Numerical Data ---")
for col in numerical_cols:
    plt.figure(figsize=(10, 6))
    sns.histplot(df[col], kde=True)
    plt.title(f'Distribution of {col}')
    plt.xlabel(col)
    plt.ylabel('Frequency')
    plt.savefig(os.path.join(output_dir, f'{col}_histogram.png'))
    plt.close()
print(f"Saved histograms to {output_dir}")


# Plot count plots for categorical columns
print("\n--- Generating Count Plots for Categorical Data ---")
for col in categorical_cols:
    plt.figure(figsize=(10, 6))
    sns.countplot(y=df[col], order = df[col].value_counts().index)
    plt.title(f'Count of {col}')
    plt.xlabel('Count')
    plt.ylabel(col)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, f'{col}_countplot.png'))
    plt.close()
print(f"Saved count plots to {output_dir}")


# --- 3. Correlation Analysis ---
print("\n--- Generating Correlation Matrix ---")
# Select only numerical columns for correlation matrix
corr_matrix = df[numerical_cols].corr()

plt.figure(figsize=(20, 15))
sns.heatmap(corr_matrix, annot=False, cmap='coolwarm')
plt.title('Correlation Matrix of Numerical Features')
plt.savefig(os.path.join(output_dir, 'correlation_matrix.png'))
plt.close()
print(f"Saved correlation matrix to {output_dir}")

print("\n--- EDA Script Finished ---")
