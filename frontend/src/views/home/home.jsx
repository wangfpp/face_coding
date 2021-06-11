import React, { useStatus, useRef, useEffect } from "react";
import lottie from "lottie-web";
import lottieJson from "../../assets/json/55383-web-development-animation.json";
console.log(lottieJson)

const Home = props => {
    const lottieIntense = null;
    useEffect(() => {
        lottieIntense = lottie.loadAnimation({
            container: document.getElementById("#lottie_item"), // the dom element that will contain the animation
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: lottieJson // the path to the animation json
        });
        return () => {
            lottieIntense.destroy();
        }
    }, [])

    return(
        <div id="home">
            <div id="lottie_item"></div>
        </div>
    )
}

export default Home;