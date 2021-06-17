import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import Zkws from '../../utils/zk_ws.js';
import Janus from "../../utils/janus.js";
import Commication from "../../components/commication/commcation.jsx";
import { Input, Button, message } from 'antd';
import { useLocation } from "react-router-dom";
import { ZkToast } from '../../components/message/message.js';
import { connect } from "react-redux";
import "./main.scss";
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/monokai.css';
import { baseIp } from '../../utils/config.js';

const { TextArea } = Input;


const Main = props => {
    const location = useLocation();
    let { janus_info } = props;
    let { ws_port, wss_port, string_ids, ice_servers:iceServers } = janus_info;
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
    let [JanusPluginHandle, setJanusPluginHandle] = useState(null);
    let [roomId, setRoomId] = useState(60811);
    let ws = null;
    let janus = null;
    const queryAllParams = url => {
        let obj = {};
        if (url.length) {
            let paramsItemList = url.split("&");
            paramsItemList.forEach(item => {
                let [key, value] = item.split("=");
                obj[key] = value;
            })
        }
        console.log(url, obj)
        return obj;
    }
    // 判断是否应该创建房间
    useEffect(() => {
        
        if (location.state && location.state.init) {
            if (JanusPluginHandle) {
                JanusPluginHandle.send(
                    {message: 
                        {
                            "request" : "create",
                            "room" : string_ids ? String(roomId) : roomId,
                            "description" : '测试房间'
                        }
                    }
                )
            }
        }
        console.log(JanusPluginHandle)
    }, [JanusPluginHandle, location])

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

    useEffect(() => {
        let server = `wss://${baseIp}:${wss_port}`
        Janus.init({
            debug: "all",
            callback: () => {
                janus = janus = new Janus({
                iceServers: iceServers && iceServers.length > 0 ? iceServers : null,
                server,
                success: () => {
                  Janus.log('succerr', {aaa: 11111})
                  // 链接上WebSocket
                  // NOTE: @wangfpp, @fangxb，感觉这里链接后，应该等 c# 的命令，决定是否attach吧？
                  //    不过每个听讲端至少 attach 两个 handle，一个是发布自己的 webcam，一个订阅主讲的 webcam;
                  //    主讲如果是轮训，一个发布自己的 webcam，再有8个订阅学生（根据学生的个数）
                  //    订阅可以在收到 publisher 列表变换后执行：attach handler, join as subscripter, subscribe feed
                  janus.attach({
                    plugin: "janus.plugin.videoroom",
                    opaqueId: Janus.randomString(12),
                    success: (pluginHandle) => {
                        setJanusPluginHandle(pluginHandle);
                    },
                    error: (error) => {
                      ZkToast.error(error);
                    },
                    // 在getUserMedia调用时触发　提示用户接受设备访问授权
                    consentDialog: (on) => {
                      let dialog = null;
                      if (on) {
                        dialog = ZkToast.loading("aaaaa", 0);
                      } else {
                        message.destroy();
                      }
                    },
                    // PeerConnection处于活跃状态并且ICE DTLS都操作成功是返回true PeerConnection断开返回false
                    webrtcState: (medium, on) => {
                    },
                    onmessage: (msg, jsep) => {
                      let {
                        videoroom: event,
                        plugindata,
                        unpublished,
                        publishers,
                        leaving,
                        participants,
                        transaction
                      } = msg;
                      if (event) {
                        switch (event) {
                          case "joined":
                            // let rcData = this.resolveJanusMsg(msg);

                            break;
                          case "participants":
                            if(participants && participants.length) {
                              // let { publishersData } = this.state;
                              // participants.forEach(item => {
                              //   try {
                              //     let json_display = JSON.parse(item.display);
                              //     let { class_id, class_name } = json_display;
                              //     if (class_id && class_name && class_id !== this.class_id && class_name !== this.class_name) {
                              //       publishersData.push(item);
                              //     }
                              //   } catch (error) {
                              //     // PASS
                              //   }
                              // })
                              // let deleteLocalPar = this.unique([...publishersData])
                              this.participantsList = this.unique([...this.participantsList, ...participants]);
                              console.log('每次有人加入检查是否需要订阅', this.participantsList, this.subscribers);
                              this.participantsList.forEach(publish_item => {
                                
                                try {
                                  let {id,display,audio_codec,video_codec} = publish_item;
                                  let { class_id:local_class_id, class_name: local_class_name } =  JSON.parse(display);
                                  this.subscribers.forEach(item => {
                                    console.log(this.subscribers, 22222222);
                                    let { class_id, class_name } = item;
                                    if (local_class_id == class_id && local_class_name == class_name) {
                                      this.newRemoteFeed(id, Number(this.room), display, audio_codec, video_codec);
                                    }
                                  })
                                } catch (error) {
                                  
                                }
                              })
                              // this.setState({
                              //   publishersData: deleteLocalPar
                              // }, ()=>this.checkList())
                            }
                            break;
                          case "event":
                            if ('error' in msg) {
                              console.log('JANUS异常:', msg['error']);
                              ZkToast.error(msg['error'], 5);
                            } else {
                              // 有错误就不再继续获取成员列表
                              JanusPluginHandle.send({message: {"request" : "listparticipants",
                            "room" : Number(this.room)}})
      
                              if (this.transactionMapTid[transaction]) {
                                this.finish(this.transactionMapTid[transaction], {code: 0, reason: 'success'});
                              }
                            }
                            // let rcData_ev = this.resolveJanusMsg(msg);
                            
                            if (unpublished) { // 撤销发布时重新布局
                              let { publishersData } = this.state,
                              _index = publishersData.findIndex((item) => item.id === unpublished),
                              all_person_index = this.participantsList.findIndex((item) => item.id === unpublished)
                              if (_index >= 0) {
                                publishersData.splice(_index, 1);
                              }
                              if (all_person_index >= 0) {
                                this.participantsList.splice(all_person_index, 1);
                              }
                              this.setState({
                                publishersData
                              }, ()=>this.checkList())
                              if (msg['leaving']) {
                                console.log('leavingleavingleavingleaving', msg)
                              }
                            }
                            // 离开房间
                            if (leaving) {
                              console.log('有人离开房间啦．．．．', leaving);
                              let { publishersData } = this.state,
                              _index = publishersData.findIndex((item) => item.id === leaving);
                              if (_index >= 0) {
                                publishersData.splice(_index, 1);
                              }
                              this.setState({
                                publishersData
                              }, ()=>this.checkList())
                            }
                            break;
                        }
                      }
                      if (jsep) {
                        JanusPluginHandle.handleRemoteJsep({
                          jsep: jsep,
                        });
                      }
                      if (plugindata) {
                        let { data } = plugindata;
                        console.log(data.error);
                        if (data.error) {
                          ZkToast.error(data.error);
                          return;
                        }
                      }
                    },
                    ondataopen: (msg) => {
                      console.warn(`ondataopen${msg}`);
                    },
                    ondata: (data) => {
                      console.warn(`ondata${data}`);
                    },
                    onlocalstream: (stream) => {
                      if (this.role === 0) { // 只有主讲才显示本地摄像头
                        let localName = this.role == 0 ? "主讲" : "本地";
                        let uniqueLocal = this.unique([
                          ...this.state.publishersData,
                          ...[
                            {
                              id: "localStream",
                              name: localName,
                              stream,
                              display: JSON.stringify({class_id: this.class_id, class_name:this.class_name,role:this.role})
                            },
                          ]
                        ])
                        this.setState({
                          publishersData: uniqueLocal
                        },_=>this.checkList());
                      }
                    },
                    oncleanup: () => {
                      let { publishersData } = this.state;
                      publishersData.splice(
                        publishersData.findIndex((item) => item.id === "localStream"),
                        1
                      );
                      this.setState({
                        publishersData: [...publishersData],
                      });
                    },
                  });
                },
                error: (janus_err) => {
                  ZkToast.error(`Janus err: ${janus_err}`);
                },
                destroyed: (_) => {
                  // TODO.... Janus被销毁
                },
              });
            },
          });
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

const mapStateToProps = state => {
    let { janus_info } = state;
    return {
        janus_info
    }
}
export default connect(mapStateToProps)(Main);