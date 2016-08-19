export function createDispatcher() {
    const stores = {};

    /**
     * Registers a store with the dispatcher so that it is notified about any actions.
     * @param {Object} store
     * @param {String} store.name The name of this store
     * @param {Function} store.notify The function that will be called when the dispatcher dispatches an action to this store.
     */
    function addStore(store) {
        if(typeof store.name !== "string" || store.name.length === 0) {
            throw new Error("[dispatcher.addStore] Expected store \"name\" property to be a non-empty string.");
        }
        if(stores.hasOwnProperty(store.name)) {
            throw new Error(`[dispatcher.addStore] The dispatcher has already registered a store named "${store.name}"`);
        }
        if(typeof store.notify !== "function") {
            throw new Error("[dispatcher.addStore] Expected store \"notify\" property to be a method");
        }
        stores[store.name] = store;
    }

    // Dispatch state
    // This is shared between functions responsible for managing action dispatch
    let actionBeingDispatched = null;
    let storeUpdateStatuses = null;

    /**
     * Dispatch an action to all stores registered with the dispatcher.
     * @param action The action to dispatch to the stores.
     */
    function dispatch(action) {
        if(actionBeingDispatched !== null) {
            throw new Error("[dispatcher.dispatch] The dispatcher cannot dispatch an action whilst dispatching another action.")
        }

        // Set up dispatch state
        actionBeingDispatched = action;
        storeUpdateStatuses = {};
        for(const name of Object.keys(stores)) {
            storeUpdateStatuses[name] = {
                started  : false,
                completed: false
            }
        }

        // Notify all stores.
        for(const name of Object.keys(stores)) {
            const store = stores[name];
            const storeUpdateStatus = storeUpdateStatuses[name];

            if(!storeUpdateStatus.completed) {
                updateStore(store, storeUpdateStatus, actionBeingDispatched);
            }
        }

        // Tear down dispatch state
        actionBeingDispatched = null;
        storeUpdateStatuses = null;
    }

    /**
     * Gets the dispatcher to update other stores first.
     * This function will only return once the given stores have been updated.
     * @param storesToWaitFor Names of stores to update (given as separate parameters)
     */
    function waitFor(...storesToWaitFor) {
        if(actionBeingDispatched === null) {
            throw new Error("[dispatcher.waitFor] The dispatcher cannot wait for another store when it is not dispatching an action.");
        }
        for(const name of storesToWaitFor) {
            if(!stores.hasOwnProperty(name)) {
                throw new Error(`[dispatcher.waitFor] The dispatcher has no registered store named "${name}" so it cannot wait for it.`);
            }
        }

        for(const name of storesToWaitFor) {
            const store = stores[name];
            const storeUpdateStatus = storeUpdateStatuses[name];

            if(!storeUpdateStatus.completed) {
                if(storeUpdateStatus.started) {
                    throw new Error(`[dispatcher.waitFor] Cyclic wait on store updates detected; the update for store "${name}" has already begun.`);
                }
                updateStore(store, storeUpdateStatus, actionBeingDispatched);
            }
        }
    }

    function updateStore(store, status, action) {
        status.started = true;
        store.notify(action);
        status.completed = true;
    }

    return {
        addStore,
        dispatch,
        waitFor
    }
}

export default createDispatcher();
