from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import json
import os
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
app.secret_key = 'super_secret_key_college_events'

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
    "registrations": [],
    "students": []
}

def cleanup_old_data(data):
    """Delete registration entries older than 30 days. Events are kept permanently."""
    now = datetime.now()
    thirty_days_ago = now - timedelta(days=30)
    
    # Helper to parse timestamp
    def is_old(entry_timestamp):
        if not entry_timestamp:
            return False
        try:
            # Handle both ISO formats (with and without Z)
            ts_str = entry_timestamp.replace('Z', '+00:00')
            ts = datetime.fromisoformat(ts_str)
            # Ensure we are comparing naive datetimes (or at least consistent ones)
            if ts.tzinfo is not None:
                ts = ts.replace(tzinfo=None)
            return ts < thirty_days_ago
        except Exception as e:
            print(f"Error parsing timestamp: {e}")
            return False

    # Events are never auto-deleted
    # Only cleanup old registrations
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

def send_event_notification(event_title, event_date):
    """Sends email notification to all registered students."""
    data = load_data()
    students = data.get('students', [])
    
    if not students:
        print("No students registered for notifications.")
        return

    # SMTP Configuration (Placeholder - User needs to update these)
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    SENDER_EMAIL = "your-email@gmail.com"
    SENDER_PASSWORD = "your-app-password" # Use App Password for Gmail

    try:
        # For demonstration purposes, we'll just log who we would send to if credentials are not configured
        if SENDER_EMAIL == "your-email@gmail.com":
            print(f"NOTIFICATION SIMULATION: New event '{event_title}' posted for {event_date}.")
            print(f"Would send to: {[s.get('gmail') for s in students]}")
            return

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)

        for student in students:
            email = student.get('gmail')
            if not email: continue

            msg = MIMEMultipart()
            msg['From'] = SENDER_EMAIL
            msg['To'] = email
            msg['Subject'] = f"New Event: {event_title}"

            body = f"Hello {student.get('name')},\n\nA new event has been posted: {event_title}\nDate: {event_date}\n\nCheck it out on the College Events portal!"
            msg.attach(MIMEText(body, 'plain'))
            
            server.send_message(msg)
        
        server.quit()
        print("Notifications sent successfully!")
    except Exception as e:
        print(f"Failed to send notifications: {e}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/signup')
def signup_page():
    return render_template('signup.html')

@app.route('/student')
def student():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('student.html')

@app.route('/staff')
def staff():
    return render_template('staff.html')

@app.route('/api/signup', methods=['POST'])
def api_signup():
    user_data = request.json
    data = load_data()
    
    # Check if student already exists by Name
    if any(s['name'] == user_data['name'] for s in data.get('students', [])):
        return jsonify({"status": "error", "message": "Student already registered with this name"}), 400
        
    if 'students' not in data:
        data['students'] = []
        
    data['students'].append(user_data)
    save_data(data)
    return jsonify({"status": "success", "message": "your account is created"}), 201

@app.route('/api/login', methods=['POST'])
def api_login():
    credentials = request.json
    data = load_data()
    
    user = next((s for s in data.get('students', []) if s['name'] == credentials['name'] and s['password'] == credentials['password']), None)
    
    if user:
        session['user_id'] = user['name']
        session['user_name'] = user['name']
        return jsonify({"status": "success"}), 200
    else:
        return jsonify({"status": "error", "message": "Invalid Register Number or Password"}), 401

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

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
    
    # Send notifications
    send_event_notification(new_event.get('title'), new_event.get('startDate') or new_event.get('date'))
    
    return jsonify({"status": "success"}), 201

@app.route('/api/events/<event_id>', methods=['PUT'])
def update_event(event_id):
    updated_data = request.json
    data = load_data()
    
    for i, event in enumerate(data.get('events', [])):
        if event['id'] == event_id:
            # Keep the same ID and timestamp if not provided
            updated_data['id'] = event_id
            if 'timestamp' not in updated_data:
                updated_data['timestamp'] = event.get('timestamp')
            data['events'][i] = updated_data
            save_data(data)
            return jsonify({"status": "success"}), 200
            
    return jsonify({"status": "error", "message": "Event not found"}), 404

@app.route('/api/events/<event_id>', methods=['DELETE'])
def delete_event(event_id):
    data = load_data()
    initial_count = len(data.get('events', []))
    data['events'] = [e for e in data.get('events', []) if e['id'] != event_id]
    
    if len(data['events']) < initial_count:
        save_data(data)
        return jsonify({"status": "success"}), 200
    else:
        return jsonify({"status": "error", "message": "Event not found"}), 404

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
