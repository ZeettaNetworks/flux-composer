# Flux Composer #

A library providing components for the [Flux](http://facebook.github.io/flux/docs/overview.html) methodology that can be used in a compositional manner.

This library contains:
* A dispatcher implementation
* A notifier for your stores to notify views of changes

## Dispatcher ##

A page should only use a single instance of a dispatcher. For this reason, it is given as a singleton import.

```
import dispatcher from "<path>/dispatcher"
```

### `dispatcher.addStore(store)` ###

Adds a store to the dispatcher. The store will receive any action dispatched. `store` is any object that has the `name` property as a string and the `notify` property as a function.

### `dispatcher.dispatch(action)` ###

Dispatches an action to all stores synchronously. An action can be anything you like but is usually an object. The stores will receive actions through their notify methods.

### `dispatcher.waitFor(...stores)` ###

Waits for the stores with the given names to be updated before returning. Give each store name as a separate parameter. This method must only be used within a store as it is being notified.

## Notifier ##

This module is used to create notifiers which register listeners and then call those listeners on demand. Stores can add listen() to their public API so that views can add listeners to them. Stores can then use notify() internally to call all of those listeners.

```
import createNotifier from "<path>/notifier"

const notifier = createNotifier();
```

### `notifier.listen(eventName, func)` ###

Registers a listener to a named event. This method should be composed with your store's public API so that views can update themselves. Listeners are passed no data when notified, views should instead retrieve data from the store via other public API methods.

### `notifier.notify(eventName)` ###

Calls all listeners subscribed to the given event name. If there are no listeners to the event then this function does nothing. This method should be used privately within your store.
