import { JanusInfoServer } from "../../api"
import { SAVE_JANUS_INFO } from "./action_type_initstate"
const asyncSaveJanusInfo = token => {
    return async dispatch => {
        let { data } = await JanusInfoServer.getInfo(token)
        dispatch({type: SAVE_JANUS_INFO, payload: data});
    }
}

export {
    asyncSaveJanusInfo
}