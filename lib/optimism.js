export function optimisticReduction(baseState, queuedActions, reducer, action) {
    // This function is pure but this function needs to compute the new baseState, queuedActions, and optimisticState.
    // We will return these items but we need to make new versions of each.
    // We therefore want a shallow copy of queuedActions...
    let modifiedQueuedActions = queuedActions.slice();

    // and a variable to hold the new baseState while we are modifying it.
    let modifiedBaseState = baseState;

    // If this action has an optimisticId, it replaces any existing action with the same optimisticId.
    // Optimistic and replacements for optimistic actions all have a .meta.optimisticId
    const {meta} = action;
    if(typeof meta === "object" && meta !== null) {
        const {optimisticId} = meta;
        const targedActionIndex = modifiedQueuedActions.findIndex((queuedAction) => {
            if(typeof queuedAction.meta === "object") {
                return queuedAction.meta.optimisticId === optimisticId;
            } else {
                return false;
            }
        });
        if(targedActionIndex !== -1) {
            modifiedQueuedActions.splice(targedActionIndex, 1, action);
        } else {
            // Actions that don't replace anything are added to the end of the array.
            modifiedQueuedActions.push(action);
        }
    } else {
        // Normal actions are simply added to the end of the modifiedQueuedActions array.
        modifiedQueuedActions.push(action);
    }

    // Actions at the start of the array that aren't optimistic are reduced into the modifiedBaseState.
    // Optimistic actions have .meta.optimistic set to true.
    while(modifiedQueuedActions.length > 0 && !(typeof modifiedQueuedActions[0].meta === "object" && modifiedQueuedActions[0].meta.optimistic)) {
        modifiedBaseState = reducer(modifiedBaseState, action);
        modifiedQueuedActions.shift();
    }

    // The optimistic state is now assembled from the modifiedBaseState and remaining modifiedQueuedActions.
    const optimisticState = modifiedQueuedActions.reduce(reducer, modifiedBaseState);

    return {
        baseState: modifiedBaseState,
        queuedActions: modifiedQueuedActions,
        optimisticState
    };
}
