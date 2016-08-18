import dispatcher from "../src/dispatcher";

function doNothing() {
}

describe("addStore()", () => {
    it("adds a store that is correctly formed", () => {
        const store = {
            name  : "test store",
            notify: doNothing
        };

        expect(() => {
            dispatcher.addStore(store);
        }).not.toThrowError();
    });

    it("throws an error if the store has no name", () => {
        const store = {
            notify: doNothing
        };

        expect(() => {
            dispatcher.addStore(store);
        }).toThrowError();
    });

    it("throws an error if the store's name is empty", () => {
        const store = {
            name  : "",
            notify: doNothing
        };

        expect(() => {
            dispatcher.addStore(store);
        }).toThrowError();
    });

    it("throws an error if the store has no notify function", () => {
        const store = {
            name: "test store"
        };

        expect(() => {
            dispatcher.addStore(store);
        }).toThrowError();
    });

    it("throws an error if the store's notify property is not a function", () => {
        const store = {
            name  : "test store",
            notify: "a string"
        };

        expect(() => {
            dispatcher.addStore(store);
        }).toThrowError();
    });
});

describe("dispatch()", () => {
    it("calls the notify method of every store added", () => {
        const store1Notify = jasmine.createSpy("store 1 notify()");
        const store2Notify = jasmine.createSpy("store 2 notify()");

        dispatcher.addStore({
            name  : "store 1",
            notify: store1Notify
        });
        dispatcher.addStore({
            name  : "store 2",
            notify: store2Notify
        });

        expect(() => {
            dispatcher.dispatch()
        }).not.toThrowError();
        expect(store1Notify.calls.count()).toEqual(1);
        expect(store2Notify.calls.count()).toEqual(1);
    });

    it("throws an error if asked to dispatch another action whilst dispatching", () => {
        dispatcher.addStore({
            name: "dispatches on notify",
            notify: function notify() {
                dispatcher.dispatch();
            }
        });

        expect(() => {
            dispatcher.dispatch();
        }).toThrowError();
    });
});
