const EventManager = {
    DATA_KEY: 'college_events_data',
    DATA_FILE: 'data.json',
    API_URL: window.location.origin, // Dynamic detection of server URL

    // Initialize data from data.json if localStorage is empty
    async init() {
        let data;
        try {
            // Priority: Try to fetch from server first
            const response = await fetch('/api/events');
            if (response.ok) {
                const events = await response.json();
                // For GitHub Pages, this will fail or return static JSON.
                // For Flask, it will return the live data.
                data = { events: events, registrations: [] };
            } else {
                throw new Error('Server API not available');
            }
        } catch (error) {
            console.log('Falling back to LocalStorage...');
            let dataStr = localStorage.getItem(this.DATA_KEY);
            if (!dataStr) {
                try {
                    const response = await fetch(this.DATA_FILE);
                    data = await response.json();
                } catch (e) {
                    data = { events: [], registrations: [] };
                }
            } else {
                data = JSON.parse(dataStr);
            }
        }

        // Cleanup old data (older than 2 weeks)
        const cleanedData = this.cleanupOldData(data);
        localStorage.setItem(this.DATA_KEY, JSON.stringify(cleanedData));
    },

    cleanupOldData(data) {
        const now = new Date();
        const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));

        const isOld = (timestamp) => {
            if (!timestamp) return false;
            const ts = new Date(timestamp);
            return ts < twoWeeksAgo;
        };

        if (data.events) {
            data.events = data.events.filter(event => !isOld(event.timestamp));
        }
        if (data.registrations) {
            data.registrations = data.registrations.filter(reg => !isOld(reg.timestamp));
        }
        return data;
    },

    // Get all events
    async getEvents() {
        try {
            const response = await fetch('/api/events');
            if (response.ok) return await response.json();
        } catch (e) { }

        await this.init();
        const data = JSON.parse(localStorage.getItem(this.DATA_KEY));
        return data.events || [];
    },

    // Add a new event
    async addEvent(event) {
        if (!event.timestamp) {
            event.timestamp = new Date().toISOString();
        }

        // Sync with Flask Server if running
        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
            if (response.ok) return { status: "success" };
        } catch (error) {
            console.log('Server unreachable, saving to LocalStorage only');
        }

        // Fallback for GitHub Pages
        await this.init();
        const data = JSON.parse(localStorage.getItem(this.DATA_KEY));
        data.events.push(event);
        localStorage.setItem(this.DATA_KEY, JSON.stringify(data));
        return { status: "success" };
    },

    // Update an existing event
    async updateEvent(eventId, eventData) {
        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
            if (response.ok) return { status: "success" };
        } catch (error) {
            console.error('Error updating event:', error);
        }

        // Fallback for LocalStorage
        const data = JSON.parse(localStorage.getItem(this.DATA_KEY));
        const index = data.events.findIndex(e => e.id === eventId);
        if (index !== -1) {
            data.events[index] = { ...eventData, id: eventId };
            localStorage.setItem(this.DATA_KEY, JSON.stringify(data));
            return { status: "success" };
        }
        return { status: "error" };
    },

    // Delete an event
    async deleteEvent(eventId) {
        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'DELETE'
            });
            if (response.ok) return { status: "success" };
        } catch (error) {
            console.error('Error deleting event:', error);
        }

        // Fallback for LocalStorage
        const data = JSON.parse(localStorage.getItem(this.DATA_KEY));
        data.events = data.events.filter(e => e.id !== eventId);
        localStorage.setItem(this.DATA_KEY, JSON.stringify(data));
        return { status: "success" };
    },

    // Staff Login via hardcoded password
    async staffLogin(username, password) {
        try {
            // Wait briefly to simulate network request
            await new Promise(r => setTimeout(r, 300));

            if (password === "JMC EVENT") {
                return { status: "success" };
            } else {
                return { status: "error", message: "Invalid Password." };
            }
        } catch (err) {
            return { status: "error", message: "Something went wrong." };
        }
    },

    // Register Student
    async registerStudent(studentName, rollNo, eventId, regNo, classSection, department) {
        const regData = {
            studentName,
            rollNo,
            eventId,
            regNo,
            classSection,
            department,
            timestamp: new Date().toISOString()
        };

        // Sync with Flask Server if running
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(regData)
            });
            if (response.ok) return { status: "success" };
        } catch (error) {
            console.log('Server unreachable, saving to LocalStorage only');
        }

        // Fallback for GitHub Pages
        await this.init();
        const data = JSON.parse(localStorage.getItem(this.DATA_KEY));
        data.registrations.push(regData);
        localStorage.setItem(this.DATA_KEY, JSON.stringify(data));
        return { status: "success" };
    }
};

// Expose to window
window.EventManager = EventManager;
