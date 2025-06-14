import os
import time
import threading
from collections import defaultdict

import cv2
import torch
from dotenv import load_dotenv
from flask import Flask, json, jsonify, request
from flask import Response, stream_with_context
from flask_cors import CORS
from twilio.rest import Client
from ultralytics import YOLO

# Load environment variables
load_dotenv()

# Flask App
app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/video_feed": {"origins": "http://localhost:3000"}})

# Twilio setup
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_number = os.getenv("TWILIO_NUMBER")
recipient_number = os.getenv("RECIPIENT_NUMBER")
client = Client(account_sid, auth_token)

# Global flags
SMS_ENABLED = True
GEOFENCE_ALERT_ENABLED = False

# Shared variables for analysis results (thread-safe with locks)
analysis_lock = threading.Lock()
current_analysis = {
    "total_fish": 0,
    "species_count": {},
    "active_fish_ids": {},
    "geofence_crossed": False,
    "frame_count": 0,
    "last_update": time.time(),
    "system_status": "initializing"
}

# Load model
try:
    model = YOLO(os.getenv("PT_FILE"))
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[INFO] Model loaded on {device}")
    
    # Send system startup SMS
    def send_startup_sms():
        send_sms_alert("AquaAnalyzer System is Live: Monitoring has started.")
    
    # Send startup SMS in a separate thread to avoid blocking
    threading.Thread(target=send_startup_sms, daemon=True).start()
    
except Exception as e:
    print(f"[ERROR] Failed to load model: {e}")
    model = None

def send_sms_alert(message_body):
    """Send SMS alert using Twilio"""
    if SMS_ENABLED:
        try:
            message = client.messages.create(
                body=message_body,
                from_=twilio_number,
                to=recipient_number
            )
            print(f"SMS sent: {message_body} (SID: {message.sid})")
            return f"SMS sent: {message_body} (SID: {message.sid})"
        except Exception as e:
            print(f"Failed to send SMS: {e}")
            return f"Failed to send SMS: {e}"
    else:
        print(f"SMS Disabled: {message_body}")
        return f"SMS Disabled: {message_body}"

def update_analysis_results(total_fish, species_count, active_fish_ids, geofence_crossed, frame_count):
    """Thread-safe update of analysis results"""
    global current_analysis
    with analysis_lock:
        current_analysis.update({
            "total_fish": total_fish,
            "species_count": dict(species_count),
            "active_fish_ids": dict(active_fish_ids),
            "geofence_crossed": geofence_crossed,
            "frame_count": frame_count,
            "last_update": time.time(),
            "system_status": "running"
        })

def get_analysis_results():
    """Thread-safe get analysis results"""
    with analysis_lock:
        return current_analysis.copy()

def run_fish_detection_analysis():
    """Core fish detection and analysis logic from main.py"""
    if model is None:
        print("[ERROR] Model not loaded for analysis")
        return

    video_path = os.getenv("VIDEO_FEED")
    if not video_path or not os.path.exists(video_path):
        print(f"[ERROR] Video path invalid: {video_path}")
        return

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("[ERROR] Could not open video for analysis")
        return

    # Settings from main.py
    geofence_line_y = 50
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0:
        print("Warning: Unable to fetch FPS. Defaulting to 30.")
        fps = 30

    frame_skip = 2
    frame_count = 0
    id_lifetime_frames = 30
    active_fish_ids = {}
    species_count = defaultdict(int)
    
    # Track last alert time
    last_alert_time = 0
    alert_interval = 3600  # 1 hour in seconds

    print("[INFO] Starting fish detection analysis...")

    try:
        while True:
            ret, frame = cap.read()

            if not ret:
                print("Reached the end of the video. Restarting...")
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                frame_count = 0
                active_fish_ids.clear()
                species_count.clear()
                continue

            if frame_count % frame_skip == 0:
                try:
                    results = model.track(frame, persist=True, conf=0.5, iou=0.5)
                    current_frame = frame_count
                    geofence_crossed = False
                    species_count.clear()  # Reset species count for the current frame

                    for obj in results[0].boxes:
                        if hasattr(obj, 'id') and obj.id is not None:
                            object_id = int(obj.id)
                            active_fish_ids[object_id] = current_frame

                        if hasattr(obj, 'cls') and obj.cls is not None:
                            class_id = int(obj.cls[0]) if isinstance(obj.cls, torch.Tensor) else int(obj.cls)
                            class_name = model.names.get(class_id, "Unknown")
                            species_count[class_name] += 1

                        x1, y1, x2, y2 = obj.xyxy[0].cpu().numpy()

                        # Check for geofence crossing
                        if y2 > geofence_line_y:
                            geofence_crossed = True

                    # Remove inactive fish IDs
                    active_fish_ids = {id: frame for id, frame in active_fish_ids.items()
                                       if current_frame - frame <= id_lifetime_frames}

                    total_fish_count = len(active_fish_ids)

                    # Update shared analysis results
                    update_analysis_results(total_fish_count, species_count, active_fish_ids, geofence_crossed, frame_count)

                    # Send SMS alert if geofence is crossed and alerts are enabled
                    current_time = time.time()
                    if GEOFENCE_ALERT_ENABLED and geofence_crossed and (current_time - last_alert_time > alert_interval):
                        threading.Thread(target=lambda: send_sms_alert("ALERT: Geofence line crossed! Oxygen levels may be low."), daemon=True).start()
                        last_alert_time = current_time

                except Exception as e:
                    print(f"Error during processing frame {frame_count}: {e}")

            frame_count += 1

    except Exception as e:
        print(f"[ERROR] Analysis loop error: {e}")
    finally:
        cap.release()

# Start analysis in background thread
def start_analysis_thread():
    """Start the analysis thread"""
    analysis_thread = threading.Thread(target=run_fish_detection_analysis, daemon=True)
    analysis_thread.start()
    print("[INFO] Analysis thread started")

@app.route('/video_feed', methods=["GET"])
def video_feed():
    """Stream plain video frames without annotations"""
    def generate_frames():
        cap = cv2.VideoCapture(os.getenv("VIDEO_FEED"))
        
        if not cap.isOpened():
            print("[ERROR] Could not open video for streaming")
            return

        try:
            while True:
                success, frame = cap.read()
                if not success:
                    # Restart video when it ends
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue

                # Resize frame to match main.py behavior
                height, width = frame.shape[:2]
                if width > 0 and height > 0:
                    new_width = 1080
                    new_height = int((new_width / width) * height)
                    frame_resized = cv2.resize(frame, (new_width, new_height))
                else:
                    frame_resized = frame

                # Encode and yield frame (plain video, no annotations)
                _, buffer = cv2.imencode('.jpg', frame_resized)
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

        except Exception as e:
            print(f"[ERROR] Video streaming error: {e}")
        finally:
            cap.release()

    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/analyze', methods=['GET'])
def get_analysis():
    """Get current analysis results"""
    if model is None:
        return jsonify({"error": "Model not loaded."}), 500

    results = get_analysis_results()
    
    # Add additional metadata
    results.update({
        "timestamp": time.time(),
        "sms_enabled": SMS_ENABLED,
        "geofence_alert_enabled": GEOFENCE_ALERT_ENABLED
    })
    
    return jsonify(results), 200

@app.route('/analyze_stream', methods=['GET'])
def stream_analysis():
    """Stream analysis results as Server-Sent Events"""
    if model is None:
        return jsonify({"error": "Model not loaded."}), 500

    def generate():
        last_update = 0
        while True:
            results = get_analysis_results()
            
            # Only send update if data has changed
            if results["last_update"] > last_update:
                last_update = results["last_update"]
                results.update({
                    "timestamp": time.time(),
                    "sms_enabled": SMS_ENABLED,
                    "geofence_alert_enabled": GEOFENCE_ALERT_ENABLED
                })
                yield f"data: {json.dumps(results)}\n\n"
            
            time.sleep(0.1)  # Check for updates every 100ms

    return Response(generate(), mimetype="text/event-stream")

@app.route('/settings', methods=['GET', 'POST'])
def settings():
    """Get or update system settings"""
    global SMS_ENABLED, GEOFENCE_ALERT_ENABLED
    
    if request.method == 'GET':
        return jsonify({
            "sms_enabled": SMS_ENABLED,
            "geofence_alert_enabled": GEOFENCE_ALERT_ENABLED
        }), 200
    
    elif request.method == 'POST':
        data = request.get_json()
        
        if 'sms_enabled' in data:
            SMS_ENABLED = bool(data['sms_enabled'])
        
        if 'geofence_alert_enabled' in data:
            GEOFENCE_ALERT_ENABLED = bool(data['geofence_alert_enabled'])
        
        return jsonify({
            "message": "Settings updated successfully",
            "sms_enabled": SMS_ENABLED,
            "geofence_alert_enabled": GEOFENCE_ALERT_ENABLED
        }), 200

@app.route('/send_test_sms', methods=['POST'])
def send_test_sms():
    """Send a test SMS"""
    data = request.get_json()
    message = data.get('message', 'Test message from AquaAnalyzer')
    
    result = send_sms_alert(message)
    return jsonify({"result": result}), 200

@app.route('/status', methods=['GET'])
def system_status():
    """Get system status"""
    results = get_analysis_results()
    
    return jsonify({
        "system_status": results["system_status"],
        "model_loaded": model is not None,
        "last_update": results["last_update"],
        "uptime": time.time() - results.get("start_time", time.time()),
        "frame_count": results["frame_count"],
        "device": str(device) if model else "N/A"
    }), 200

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({"message": "AquaAnalyzer API is up and running!"}), 200

if __name__ == '__main__':
    # Start analysis thread before running the server
    if model is not None:
        start_analysis_thread()
        time.sleep(2)  # Give analysis thread time to start
    
    print(f"[INFO] Starting Flask server on http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)