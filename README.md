# 🐟 AquaAnalyzer – Smart Fish Detection & Monitoring System

**AquaAnalyzer** is an open-source AI-powered fish detection and monitoring system built for smart fisheries, aquaculture farms, and research applications.

Using state-of-the-art computer vision (YOLOv8), real-time video feeds, and digital geofencing, the system can:
- Detect and count fish
- Identify species
- Track movement across frames
- Trigger SMS alerts based on behavior (e.g., geofence breach, low oxygen indicators)

AquaAnalyzer is built with modularity and scalability in mind — and we're excited to welcome contributions from the open-source community!

> ⚡ This project is part of an academic research initiative at Modern College Shivajinagar, Pune.

## 🚀 Features

### 🧠 Core Functionality

- **🎯 Real-Time Fish Detection**  
  Uses YOLOv8 for real-time object detection to locate and track fish in live video feeds.

- **🐠 Species Identification**  
  Accurately classifies fish species using a custom-trained image dataset.

- **📊 Fish Count Monitoring**  
  Maintains total fish count and species-wise count using persistent tracking and unique fish IDs.

- **📏 Digital Geofencing**  
  Monitors virtual zones within the tank/pond to trigger alerts when fish cross boundaries (e.g., oxygen-stress behavior).

- **📨 SMS Alerts via Twilio**  
  Sends instant SMS notifications for events such as:
  - Fish crossing the geofence
  - Sudden drop in total fish count (e.g., death, escape, overcrowding)

### 🔬 Research-Backed Architecture

- Computer Vision pipeline built on real-world datasets
- Empirically tuned detection thresholds (IOU, Precision-Recall)
- Annotated using [Make Sense](https://github.com/SkalskiP/make-sense) for optimal training quality

---

### 🔧 Planned Enhancements

- **🧪 Integration with Dissolved Oxygen Sensors**  
  Combine behavioral geofencing with real-time sensor data for more reliable oxygen level alerts.

- **🧬 Multi-Species Support**  
  Expand training dataset and classes to support a wider range of freshwater and marine fish.

- **🤖 Semi-Automated Labeling**  
  Speed up dataset creation using pre-trained models and active learning loops.

- **🖥️ Multi-Camera Aggregation**  
  Support for distributed camera feeds and a unified dashboard for large-scale deployments.

- **📈 Analytics Dashboard** *(community-contribution welcome)*  
  Build a web-based dashboard to visualize population trends, alerts, and water conditions.

## 🛠 Tech Stack

### ⚙️ Core Technologies

- **Python 3.11+**
- **YOLOv8** – Real-time object detection (via [Ultralytics](https://github.com/ultralytics/ultralytics))
- **OpenCV** – Video processing
- **Twilio API** – SMS notifications
- **Selenium + FatKun + ScrapeTube** – Custom scraping pipeline for dataset creation
- **Make Sense** – Image annotation tool

## ✅ Conclusion

AquaAnalyzer demonstrates the power of combining deep learning, computer vision, and automation to solve real-world problems in fisheries and aquaculture.

It provides a smart, real-time monitoring solution for:
- Fish detection and classification
- Automated fish counting
- Behavioral analysis via digital geofencing
- Alert systems for critical anomalies

Originally developed as part of a research project under the M.Sc. (Computer Applications) program at **Modern College Shivajinagar**, this system is now open for the world to extend, deploy, and improve.

---


