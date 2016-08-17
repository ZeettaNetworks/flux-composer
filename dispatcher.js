
const stores = {};

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

let actionBeingDispatched = null;

function dispatch(action) {
    if(actionBeingDispatched !== null) {
        throw new Error("[dispatcher.dispatch] The dispatcher cannot dispatch an action whilst dispatching another action.")
    }

    actionBeingDispatched = action;

    for(name of Object.keys(stores)) {
        const store = stores[name];

        store.notify(action);
    }

    actionBeingDispatched = null;
}

export default {
    addStore,
    dispatch

}
