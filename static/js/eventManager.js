/**
 * EventManager - Handles data persistence using Flask API
 */

const EventManager = {
    // Get all events from the Flask API
    async getEvents() {
        try {
            const response = await fetch('/api/events');
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    },

    // Add a new event via the Flask API
    async addEvent(event) {
        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding event:', error);
        }
    },

    // Register Student via the Flask API
    async registerStudent(studentName, rollNo, eventId) {
        const regData = {
            studentName,
            rollNo,
            eventId,
            timestamp: new Date().toISOString()
        };
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(regData)
            });
            console.log(`Registered ${studentName} for Event ID ${eventId} via API`);
            return await response.json();
        } catch (error) {
            console.error('Error registering student:', error);
        }
    }
};

// Expose to window
window.EventManager = EventManager;
