import {optimisticReduction} from "../lib/optimism";

describe("optimisticReduction", () => {
    const ZERO_STATE = {
        "NORMAL_ACTION"                : 0,
        "OPTIMISTIC_ACTION"            : 0,
        "REPLACEMENT_NORMAL_ACTION"    : 0,
        "REPLACEMENT_OPTIMISTIC_ACTION": 0
    };

    const NORMAL_ACTION = {
        type   : "NORMAL_ACTION",
        payload: true,
    };
    const OPTIMISTIC_ACTION_0 = {
        type   : "OPTIMISTIC_ACTION",
        payload: true,
        meta   : {
            optimistic  : true,
            optimisticId: 0
        }
    };
    const REPLACEMENT_NORMAL_ACTION_0 = {
        type   : "REPLACEMENT_NORMAL_ACTION",
        payload: true,
        meta   : {
            optimistic  : false,
            optimisticId: 0
        }
    };
    const REPLACEMENT_OPTIMISTIC_ACTION_0 = {
        type   : "REPLACEMENT_OPTIMISTIC_ACTION",
        payload: true,
        meta   : {
            optimistic  : true,
            optimisticId: 0
        }
    };
    const OPTIMISTIC_ACTION_1 = {
        type   : "OPTIMISTIC_ACTION",
        payload: true,
        meta   : {
            optimistic  : true,
            optimisticId: 0
        }
    };
    const REPLACEMENT_NORMAL_ACTION_1 = {
        type   : "REPLACEMENT_NORMAL_ACTION",
        payload: true,
        meta   : {
            optimistic  : false,
            optimisticId: 1
        }
    };
    const REPLACEMENT_OPTIMISTIC_ACTION_1 = {
        type   : "REPLACEMENT_OPTIMISTIC_ACTION",
        payload: true,
        meta   : {
            optimistic  : true,
            optimisticId: 1
        }
    };

    const testReducer = (state, action) => {
        const newState = {};
        for(const type of Object.keys(state)) {
            newState[type] = state[type];
        }
        newState[action.type]++;
        return newState;
    };

    it("reduces actions with no optimistic id into the base state", () => {
        const {
            baseState,
            queuedActions,
            optimisticState
        } = optimisticReduction(ZERO_STATE, [], testReducer, NORMAL_ACTION);
        expect(baseState).toEqual({
            "NORMAL_ACTION"                : 1,
            "OPTIMISTIC_ACTION"            : 0,
            "REPLACEMENT_NORMAL_ACTION"    : 0,
            "REPLACEMENT_OPTIMISTIC_ACTION": 0
        });
        expect(queuedActions.length).toEqual(0);
        expect(optimisticState).toEqual(baseState);
    });
    it("puts optimistic actions into the queued actions list and reduces them into the optimistic state", () => {
        const {
            baseState,
            queuedActions,
            optimisticState
        } = optimisticReduction(ZERO_STATE, [], testReducer, OPTIMISTIC_ACTION_0);
        expect(baseState).toEqual(ZERO_STATE);
        expect(queuedActions.length).toEqual(1);
        expect(optimisticState).toEqual({
            "NORMAL_ACTION"                : 0,
            "OPTIMISTIC_ACTION"            : 1,
            "REPLACEMENT_NORMAL_ACTION"    : 0,
            "REPLACEMENT_OPTIMISTIC_ACTION": 0
        });
    });
    it("replaces optimistic actions in the queued actions list with other optimistic actions and reduces them into the optimistic state", () => {
        let {
            baseState,
            queuedActions,
            optimisticState
        } = optimisticReduction(ZERO_STATE, [], testReducer, OPTIMISTIC_ACTION_0);
        ({
            baseState,
            queuedActions,
            optimisticState
        } = optimisticReduction(baseState, queuedActions, testReducer, REPLACEMENT_OPTIMISTIC_ACTION_0));
        expect(baseState).toEqual(ZERO_STATE);
        expect(queuedActions.length).toEqual(1);
        expect(optimisticState).toEqual({
            "NORMAL_ACTION"                : 0,
            "OPTIMISTIC_ACTION"            : 0,
            "REPLACEMENT_NORMAL_ACTION"    : 0,
            "REPLACEMENT_OPTIMISTIC_ACTION": 1
        });
    });
    it("replaces optimistic actions in the queued actions list with normal actions and reduces them into the base state", () => {
        let {
            baseState,
            queuedActions,
            optimisticState
        } = optimisticReduction(ZERO_STATE, [], testReducer, OPTIMISTIC_ACTION_0);
        ({
            baseState,
            queuedActions,
            optimisticState
        } = optimisticReduction(baseState, queuedActions, testReducer, REPLACEMENT_NORMAL_ACTION_0));
        expect(baseState).toEqual({
            "NORMAL_ACTION"                : 0,
            "OPTIMISTIC_ACTION"            : 0,
            "REPLACEMENT_NORMAL_ACTION"    : 1,
            "REPLACEMENT_OPTIMISTIC_ACTION": 0
        });
        expect(queuedActions.length).toEqual(0);
        expect(optimisticState).toEqual(baseState);
    });
    it("only reduces normal actions into the base state if they are at the beginning of the queuedActions array", () => {
        let {
            baseState,
            queuedActions,
            optimisticState
        } = optimisticReduction(ZERO_STATE, [], testReducer, NORMAL_ACTION);
        ({
            baseState,
            queuedActions,
            optimisticState
        } = optimisticReduction(baseState, queuedActions, testReducer, OPTIMISTIC_ACTION_0));
        ({
            baseState,
            queuedActions,
            optimisticState
        } = optimisticReduction(baseState, queuedActions, testReducer, NORMAL_ACTION));
        expect(baseState).toEqual({
            "NORMAL_ACTION"                : 1,
            "OPTIMISTIC_ACTION"            : 0,
            "REPLACEMENT_NORMAL_ACTION"    : 0,
            "REPLACEMENT_OPTIMISTIC_ACTION": 0
        });
        expect(queuedActions.length).toEqual(2);
        expect(optimisticState).toEqual({
            "NORMAL_ACTION"                : 2,
            "OPTIMISTIC_ACTION"            : 1,
            "REPLACEMENT_NORMAL_ACTION"    : 0,
            "REPLACEMENT_OPTIMISTIC_ACTION": 0
        });
    });
    it("doesn't reduce replacement normal actions into the base state if there is an optimistic action before them in the queuedActions array", () => {
        let {
            baseState,
            queuedActions,
            optimisticState
        } = optimisticReduction(ZERO_STATE, [], testReducer, OPTIMISTIC_ACTION_0);
        ({
            baseState,
            queuedActions,
            optimisticState
        } = optimisticReduction(baseState, queuedActions, testReducer, OPTIMISTIC_ACTION_1));
        ({
            baseState,
            queuedActions,
            optimisticState
        } = optimisticReduction(baseState, queuedActions, testReducer, REPLACEMENT_NORMAL_ACTION_1));
        expect(baseState).toEqual({
            "NORMAL_ACTION"                : 0,
            "OPTIMISTIC_ACTION"            : 0,
            "REPLACEMENT_OPTIMISTIC_ACTION": 0,
            "REPLACEMENT_NORMAL_ACTION"    : 0
        });
        expect(queuedActions.length).toEqual(2);
        expect(optimisticState).toEqual({
            "NORMAL_ACTION"                : 0,
            "OPTIMISTIC_ACTION"            : 1,
            "REPLACEMENT_NORMAL_ACTION"    : 1,
            "REPLACEMENT_OPTIMISTIC_ACTION": 0
        });
    });
});
