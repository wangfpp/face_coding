import React, { useState, useEffect } from "react";
import { JanusInfoServer } from "../../api/index.js";
import { SAVE_TOKEN } from "../../store/actions/action_type_initstate.js";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { asyncSaveJanusInfo } from "../../store/actions/async_action";


const GetToken = props => {
    let { saveJanusInfo } = props;
    let [token, setToken] = useState(null);

    useEffect(async () => {
        let {data} = await JanusInfoServer.getToken();
        setToken(data);
    }, []);

    useEffect(async () => {
        console.log(11111111, token)
        if (token) {
            saveJanusInfo(token)
        }
    }, [token])
    return null;
}

const mapDispatchToProps = dispatch => {
    return {
        saveToken: payload => {
            dispatch({type: SAVE_TOKEN, payload});
        },
        saveJanusInfo: payload => {
            bindActionCreators(asyncSaveJanusInfo, dispatch)(payload)
        }
    }
}

export default connect(null, mapDispatchToProps)(GetToken);