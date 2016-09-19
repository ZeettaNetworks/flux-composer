import dispatcher, {createDispatcher} from "../src/dispatcher";

describe("dispatcher singleton", () => {
    it("is an object", () => {
        expect(dispatcher).toEqual(jasmine.any(Object));
    });
});

describe("addStore()", () => {
    let dispatcher;

    function doNothing() {
    }

    beforeEach(() => {
        dispatcher = createDispatcher();
    });

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
    let dispatcher;

    beforeEach(() => {
        dispatcher = createDispatcher();
    });

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

    it("tears down dispatch state when an error is thrown by a store", () => {
        dispatcher.addStore({
            name: "throws an error on notify",
            notify: function notify() {
                throw new Error("test error");
            }
        });

        expect(() => {
            dispatcher.dispatch();
        }).toThrowError();
    });

    it("doesn't throw an error on unrelated dispatches subsequent to a dispatch that had an error thrown", () => {
        dispatcher.addStore({
            name: "throws an error on action 1",
            notify(action) {
                if(action.action === "throw error") {
                    throw new Error("test error");
                }
            }
        });

        expect(() => {
            dispatcher.dispatch({action: "throw error"});
        }).toThrowError();
        expect(() => {
            dispatcher.dispatch({action: "don't throw error"});
        }).not.toThrowError();
    });
});

describe("waitFor()", () => {
    let dispatcher;

    beforeEach(() => {
        dispatcher = createDispatcher();
    });

    it("waits for all specified stores", () => {
        const updateOrder = [];
        const store1 = {
            name: "1",
            notify: () => {
                updateOrder.push("1")
            }
        };
        const store2 = {
            name: "2",
            notify: () => {
                dispatcher.waitFor("1", "3");
                updateOrder.push("2");
            }
        };
        const store3 = {
            name: "3",
            notify: () => {
                updateOrder.push("3");
            }
        };

        dispatcher.addStore(store1);
        dispatcher.addStore(store2);
        dispatcher.addStore(store3);

        expect(() => {
            dispatcher.dispatch();
        }).not.toThrowError();
        expect(updateOrder).toEqual(["1", "3", "2"]);
    });

    it("doesn't cause a store to be updated twice", () => {
        const spy1 = jasmine.createSpy();
        const spy2 = jasmine.createSpy();
        const store1 = {
            name: "1",
            notify: spy1
        };
        const store2 = {
            name: "2",
            notify: () => {
                dispatcher.waitFor("1");
                spy2();
            }
        };

        dispatcher.addStore(store1);
        dispatcher.addStore(store2);

        expect(() => {
            dispatcher.dispatch();
        }).not.toThrowError();
        expect(spy1.calls.count()).toEqual(1);
        expect(spy2.calls.count()).toEqual(1);
    });

    it("throws an error if it would cause a cyclic wait", () => {
        const store1 = {
            name: "1",
            notify: () => {
                dispatcher.waitFor("2");
            }
        };
        const store2 = {
            name: "2",
            notify: () => {
                dispatcher.waitFor("1");
            }
        };

        dispatcher.addStore(store1);
        dispatcher.addStore(store2);

        expect(() => {
            dispatcher.dispatch();
        }).toThrowError();
    });

    it("throws an error if asked to wait for a non-existent store", () => {
        const store1 = {
            name: "1",
            notify: () => {
                dispatcher.waitFor("2");
            }
        };

        dispatcher.addStore(store1);

        expect(() => {
            dispatcher.dispatch();
        }).toThrowError();
    })
});
