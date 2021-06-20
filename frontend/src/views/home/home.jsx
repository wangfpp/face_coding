import React, { useState, useRef, useEffect } from "react";
import lottie from "lottie-web";
import lottieJson from "../../assets/json/lottie.json";
import GetToken from "../../components/get_token/get_token.jsx";
import "./home.scss";

const Home = props => {
    let lottieIntense = null;
    const lottieElement = useRef(null);

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
            search: "?init=true"
        })
    }
    return(
        <div id="home" onClick={goMain}>
            <div id="lottie_item" ref={lottieElement}></div>
        </div>
    )
}

export default Home