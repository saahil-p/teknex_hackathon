from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import joblib
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import io


# -------------------------------------------------------
# FASTAPI SETUP
# -------------------------------------------------------
app = FastAPI(title="Tekion ML Backend - RUL Predictor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------
# LOAD CLASSIFIER AND RUL MODELS
# -------------------------------------------------------
try:
    classifier_models = {
        "engine":  joblib.load("../../saved_models/classifier_engine_model.pkl"),
        "brake":   joblib.load("../../saved_models/classifier_brake_model.pkl"),
        "battery": joblib.load("../../saved_models/classifier_battery_model.pkl")
    }
    label_encoders = {
        "engine":  joblib.load("../../saved_models/classifier_engine_le.pkl"),
        "brake":   joblib.load("../../saved_models/classifier_brake_le.pkl"),
        "battery": joblib.load("../../saved_models/classifier_battery_le.pkl")
    }
    rul_models = {
        "engine":  joblib.load("../../saved_models/rul_engine_regressor.pkl"),
        "brake":   joblib.load("../../saved_models/rul_brake_regressor.pkl"),
        "battery": joblib.load("../../saved_models/rul_battery_regressor.pkl")
    }
    repair_costs_df = pd.read_csv("../../failure_repair_costs.csv")
    print("✅ All hierarchical models, encoders, and repair data loaded successfully")
except FileNotFoundError as e:
    print(f"❌ Error loading models or data: {e}")
    raise

# Required features for input
base_features = [
    "odometer_reading", "vehicle_speed_kph", "ambient_temp_c", "humidity_percent"
]
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

RUL_THRESHOLD = 30


# -------------------------------------------------------
# DEFAULT FALLBACK VALUES FOR MISSING FIELDS
# -------------------------------------------------------
try:
    defaults = pd.read_csv("baseline/synthetic_hierarchical_data.csv")
    if 'mileage_km' in defaults.columns and 'odometer_reading' not in defaults.columns:
        defaults.rename(columns={'mileage_km': 'odometer_reading'}, inplace=True)
    defaults = defaults.select_dtypes(include=np.number).median()
    print("✅ Baseline defaults loaded successfully")
except FileNotFoundError as e:
    print(f"❌ Error loading baseline CSV: {e}")
    raise


# -------------------------------------------------------
# HIERARCHICAL PREDICTION CORE FUNCTION
# -------------------------------------------------------
def predict_subsystem(sub: str, sample: dict):
    features = component_features[sub]
    classifier = classifier_models[sub]
    le = label_encoders[sub]
    regressor = rul_models[sub]

    input_data = {}
    for f in features:
        value = sample.get(f, None)
        if value is None:
            default_key = 'mileage_km' if f == 'odometer_reading' and 'mileage_km' in defaults else f
            value = float(defaults.get(default_key, 0.0))
        input_data[f] = value
    
    X = pd.DataFrame([input_data])
    print(f"🔄 Predicting {sub} with {len(features)} features...")

    try:
        rul_km = float(regressor.predict(X)[0])
        rul_km = round(max(0.0, rul_km), 2)
    except Exception as e:
        print(f"❌ RUL prediction error for {sub}: {e}")
        rul_km = 100.0 

    failure_category = "No Failure"
    if rul_km < RUL_THRESHOLD:
        try:
            pred_class_encoded = classifier.predict(X)[0]
            failure_category = le.inverse_transform([pred_class_encoded])[0]
            if failure_category == "No Failure":
                failure_category = "General Wear"
        except Exception as e:
            print(f"❌ Classification error for {sub}: {e}")
            failure_category = "Unknown"
    
    if failure_category == "No Failure":
        status = "🟢 Healthy"
        health = int(20 + (rul_km / 120.0) * 80)
    else:
        if rul_km <= 20:
            status = "⚠ Critical - immediate service required"
            health = int((rul_km / 20.0) * 20)
        else:
            status = "🟡 Attention soon"
            health = int(20 + ((rul_km - 20) / (RUL_THRESHOLD - 20)) * 20)

    health = min(max(health, 0), 100)
    print(f"✅ {sub.upper()}: RUL={rul_km}km, Failure Class='{failure_category}', Health={health}%, Status='{status}'")

    return {
        "rul_km": rul_km,
        "health_percent": health,
        "status": status,
        "predicted_failure": failure_category
    }


# -------------------------------------------------------
# REQUEST PAYLOAD FORMAT
# -------------------------------------------------------
class Payload(BaseModel):
    data: dict


# -------------------------------------------------------
# PREDICTION ENDPOINT (Returns JSON with predictions + serviceEstimate)
# -------------------------------------------------------
@app.post("/predict")
def predict(payload: Payload):
    try:
        x = payload.data
        print(f"\n📨 Received prediction request with {len(x)} fields")
        
        result = {
            "engine":  predict_subsystem("engine", x),
            "brake":   predict_subsystem("brake", x),
            "battery": predict_subsystem("battery", x)
        }
        
        # Format the service estimate data for embedding in booking
        services_to_log = []
        total_hours = 0
        total_cost = 0

        for component, prediction in result.items():
            if prediction['predicted_failure'] != "No Failure":
                failure = prediction['predicted_failure']
                cost_row = repair_costs_df[repair_costs_df['failure_category'] == failure]
                
                if not cost_row.empty:
                    hours = float(cost_row['repair_hours'].iloc[0])
                    cost = float(cost_row['repair_cost_usd'].iloc[0])
                    total_hours += hours
                    total_cost += cost
                    
                    services_to_log.append({
                        "component": component.capitalize(),
                        "status": prediction['status'],
                        "recommendedService": failure,
                        "estimatedHours": hours,
                        "estimatedCostUSD": cost
                    })

        estimate_data = {
            "estimates": services_to_log,
            "totalEstimatedHours": total_hours,
            "totalEstimatedCostUSD": total_cost
        } if services_to_log else None
        
        print(f"✅ Prediction complete! Services: {len(services_to_log)}, Total: ${total_cost:.2f}")
        
        return {
            "predictions": result,
            "serviceEstimate": estimate_data
        }
        
    except Exception as e:
        print(f"❌ Prediction endpoint error: {e}")
        return {"error": str(e)}


# -------------------------------------------------------
# PDF GENERATION
# -------------------------------------------------------
def generate_service_pdf(predictions: dict):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Service Estimate", styles['h1']))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("Here is a summary of the recommended services for your vehicle based on the latest sensor data.", styles['Normal']))
    elements.append(Spacer(1, 24))

    data = [["Component", "Status", "Recommended Service", "Est. Hours", "Est. Cost (USD)"]]
    total_cost = 0
    total_hours = 0

    for component, result in predictions.items():
        if result['predicted_failure'] != "No Failure":
            failure = result['predicted_failure']
            cost_row = repair_costs_df[repair_costs_df['failure_category'] == failure]
            
            if not cost_row.empty:
                hours = cost_row['repair_hours'].iloc[0]
                cost = cost_row['repair_cost_usd'].iloc[0]
                total_hours += hours
                total_cost += cost
                data.append([
                    component.capitalize(), 
                    result['status'], 
                    failure, 
                    f"{hours:.1f}", 
                    f"${cost:,.2f}"
                ])

    if len(data) > 1:
        table = Table(data, colWidths=[100, 150, 150, 70, 100])
        style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ])
        table.setStyle(style)
        elements.append(table)
        elements.append(Spacer(1, 24))

        total_data = [["", "", "Total Estimated:", f"{total_hours:.1f} hours", f"${total_cost:,.2f}"]]
        total_table = Table(total_data, colWidths=[100, 150, 150, 70, 100])
        total_style = TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (2, 0), (-1, 0), 'Helvetica-Bold'),
        ])
        total_table.setStyle(total_style)
        elements.append(total_table)
    else:
        elements.append(Paragraph("No immediate service recommendations.", styles['h3']))

    doc.build(elements)
    buffer.seek(0)
    return buffer


# -------------------------------------------------------
# PDF GENERATION ENDPOINT
# -------------------------------------------------------
@app.post("/service-estimate")
def generate_pdf_endpoint(payload: Payload):
    try:
        x = payload.data
        vehicle_id = x.get("id", "UnknownVehicle")
        print(f"\n📄 Generating PDF for vehicle {vehicle_id}")
        
        result = {
            "engine":  predict_subsystem("engine", x),
            "brake":   predict_subsystem("brake", x),
            "battery": predict_subsystem("battery", x)
        }
        
        pdf_buffer = generate_service_pdf(result)
        
        print(f"✅ PDF generated successfully!")
        return StreamingResponse(pdf_buffer, media_type="application/pdf", headers={
            "Content-Disposition": "inline; filename=service_estimate.pdf"
        })
        
    except Exception as e:
        print(f"❌ PDF generation error: {e}")
        return {"error": str(e)}


# -------------------------------------------------------
# HEALTH CHECK ENDPOINT
# -------------------------------------------------------
@app.get("/health")
def health_check():
    return {"status": "ok", "models_loaded": True}