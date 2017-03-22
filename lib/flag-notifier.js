export default function createFlagNotifier() {
    const listeners = {};
    let raisedFlags = {};

    return {
        /**
         * Raise a particular named flag.
         * @param flagName The name of the flag to raise.
         */
        flag(flagName) {
            if(typeof flagName !== "string" || flagName.length === 0) {
                throw new Error("[flagNotifier.flag] Expected flag name must be a non-empty string.");
            }
            raisedFlags[flagName] = true;
        },

        /**
         * Add a listener to be called if a particular named flag was raised.
         * @param flagName
         * @param listener
         */
        listen(flagName, listener) {
            if(typeof flagName !== "string" || flagName.length === 0) {
                throw new Error("[flagNotifier.listen] Expected flag name must be a non-empty string.");
            }
            if(typeof listener !== "function") {
                throw new Error("[flagNotifier.listen] Expected listener must be a function.");
            }
            if(!Array.isArray(listeners[flagName])) {
                listeners[flagName] = [];
            }
            if(!listeners[flagName].includes(listener)) {
                listeners[flagName].push(listener);
            }
        },

        /**
         * Remove a listener from a particular named flag that was added previously.
         * @param flagName
         * @param listener
         */
        unlisten(flagName, listener) {
            if(typeof flagName !== "string" || flagName.length === 0) {
                throw new Error("[flagNotifier.unlisten] Expected flag name must be a non-empty string.");
            }
            if(typeof listener !== "function") {
                throw new Error("[flagNotifier.unlisten] Expected listener must be a function.");
            }
            if(Array.isArray(listeners[flagName])) {
                const listenerIndex = listeners[flagName].findIndex((testListener) => testListener === listener);
                if(listenerIndex !== -1) {
                    listeners[flagName].splice(listenerIndex, 1);
                }
            }
        },

        /**
         * For each flag that has been raised, call all listeners listening to that flag once.
         * Then clear all raised flags.
         */
        notify() {
            for(const flagName of Object.keys(raisedFlags)) {
                if(Array.isArray(listeners[flagName])) {
                    for(const listener of listeners[flagName]) {
                        listener();
                    }
                }
            }
            raisedFlags = {};
        }
    };
}
