import createNotifier from "../src/notifier";

describe("listen()", () => {
    let notifier;

    function doNothing() {
    }

    beforeEach(() => {
        notifier = createNotifier();
    });

    it("registers listeners that give correct parameters", () => {
        expect(() => {
            notifier.listen("test", doNothing)
        }).not.toThrowError();
    });

    it("throws an error if the event name given is not a string", () => {
        expect(() => {
            notifier.listen(0, doNothing);
        }).toThrowError();
    });

    it("throws an error if the event name given is an empty string", () => {
        expect(() => {
            notifier.listen("", doNothing);
        }).toThrowError();
    });

    it("throws an error if the listener given is not a function", () => {
        expect(() => {
            notifier.listen("test", "test");
        }).toThrowError();
    });
});

describe("notify()", () => {
    let notifier;

    function doNothing() {
    }

    beforeEach(() => {
        notifier = createNotifier();
    });

    it("calls any listeners once", () => {
        const spy = jasmine.createSpy("listener");

        notifier.listen("test", spy);

        expect(() => {
            notifier.notify("test");
        }).not.toThrowError();
        expect(spy.calls.count()).toEqual(1);
    });

    it("doesn't call unrelated listeners", () => {
        const spy1 = jasmine.createSpy("listener 1");
        const spy2 = jasmine.createSpy("listener 2");

        notifier.listen("test 1", spy1);
        notifier.listen("test 2", spy2);

        expect(() => {
            notifier.notify("test 1");
        }).not.toThrowError();
        expect(spy1).toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
        expect(() => {
            notifier.notify("test 2");
        }).not.toThrowError();
        expect(spy2).toHaveBeenCalled();
    });
});
