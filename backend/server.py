import os
import time
from collections import defaultdict

import cv2
import torch
from dotenv import load_dotenv
from flask import Flask, json, jsonify, request
from flask import Response, stream_with_context
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

from twilio.rest import Client
from ultralytics import YOLO

# Load environment variables
load_dotenv()

# Twilio setup
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_number = os.getenv("TWILIO_NUMBER")
recipient_number = os.getenv("RECIPIENT_NUMBER")
client = Client(account_sid, auth_token)

# Flask App
app = Flask(__name__)

# Global flags
SMS_ENABLED = True
GEOFENCE_ALERT_ENABLED = False

# Load model
try:
    model = YOLO(os.getenv("PT_FILE"))
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[INFO] Model loaded on {device}")
except Exception as e:
    print(f"[ERROR] Failed to load model: {e}")
    model = None

def send_sms_alert(message_body):
    if SMS_ENABLED:
        try:
            message = client.messages.create(
                body=message_body,
                from_=twilio_number,
                to=recipient_number
            )
            return f"SMS sent: {message_body} (SID: {message.sid})"
        except Exception as e:
            return f"Failed to send SMS: {e}"
    else:
        return f"SMS Disabled: {message_body}"

@app.route('/analyze', methods=['POST'])
def analyze_video():
    if model is None:
        return jsonify({"error": "Model not loaded."}), 500

    video_path = os.getenv("VIDEO_FEED")
    if not video_path or not os.path.exists(video_path):
        return jsonify({"error": f"Video path invalid or does not exist: {video_path}"}), 400

    @stream_with_context
    def generate():
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            yield f"data: {{\"error\": \"Could not open video.\"}}\n\n"
            return

        geofence_line_y = 50
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        frame_skip = 2
        frame_count = 0
        id_lifetime_frames = 30
        active_fish_ids = {}
        species_count = defaultdict(int)
        last_alert_time = 0
        alert_interval = 3600

        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    yield f"data: {{\"event\": \"end\", \"message\": \"Video ended.\"}}\n\n"
                    break

                if frame_count % frame_skip == 0:
                    result = model.track(frame, persist=True, conf=0.5, iou=0.5)
                    current_frame = frame_count
                    geofence_crossed = False
                    species_count.clear()

                    for obj in result[0].boxes:
                        if hasattr(obj, 'id') and obj.id is not None:
                            object_id = int(obj.id)
                            active_fish_ids[object_id] = current_frame

                        if hasattr(obj, 'cls') and obj.cls is not None:
                            class_id = int(obj.cls[0]) if isinstance(obj.cls, torch.Tensor) else int(obj.cls)
                            class_name = model.names.get(class_id, "Unknown")
                            species_count[class_name] += 1

                        x1, y1, x2, y2 = obj.xyxy[0].cpu().numpy()
                        if y2 > geofence_line_y:
                            geofence_crossed = True

                    active_fish_ids = {id: frame for id, frame in active_fish_ids.items()
                                       if current_frame - frame <= id_lifetime_frames}

                    total_fish_count = len(active_fish_ids)

                    # Optionally: SMS alert
                    current_time = time.time()
                    if GEOFENCE_ALERT_ENABLED and geofence_crossed and (current_time - last_alert_time > alert_interval):
                        send_sms_alert("ALERT: Geofence line crossed! Oxygen levels may be low.")
                        last_alert_time = current_time

                    # Yield data as JSON chunk
                    data = {
                        # "frame": frame_count,
                        "total_fish": total_fish_count,
                        "species": dict(species_count),
                        "geofence_crossed": geofence_crossed
                    }
                    yield f"data: {json.dumps(data)}\n\n"

                frame_count += 1

            cap.release()
        except Exception as e:
            cap.release()
            yield f"data: {{\"error\": \"{str(e)}\"}}\n\n"

    return Response(generate(), mimetype="text/event-stream")

@app.route('/video_feed',methods=["GET"])
def video_feed():
    def generate_frames():
        cap = cv2.VideoCapture(os.getenv("VIDEO_FEED"))
        model = YOLO(os.getenv("PT_FILE"))

        while True:
            success, frame = cap.read()
            if not success:
                break

            # Run detection and draw boxes
            results = model.predict(frame, conf=0.5)
            for r in results:
                for box in r.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    label = model.names[int(box.cls[0])]
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)
                    cv2.putText(frame, label, (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

            # Encode and yield frame
            _, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/', methods=['GET'])
def root():
    return jsonify({"message": "AquaAnalyzer API is up and running!"}), 200

if __name__ == '__main__':
    # app.run(debug=True)
    app.run(host="0.0.0.0", port=5000, debug=True)
