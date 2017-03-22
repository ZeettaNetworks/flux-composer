# Flux Composer #

A library providing components for the [Flux](http://facebook.github.io/flux/docs/overview.html) methodology that can be used in a compositional manner.

This library contains:
* A dispatcher implementation
* A notifier for your stores to notify views of changes
* A mechanism for handling optimistic updates

## Dispatcher ##

A page should only use a single instance of a dispatcher. For this reason, it is given as a singleton import.

```js
import dispatcher from "<path>/dispatcher";
```

### `dispatcher.addStore(store)` ###

Adds a store to the dispatcher. The store will receive any action dispatched. `store` is any object that has the `name` property as a string and the `handleAction` property as a function.

### `dispatcher.dispatch(action)` ###

Dispatches an action to all stores synchronously. An action can be anything you like but is usually an object. The stores will receive actions through their `handleAction` methods.

### `dispatcher.waitFor(...stores)` ###

Waits for the stores with the given names to be updated before returning. Give each store name as a separate parameter. This method must only be used within a store as it is being dispatched to.

## Notifier ##

This module is used to create notifiers which register listeners and then call those listeners on demand. Stores can add listen() to their public API so that views can add listeners to them. Stores can then use notify() internally to call all of those listeners.

```js
import createNotifier from "<path>/notifier";

const notifier = createNotifier();
```

### `notifier.listen(eventName, func)` ###

Registers a listener to a named event. This method should be composed with your store's public API so that views can update themselves. Listeners are passed no data when notified, views should instead retrieve data from the store via other public API methods.

### `notifier.notify(eventName)` ###

Calls all listeners subscribed to the given event name. If there are no listeners to the event then this function does nothing. This method should be used privately within your store.

### `notifier.unlisten(eventName, func)` ###

Unregisters a listener from a named event. This method is the opposite of `listen()`. A listener that has been unregistered from a named event will no longer be called by `notify()` for that event name. If the listener is listening for any other events from this notifier, those will be unaffected. This method should be composed with your store's public API.

## Flag Notifier ##

This module is used to create notifiers which register listeners against names and then calls those listeners according to a flag-raising model. A name can be flagged by this notifier and later listeners will be fired for all flagged names at once. Raising a flag multiple times will not cause a listener to be called multiple times, only once when the notifications are all dispatched together.

```js
import createFlagNotifier from "<path>/flag-notifier";

const flagNotifier = createFlagNotifier();
```

### `flagNotifier.listen(flagName, func)` ###

Registers a listener to a named flag. This method should be composed with your store's public API so that views can update themselves. Listeners are passed no data when notified, views should instead retrieve data from the store via other public API methods.

### `flagNotifier.flag(flagName)` ###

Raises a named flag. Raising the same named flag more than once has no effect.

### `flagNotifier.notify()` ###

Calls all the listeners of all of the raised flags. All raised flags are then lowered.

### `flagNotifier.unlisten(flagName, func)` ###

Unregisters a listener from a named flag. This method is the opposite of `listen()`. A listener that has been unregistered from a flag name will no longer be called by `notify()` for that flag name. If the listener is listening for any other flags from this notifier, those will be unaffected. This method should be composed with your store's public API.

### Examples ###

```js
flagNotifier.listen("example", listener);
flagNotifier.notify(); // Listener isn't called, the "example" flag has not been raised.
```
```js
flagNotifier.listen("example", listener);
flagNotifier.flag("example");
flagNotifier.notify(); // Listener is called once
```
```js
flagNotifier.listen("example", listener);
flagNotifier.flag("example");
flagNotifier.flag("example");
flagNotifier.notify(); // Listener is still only called once
```
```js
flagNotifier.listen("example", listener);
flagNotifier.flag("example");
flagNotifier.notify(); // Listener is called here.
flagNotifier.notify(); // The listener isn't called here because the previous notify lowered all flags.
```

## Optimism ##

This module is used to handle optimistic updates to store state. This implementation uses a base state (the state of the store before any optimistic action is applied) and an array of actions (some of which are optimistic) that are applied in sequence to the base state to obtain the optimistic state. 

```js
import {optimisticReduction} from "<path>/optimism";
```

Actions that are optimistic must have a `meta` object that contains an `optimistic` boolean and an `optimisticId`. For example:

```js
const action = {
    type: "SOME_TYPE",
    payload: "some payload",
    meta: {
        optimistic: true,
        optimisticId: 0
    }
}
```

Actions with `optimistic` set to true are optimistic; these are actions waiting for something to settle them. These will be queued rather than merged with the store's base state so that the store can be "rolled back" to before the optimistic action was applied.

Actions with `optimistic` set to false are the settling actions. These can be merged into the base state of a store.

Actions with an `optimisticId` will replace a queued action with an identical `optimisticId`. The id can be anything; matches are determined using the `===` comparator.

### `optimisticReduction(baseState, queuedActions, reducer, action)` ###

This function should be called when a store handles an action.
 
Arguments:
* `baseState` should be the state of the whole store.
* `queuedActions` should be an empty array on the first call and the `queuedActions` array returned from the previous time this function was called every time afterwards.
* `reducer` should be a reduction function that takes the store state as the first argument, the action being handled as the second, and returns the store state after the action has been applied.
* `action` is the action being handled.

This function returns an object with three items: `baseState`, `queuedActions`, and `optimisticState`. `optimisticState` is the state of the store that should be exposed to consumers.

#### Example ####

This example shows an store that increments a single number that is also stored on a server

```js
let queuedActions = [];
let baseState = 0;
let optimisticState;

function reducer(state, action) {
    if(action.type === "INCREMENT" && !action.error) {
        return state + 1; 
    }
}

// The store is incremented optimistically.
let action = {
    type: "INCREMENT",
    meta: {
        optimistic: true,
        optimisticId: 0
    }
};
({
    baseState,
    queuedActions,
    optimisticState
} = optimisticReduction(baseState, queuedActions, reducer, action));
// baseState = 0, optimisticState = 1

// The client receives a success message from the server indicating that the increment was successful.
action = {
    type: "INCREMENT",
    meta: {
        optimistic: false,
        optimisticId: 0
    }
};
({
    baseState,
    queuedActions,
    optimisticState
} = optimisticReduction(baseState, queuedActions, reducer, action));
// baseState = 1, optimisticState = 1

// The store is incremented optimistically again.
action = {
    type: "INCREMENT",
    meta: {
        optimistic: true,
        optimisticId: 1
    }
};
({
    baseState,
    queuedActions,
    optimisticState
} = optimisticReduction(baseState, queuedActions, reducer, action));
// baseState = 1, optimisticState = 2

// The client receives a failure message from the server indicating that the increment was unsuccessful.
action = {
    type: "INCREMENT",
    error: true,
    meta: {
        optimistic: false,
        optimisticId: 1
    }
};
({
    baseState,
    queuedActions,
    optimisticState
} = optimisticReduction(baseState, queuedActions, reducer, action));
// baseState = 1, optimisticState = 1
```
