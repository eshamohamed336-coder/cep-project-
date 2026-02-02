const EventManager = {
    DATA_KEY: 'college_events_data',
    DATA_FILE: 'data.json',

    // Initialize data from data.json if localStorage is empty
    async init() {
        let dataStr = localStorage.getItem(this.DATA_KEY);
        let data;

        if (!dataStr) {
            try {
                const response = await fetch(this.DATA_FILE);
                if (!response.ok) throw new Error('Could not load data.json');
                data = await response.json();
            } catch (error) {
                console.error('Initialization error:', error);
                data = { events: [], registrations: [] };
            }
        } else {
            data = JSON.parse(dataStr);
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
        await this.init();
        const data = JSON.parse(localStorage.getItem(this.DATA_KEY));
        return data.events || [];
    },

    // Add a new event
    async addEvent(event) {
        await this.init();
        const data = JSON.parse(localStorage.getItem(this.DATA_KEY));
        if (!event.timestamp) {
            event.timestamp = new Date().toISOString();
        }
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
