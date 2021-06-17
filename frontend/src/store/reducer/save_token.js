import { SAVE_TOKEN, initState } from "../actions/action_type_initstate";

const saveToken = (state = initState, action) => {
    switch(action.type) {
        case SAVE_TOKEN:
            return action.payload;
        default:
            return state;
    }
}

export {
    saveToken
}