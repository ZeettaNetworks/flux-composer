import dispatcher, {createDispatcher} from "../lib/dispatcher";

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
            handleAction: doNothing

        };

        expect(() => {
            dispatcher.addStore(store);
        }).not.toThrowError();
    });

    it("throws an error if the store has no name", () => {
        const store = {
            handleAction: doNothing
        };

        expect(() => {
            dispatcher.addStore(store);
        }).toThrowError();
    });

    it("throws an error if the store's name is empty", () => {
        const store = {
            name  : "",
            handleAction: doNothing
        };

        expect(() => {
            dispatcher.addStore(store);
        }).toThrowError();
    });

    it("throws an error if the store has no handleAction function", () => {
        const store = {
            name: "test store"
        };

        expect(() => {
            dispatcher.addStore(store);
        }).toThrowError();
    });

    it("throws an error if the store's handleAction property is not a function", () => {
        const store = {
            name  : "test store",
            handleAction: "a string"
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

    it("calls the handleAction method of every store added", () => {
        const store1HandleAction = jasmine.createSpy("store 1 handleAction()");
        const store2HandleAction = jasmine.createSpy("store 2 handleAction()");

        dispatcher.addStore({
            name  : "store 1",
            handleAction: store1HandleAction
        });
        dispatcher.addStore({
            name  : "store 2",
            handleAction: store2HandleAction
        });

        expect(() => {
            dispatcher.dispatch()
        }).not.toThrowError();
        expect(store1HandleAction.calls.count()).toEqual(1);
        expect(store2HandleAction.calls.count()).toEqual(1);
    });

    it("throws an error if asked to dispatch another action whilst dispatching", () => {
        dispatcher.addStore({
            name: "dispatches on handleAction",
            handleAction() {
                dispatcher.dispatch();
            }
        });

        expect(() => {
            dispatcher.dispatch();
        }).toThrowError();
    });

    it("tears down dispatch state when an error is thrown by a store", () => {
        dispatcher.addStore({
            name: "throws an error on handleAction",
            handleAction() {
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
            handleAction(action) {
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
            handleAction() {
                updateOrder.push("1")
            }
        };
        const store2 = {
            name: "2",
            handleAction() {
                dispatcher.waitFor("1", "3");
                updateOrder.push("2");
            }
        };
        const store3 = {
            name: "3",
            handleAction() {
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
            handleAction: spy1
        };
        const store2 = {
            name: "2",
            handleAction() {
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
            handleAction() {
                dispatcher.waitFor("2");
            }
        };
        const store2 = {
            name: "2",
            handleAction() {
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
            handleAction() {
                dispatcher.waitFor("2");
            }
        };

        dispatcher.addStore(store1);

        expect(() => {
            dispatcher.dispatch();
        }).toThrowError();
    })
});
