import React, { useState, useRef, useEffect } from "react";
import lottie from "lottie-web";
import lottieJson from "../../assets/json/lottie.json";
import { JanusInfoServer } from "../../api/index.js";
import { SAVE_TOKEN } from "../../store/actions/action_type_initstate.js";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import "./home.scss";
import { asyncSaveJanusInfo } from "../../store/actions/async_action";

const Home = props => {
    let { saveToken, saveJanusInfo } = props;
    let lottieIntense = null;
    const lottieElement = useRef(null);
    let [token, setToken] = useState(null);
    useEffect(async () => {
        let {data} = await JanusInfoServer.getToken();
        setToken(data);
    }, []);

    useEffect(async () => {
        if (token) {
            saveJanusInfo(token)
        }
    }, [token])

    useEffect(() => {
        if (lottieElement && lottieElement.current) {
            lottieIntense = lottie.loadAnimation({
                container: lottieElement.current, // the dom element that will contain the animation
                loop: true,
                autoplay: true,
                animationData: lottieJson // the path to the animation json
            });
            return () => {
                lottieIntense.destroy();
            }
        }
    }, [lottieElement])
    function goMain() {
        props.history.push({
            pathname: "/main",
            state: { init: true }
        })
    }
    return(
        <div id="home" onClick={goMain}>
            <div id="lottie_item" ref={lottieElement}></div>
        </div>
    )
}

const mapStateToProps = state => {
    let { token } = state;
    return {
        token
    }
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

export default connect(mapStateToProps, mapDispatchToProps)(Home);