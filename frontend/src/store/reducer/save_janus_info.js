import { SAVE_JANUS_INFO, initState } from "../actions/action_type_initstate";

const saveJanusInfo = (state = initState, action) => {
    switch(action.type) {
        case SAVE_JANUS_INFO:
            return action.payload;
        default:
            return state;
    }
}

export {
    saveJanusInfo
}