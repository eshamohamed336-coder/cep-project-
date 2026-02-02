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

    // Register Student
    async registerStudent(studentName, rollNo, eventId) {
        const regData = {
            studentName,
            rollNo,
            eventId,
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
