import React, { useEffect, useRef, useState } from "react";
import "./rtc_view.scss";

const RtcView = props => {
    let { id, stream, display, local } = props.info;
    let videoElementRef = useRef(null);
    let [isScreen, setIsScreen] = useState(false);

    useEffect(() => {  
        if (videoElementRef) {
            let videoNode = videoElementRef.current;
            videoNode.srcObject = stream;
        }
    }, [videoElementRef, stream])


    return(
        <div className="base_video" id={id}>
            <video ref={videoElementRef} autoPlay muted={local}></video>
            <div className="video_info">{display}</div>
        </div>
    )
}

export default RtcView;