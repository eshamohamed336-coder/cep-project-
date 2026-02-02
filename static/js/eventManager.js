/**
 * EventManager - Handles data persistence using localStorage for Static GitHub Pages deployment.
 */

const EventManager = {
    DATA_KEY: 'college_events_data',
    DATA_FILE: 'data.json',

    // Initialize data from data.json if localStorage is empty
    async init() {
        let data = localStorage.getItem(this.DATA_KEY);
        if (!data) {
            try {
                const response = await fetch(this.DATA_FILE);
                if (!response.ok) throw new Error('Could not load data.json');
                const jsonData = await response.json();
                localStorage.setItem(this.DATA_KEY, JSON.stringify(jsonData));
            } catch (error) {
                console.error('Initialization error:', error);
                // Fallback empty structure
                localStorage.setItem(this.DATA_KEY, JSON.stringify({ events: [], registrations: [] }));
            }
        }
    },

    // Get all events
    async getEvents() {
        await this.init();
        const data = JSON.parse(localStorage.getItem(this.DATA_KEY));
        return data.events || [];
    },

    // Add a new event
    async addEvent(event) {
        await this.init();
        const data = JSON.parse(localStorage.getItem(this.DATA_KEY));
        data.events.push(event);
        localStorage.setItem(this.DATA_KEY, JSON.stringify(data));
        return { status: "success" };
    },

    // Register Student
    async registerStudent(studentName, rollNo, eventId) {
        await this.init();
        const data = JSON.parse(localStorage.getItem(this.DATA_KEY));
        const regData = {
            studentName,
            rollNo,
            eventId,
            timestamp: new Date().toISOString()
        };
        data.registrations.push(regData);
        localStorage.setItem(this.DATA_KEY, JSON.stringify(data));
        console.log(`Registered ${studentName} for Event ID ${eventId} locally`);
        return { status: "success" };
    }
};

// Expose to window
window.EventManager = EventManager;
