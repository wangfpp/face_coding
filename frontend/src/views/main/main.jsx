import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import Zkws from '../../utils/zk_ws.js';
import Commication from "../../components/commication/commcation.jsx";
import { Input, Button } from 'antd';
import "./main.scss";
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/monokai.css';

const { TextArea } = Input;


const Main = props => {
    let [codeStr, setcodeStr] = useState("");
    let initOptions = {
        theme: "monokai",
          keyMap: "sublime",
          mode: "jsx",
          // 括号匹配
          matchBrackets: true,
          // tab缩进
          tabSize: 2
    }
    let [codeMirrorOptions, setcodeMirrorOptions] = useState(initOptions);
    let [commicationText, setcommicationText] = useState("");
    let [commicationList, setcommicationList] = useState([]);
    let ws = null;
    useEffect(() => {
        ws = new Zkws("ws://localhost:8089/ws", "face-coding", 2, null, null, res => {
            let { code, data } = res;
            if (code == 0) {
                if(data) {
                    try {
                        let parseStr = JSON.parse(data);
                        let { type, msg, who, date } = parseStr;
                        switch(type) {
                            case "code":
                                setcodeStr(msg);
                                break;
                            case "commication":
                                commicationList.push({
                                    who,
                                    msg,
                                    date
                                })
                                setcommicationList(commicationList);
                                break;
                        }
                    } catch (error) {
                        
                    }
                }
            }
        })
    }, []);
    return(
        <div id="main">
            <div className="main_left">
                <CodeMirror
                    className="mirror_container"
                    value={codeStr}
                    options={codeMirrorOptions}
                    onChange={(editor, data) => {
                        let value = editor.getValue();
                        let { origin } = data;
                        setcodeStr(value);
                        if (ws && origin !== "setValue") {
                            ws.send({type: "code", msg: value, who: "wangfpp"});
                        }
                    }}
                />
            </div>
            <div className="main_right">
                <div className="right_top">
                    <div className="camera">

                    </div>
                </div>
                <div className="right_bottom">
                    {commicationList.length ?
                    commicationList.map(item => {
                        let { msg, date } = item;
                        <Commication msg={msg} date={date}></Commication>
                    }) : null}
                    <TextArea
                        value={commicationText}
                        showCount={true}
                        autoSize={false}
                        bordered={false}
                        onChange={ e=> {setcommicationText(e.target.value)}}
                    ></TextArea>
                </div>
            </div>
        </div>
    )
}

export default Main;