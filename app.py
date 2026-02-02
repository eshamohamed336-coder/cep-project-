from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime, timedelta

app = Flask(__name__)

DATA_FILE = 'data.json'

# Initial Seed Data
seed_data = {
    "events": [
        {
            "id": "1",
            "title": "Cyber Nexus Hackathon",
            "date": "Feb 12, 2026",
            "description": "24 hours of coding, caffeine, and creativity. Build the future.",
            "location": "Main Auditorium",
            "category": "technical",
            "department": "BCA",
            "bgClass": "tech-bg",
            "image": None,
            "timestamp": datetime.now().isoformat()
        },
        {
            "id": "2",
            "title": "RoboWars 2.0",
            "date": "Feb 13, 2026",
            "description": "Build your bot and battle for supremacy in the arena.",
            "location": "Lab Complex",
            "category": "technical",
            "department": "B.Sc IT",
            "bgClass": "robotics-bg",
            "image": None,
            "timestamp": datetime.now().isoformat()
        },
        {
            "id": "3",
            "title": "Cloud Architecture Masters",
            "date": "Feb 14, 2026",
            "description": "Design scalable solutions using the latest cloud tech.",
            "location": "Networking Lab",
            "category": "technical",
            "department": "B.Sc CS",
            "bgClass": "workshop-bg",
            "image": None,
            "timestamp": datetime.now().isoformat()
        },
        {
            "id": "4",
            "title": "Full Stack Challenge",
            "date": "Feb 16, 2026",
            "description": "Build a complete web app from scratch in 6 hours.",
            "location": "Programming Lab",
            "category": "technical",
            "department": "B.Sc IT",
            "bgClass": "tech-bg",
            "image": None,
            "timestamp": datetime.now().isoformat()
        },
        {
             "id": "5",
             "title": "Neon Nights: Dance Off",
             "date": "Feb 15, 2026",
             "description": "Showcase your moves under the neon lights.",
             "location": "Open Air Theatre",
             "category": "non-technical",
             "department": "VisCom",
             "bgClass": "cultural-bg",
             "image": None,
             "timestamp": datetime.now().isoformat()
        },
        {
             "id": "6",
             "title": "Inter-Hostel Football",
             "date": "Feb 18, 2026",
             "description": "The ultimate showdown. Come support your team!",
             "location": "Sports Complex",
             "category": "non-technical",
             "department": "BBA",
             "bgClass": "sports-bg",
             "image": None,
             "timestamp": datetime.now().isoformat()
        },
        {
             "id": "7",
             "title": "Corporate Quest Quiz",
             "date": "Feb 20, 2026",
             "description": "Test your business knowledge in this high-intensity quiz.",
             "location": "B.Com Block",
             "category": "non-technical",
             "department": "B.Com",
             "bgClass": "gaming-bg",
             "image": None,
             "timestamp": datetime.now().isoformat()
        },
        {
             "id": "8",
             "title": "Creative Art Expo",
             "date": "Feb 22, 2026",
             "description": "Showcase your visual artistry to the entire campus.",
             "location": "Main Hall",
             "category": "non-technical",
             "department": "VisCom",
             "bgClass": "cultural-bg",
             "image": None,
             "timestamp": datetime.now().isoformat()
        }
    ],
    "registrations": []
}

def cleanup_old_data(data):
    """Delete entries older than 2 weeks."""
    now = datetime.now()
    two_weeks_ago = now - timedelta(days=14)
    
    # Helper to parse timestamp
    def is_old(entry_timestamp):
        if not entry_timestamp:
            return False
        try:
            # Handle both ISO formats (with and without Z)
            ts_str = entry_timestamp.replace('Z', '+00:00')
            ts = datetime.fromisoformat(ts_str)
            # If ts is naive and now is naive, just compare. if one is aware, we need to handle it.
            # datetime.now() is naive. fromisoformat might be aware if it has +00:00.
            if ts.tzinfo is not None:
                ts = ts.replace(tzinfo=None) # Keep it simple for this local app
            return ts < two_weeks_ago
        except:
            return False

    # Cleanup events
    data['events'] = [e for e in data.get('events', []) if not is_old(e.get('timestamp'))]
    
    # Cleanup registrations
    data['registrations'] = [r for r in data.get('registrations', []) if not is_old(r.get('timestamp'))]
    
    return data

def load_data():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'w') as f:
            json.dump(seed_data, f, indent=4)
        return seed_data
    with open(DATA_FILE, 'r') as f:
        data = json.load(f)
    
    # Perform cleanup every time data is loaded
    cleaned_data = cleanup_old_data(data)
    if cleaned_data != data:
        save_data(cleaned_data)
    return cleaned_data

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/student')
def student():
    return render_template('student.html')

@app.route('/staff')
def staff():
    return render_template('staff.html')

@app.route('/api/events', methods=['GET'])
def get_events():
    data = load_data()
    return jsonify(data['events'])

@app.route('/api/events', methods=['POST'])
def add_event():
    new_event = request.json
    if 'timestamp' not in new_event:
        new_event['timestamp'] = datetime.now().isoformat()
    data = load_data()
    data['events'].append(new_event)
    save_data(data)
    return jsonify({"status": "success"}), 201

@app.route('/api/register', methods=['POST'])
def register_student():
    reg_info = request.json
    if 'timestamp' not in reg_info:
        reg_info['timestamp'] = datetime.now().isoformat()
    data = load_data()
    data['registrations'].append(reg_info)
    save_data(data)
    return jsonify({"status": "success"}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)
