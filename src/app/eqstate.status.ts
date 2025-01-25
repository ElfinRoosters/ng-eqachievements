export enum EQState {
    Incomplete,
    Completed,
    Locked
}

export function convertToEQStateEnum(str: string): EQState {
    var state = EQState[str as keyof typeof EQState];
    if (state !== undefined) { return state; }

    switch (str) {
        case 'L':
            state = EQState.Locked;
            break;
        case 'C':
            state = EQState.Completed;
            break;
        case 'I':
        default:
            state = EQState.Incomplete;
            break;

    }

    return state;
}