import cv2
from ultralytics import YOLO
import torch
import os
import time
from twilio.rest import Client
from collections import defaultdict
from dotenv import load_dotenv
import os

load_dotenv()

# Twilio Setup
account_sid = ''  # Twilio Account SID
auth_token = ''    # Twilio Auth Token
twilio_number = '+'  # Twilio phone number
recipient_number = ''  # Your smartphone number
client = Client(account_sid, auth_token)

# Global flags to enable/disable functionalities
SMS_ENABLED = True   # Change to False to disable SMS alerts
GEOFENCE_ALERT_ENABLED = False # Toggle for geofence crossing alerts

# Function to send SMS alert
def send_sms_alert(message_body):
    if SMS_ENABLED:
        try:
            message = client.messages.create(
                body=message_body,
                from_=twilio_number,
                to=recipient_number
            )
            print(f"SMS sent: {message_body} (SID: {message.sid})")
        except Exception as e:
            print(f"Failed to send SMS: {e}")
    else:
        print(f"SMS Disabled: {message_body}")

# Notify that the system is live
send_sms_alert("AquaAnalyzer System is Live: Monitoring has started.")

# Load the trained model
model = YOLO(os.getenv("PT_FILE"))
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Video path
video_path = os.getenv("VIDEO_FEED")
if not os.path.exists(video_path):
    print(f"Error: Video path does not exist: {video_path}")
    exit()

cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

# Settings
geofence_line_y = 50  # Geofence line y-coordinate
fps = cap.get(cv2.CAP_PROP_FPS)
if fps == 0:
    print("Warning: Unable to fetch FPS. Defaulting to 30.")
    fps = 30

frame_skip = 2
delay = int(1000 / fps)
frame_count = 0
id_lifetime_frames = 30
active_fish_ids = {}
species_count = defaultdict(int)

# Track last alert time
last_alert_time = 0
alert_interval = 3600  # 1 hour in seconds

# Custom colors
BOX_COLOR = (135, 206, 250)
TEXT_COLOR = (0, 0, 0)  # Black text color
TEXT_BG_COLOR = (255, 255, 255)  # White background
LINE_THICKNESS = 2

# Font settings
font_scale = 0.8
font_thickness = 2

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

            # Draw the geofence line
            cv2.line(frame, (0, geofence_line_y), (frame.shape[1], geofence_line_y), (0, 255, 0), 2)

            for obj in results[0].boxes:
                if hasattr(obj, 'id') and obj.id is not None:
                    object_id = int(obj.id)
                    active_fish_ids[object_id] = current_frame

                if hasattr(obj, 'cls') and obj.cls is not None:
                    class_id = int(obj.cls[0]) if isinstance(obj.cls, torch.Tensor) else int(obj.cls)
                    class_name = model.names.get(class_id, "Unknown")
                    species_count[class_name] += 1

                x1, y1, x2, y2 = obj.xyxy[0].cpu().numpy()

                # Draw bounding box
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), BOX_COLOR, LINE_THICKNESS)

                # Label with fish ID and species
                label = f"id:{object_id} {class_name.upper()}"
                text_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)[0]
                text_x, text_y = int(x1), int(y1) - 10
                cv2.rectangle(frame, (text_x, text_y - text_size[1] - 5),
                              (text_x + text_size[0], text_y + 5), TEXT_BG_COLOR, -1)
                cv2.putText(frame, label, (text_x, text_y),
                            cv2.FONT_HERSHEY_SIMPLEX, font_scale, TEXT_COLOR, font_thickness)

                # Check for geofence crossing
                if y2 > geofence_line_y:
                    geofence_crossed = True

            # Remove inactive fish IDs
            active_fish_ids = {id: frame for id, frame in active_fish_ids.items()
                               if current_frame - frame <= id_lifetime_frames}

            # Display total fish count
            total_fish_count = len(active_fish_ids)
            total_text = f"Total Fish Count: {total_fish_count}"
            total_text_size = cv2.getTextSize(total_text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)[0]
            total_text_x, total_text_y = 10, 30
            cv2.rectangle(frame, (total_text_x - 5, total_text_y - total_text_size[1] - 10),
                          (total_text_x + total_text_size[0] + 10, total_text_y + 10), TEXT_BG_COLOR, -1)
            cv2.putText(frame, total_text, (total_text_x, total_text_y),
                        cv2.FONT_HERSHEY_SIMPLEX, font_scale, TEXT_COLOR, font_thickness)

            # Display species count below total count with proper alignment
            y_offset = total_text_y + 30  # Add spacing below the total count
            for species, count in species_count.items():
                species_text = f"{species}: {count}"
                species_text_size = cv2.getTextSize(species_text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)[0]
                cv2.rectangle(frame, (total_text_x - 5, y_offset - species_text_size[1] - 10),
                              (total_text_x + species_text_size[0] + 10, y_offset + 10), TEXT_BG_COLOR, -1)
                cv2.putText(frame, species_text, (total_text_x, y_offset),
                            cv2.FONT_HERSHEY_SIMPLEX, font_scale, TEXT_COLOR, font_thickness)
                y_offset += 40  # Add spacing for the next line

            # Send SMS alert if geofence is crossed and alerts are enabled
            current_time = time.time()
            if GEOFENCE_ALERT_ENABLED and geofence_crossed and (current_time - last_alert_time > alert_interval):
                send_sms_alert("ALERT: Geofence line crossed! Oxygen levels may be low.")
                print("ALERT: Geofence line crossed! Oxygen levels may be low.")
                last_alert_time = current_time

            # Display resized frame
            height, width = frame.shape[:2]
            if width > 0 and height > 0:
                new_width = 1080
                new_height = int((new_width / width) * height)
                frame_resized = cv2.resize(frame, (new_width, new_height))
                cv2.imshow('frame', frame_resized)
            else:
                print("Error: Invalid frame dimensions.")

        except Exception as e:
            print(f"Error during processing frame {frame_count}: {e}")

    frame_count += 1
    if cv2.waitKey(delay // frame_skip) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()