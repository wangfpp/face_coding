import { combineReducers } from 'redux';
import { saveJanusInfo } from './save_janus_info.js';
import { saveToken } from "./save_token.js";


const combineReduced = combineReducers({
    token: saveToken,
    janus_info: saveJanusInfo
});

export default combineReduced;