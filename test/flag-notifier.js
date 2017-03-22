import createFlagNotifier from "../lib/flag-notifier";

describe("flag()", () => {
    it("accepts a single string", () => {
        const {flag} = createFlagNotifier();
        expect(() => {
            flag("test");
        }).not.toThrowError();
    });
    it("throws an error if given no argument", () => {
        const {flag} = createFlagNotifier();
        expect(() => {
            flag();
        }).toThrowError();
    });
    it("throws an error if given an argument that isn't a string", () => {
        const {flag} = createFlagNotifier();
        expect(() => {
            flag(0);
        }).toThrowError();
        expect(() => {
            flag(() => {});
        }).toThrowError();
        expect(() => {
            flag({});
        }).toThrowError();
        expect(() => {
            flag([]);
        }).toThrowError();
    });
    it("raises a flag such that a listener listening for that flag is called by notify()", () => {
        const {flag, listen, notify} = createFlagNotifier();
        const spy = jasmine.createSpy("listener");
        listen("test", spy);
        notify();
        expect(spy.calls.count()).toEqual(0);
        flag("test");
        notify();
        expect(spy.calls.count()).toEqual(1);
    });
    it("doesn't cause a listener to be called twice if a flag is raised more than once", () => {
        const {flag, listen, notify} = createFlagNotifier();
        const spy = jasmine.createSpy("listener");
        listen("test", spy);
        flag("test");
        flag("test");
        notify();
        expect(spy.calls.count()).toEqual(1);
    });
});

describe("listen()", () => {
    it("accepts a string and a function", () => {
        const {listen} = createFlagNotifier();
        expect(() => {
            listen("test", () => {});
        }).not.toThrowError();
    });
    it("throws an error if given arguments that aren't a string and a function", () => {
        const {listen} = createFlagNotifier();
        expect(() => {
            listen();
        }).toThrowError();
        expect(() => {
            listen(0, 0);
        }).toThrowError();
        expect(() => {
            listen("test", "test");
        }).toThrowError();
        expect(() => {
            listen(() => {}, () => {});
        }).toThrowError();
        expect(() => {
            listen({}, {});
        }).toThrowError();
        expect(() => {
            listen([], []);
        }).toThrowError();
    });
    it("causes the listener to be called through flag() and notify() calls", () => {
        const {flag, listen, notify} = createFlagNotifier();
        const spy = jasmine.createSpy("listener");
        listen("test", spy);
        flag("test");
        notify();
        expect(spy.calls.count()).toEqual(1);
    });
});

describe("unlisten()", () => {
    it("accepts a string and a function", () => {
        const {unlisten} = createFlagNotifier();
        expect(() => {
            unlisten("test", () => {});
        }).not.toThrowError();
    });
    it("throws an error if given arguments that aren't a string and a function", () => {
        const {unlisten} = createFlagNotifier();
        expect(() => {
            unlisten();
        }).toThrowError();
        expect(() => {
            unlisten(0, 0);
        }).toThrowError();
        expect(() => {
            unlisten("test", "test");
        }).toThrowError();
        expect(() => {
            unlisten(() => {}, () => {});
        }).toThrowError();
        expect(() => {
            unlisten({}, {});
        }).toThrowError();
        expect(() => {
            unlisten([], []);
        }).toThrowError();
    });
    it("stops a listener from being called any more through flag() and notify() calls", () => {
        const {flag, listen, unlisten, notify} = createFlagNotifier();
        const spy = jasmine.createSpy("listener");
        listen("test", spy);
        flag("test");
        notify();
        expect(spy.calls.count()).toEqual(1);
        unlisten("test", spy);
        flag("test");
        notify();
        expect(spy.calls.count()).toEqual(1);
    });
});

describe("notify()", () => {
    it("takes no arguments", () => {
        const {notify} = createFlagNotifier();
        expect(()=> {
            notify();
        }).not.toThrowError();
    });
    it("causes listeners to be called that have flags raised", () => {
        const {flag, listen, notify} = createFlagNotifier();
        const spy1 = jasmine.createSpy("listener1");
        listen("test1", spy1);
        const spy2 = jasmine.createSpy("listener2");
        listen("test2", spy2);
        const spy3 = jasmine.createSpy("listener3");
        listen("test3", spy3);
        flag("test1");
        flag("test3");
        notify();
        expect(spy1.calls.count()).toEqual(1);
        expect(spy2.calls.count()).toEqual(0);
        expect(spy3.calls.count()).toEqual(1);
    });
    it("clears raised flags when called", () => {
        const {flag, listen, notify} = createFlagNotifier();
        const spy = jasmine.createSpy("listener");
        listen("test", spy);
        flag("test");
        notify();
        expect(spy.calls.count()).toEqual(1);
        notify();
        expect(spy.calls.count()).toEqual(1);
    });
});
