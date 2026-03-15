from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import random

app = Flask(__name__)
CORS(app) # Enable CORS for all routes (necessary for backend-to-ML communication)

# Mock model prediction logic
def predict_medication_adherence(data):
    # Simulated logic: older age + previous low adherence = higher risk
    age = data.get('age', 30)
    history = data.get('previous_adherence', 0.8)
    # Higher adherence score (0-1) means more likely to adhere
    score = (history * 0.7) + (random.uniform(0, 0.3))
    return round(min(score, 1.0), 2)

def predict_no_show(data):
    # Simulated logic: morning appointments + long distance = higher no-show risk
    distance = data.get('distance_km', 5)
    time_slot = data.get('is_morning', True)
    # Higher score = higher probability of NO-SHOW
    prob = (0.2 if time_slot else 0.4) + (distance * 0.05)
    return round(min(prob, 0.95), 2)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "CareSync ML Microservice"})

@app.route('/predict/adherence', methods=['POST'])
def adherence():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        start_time = time.time()
        probability = predict_medication_adherence(data)
        latency = (time.time() - start_time) * 1000
        
        return jsonify({
            "probability": probability,
            "risk_level": "High" if probability < 0.6 else "Low",
            "latency_ms": round(latency, 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict/no-show', methods=['POST'])
def no_show():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        start_time = time.time()
        probability = predict_no_show(data)
        latency = (time.time() - start_time) * 1000
        
        return jsonify({
            "probability": probability,
            "can_book_overflow": True if probability > 0.7 else False,
            "latency_ms": round(latency, 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
