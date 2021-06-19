import React, { useEffect, useRef } from "react";
import "./rtc_view.scss";

const RtcView = props => {
    let { id, stream, display } = props.info;
    let videoElementRef = useRef(null);

    useEffect(() => {  
        if (videoElementRef) {
            let videoNode = videoElementRef.current;
            videoNode.srcObject = stream;
        }
    }, [videoElementRef])


    return(
        <div className="base_video" id={id}>
            <video ref={videoElementRef} autoPlay controls width="200"></video>
            <div className="video_info">{display}</div>
        </div>
    )
}

export default RtcView;