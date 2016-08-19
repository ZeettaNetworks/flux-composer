export default function createNotifier() {
    const listeners = {};

    /**
     * Call all the functions listening for a particular event.
     * @param eventName The name of the event that happened.
     */
    function notify(eventName) {
        let eventListeners = listeners[eventName];
        if(Array.isArray(eventListeners)) {
            for(const listener of eventListeners) {
                listener();
            }
        }
    }

    /**
     * Register a function as a listener of a particular event.
     * @param eventName The name of the event to listen for.
     * @param listener The function doing the listening.
     */
    function listen(eventName, listener) {
        if(typeof eventName !== "string" || eventName.length === 0) {
            throw new Error("[notifier.listen] Expected event name must be a non-empty string.");
        }
        if(typeof listener !== "function") {
            throw new Error("[notifier.listen] Expected listener must be a function.");
        }

        let eventListeners = listeners[eventName];
        if(!Array.isArray(eventListeners)) {
            listeners[eventName] = [];
            eventListeners = listeners[eventName];
        }

        eventListeners.push(listener);
    }

    return {
        notify,
        listen
    }
}
