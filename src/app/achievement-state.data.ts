import { EQState } from "./eqstate.status";
import { ParseState } from "./parse-state.data";
import { AchievementData } from "./achievement-data";

export class AchievementState {
    public categoryID: number= -1;
    public achievementID: number = -1;
    public clientID: number = -1;
    public state: EQState = EQState.Incomplete;
    public count: number = 0;

    constructor(
    ){}

    static fromParseState(state:ParseState): AchievementState {
        const acs = new AchievementState();
        return acs;
    }
}

/*
        ['state', state],
        ['count', count],
        ['total', total],
        ['optional', optional],
*/