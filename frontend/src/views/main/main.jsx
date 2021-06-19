import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import RtcView from "../../components/rtc_view/rtc_view.jsx";
import Zkws from '../../utils/zk_ws.js';
import Janus from "../../utils/janus.js";
import Commication from "../../components/commication/commcation.jsx";
import { Input, Button } from 'antd';
import { ShareAltOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
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
const randomRoomId = len => {
    let nums = [0,1,2,3,4,5,6,7,8,9];
    let room = "6081";
    for(var i = 0; i < len; i++) {
        let _index = Math.floor(Math.random()*9);
        room += nums[_index];
    }
    return Number(room);
}
let roomId = randomRoomId(10)

const Main = props => {
    const location = useLocation();
    let feeds = [];
    let { janus_info } = props;
    let { ws_port, wss_port, string_ids, ice_servers:iceServers } = janus_info;
    let [codeStr, setcodeStr] = useState("");
    let JanusPluginHandle = null;
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
    let [originalJanusPluginHandle, setoriginalJanusPluginHandle] = useState(null);
    let [remoteStreamList, setRemoteStreamList] = useState([]);
    let [localStream, setLocalStream] = useState(null);
    let localStreamElement = useRef(null);
    let ws = null;
    let janus = null;
    console.log("init room", roomId);
    

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
    const publishOwnFeed = (pluginHandle, useAudio, transaction) => {
        console.log(pluginHandle)
        pluginHandle.createOffer({
          media: {
            audioRecv: false,
            videoRecv: false,
            audioSend: useAudio,
            videoSend: true,
            data: true
          }, // Publishers are sendonly
          simulcast: false,
          simulcast2: false,
          success: function (jsep) {
            let publish = { request: "configure", audio: useAudio, video: true };
            pluginHandle.send({ message: publish, jsep: jsep }, transaction);
          },
          error: function (error) {
            if (useAudio) {
              publishOwnFeed(pluginHandle, false, transaction);
            } else {
              ZkToast.error("WebRTC error... " + JSON.stringify(error));
            }
          },
        });
    }

    // 本地流显示
    useEffect(() => {
        if (localStreamElement && localStream) {
            let videoNode = localStreamElement.current;
            videoNode.srcObject = localStream;
        }
    }, [localStreamElement, localStream])

    // 判断是否应该创建房间
    useEffect(() => {
        let url = location.search ? location.search.split("?")[1]: "";
        let urlParams = queryAllParams(url)
        console.log(urlParams, location);
        if (urlParams.init && !urlParams.share) {
            if (originalJanusPluginHandle) {
                console.log("create room", roomId);
                originalJanusPluginHandle.send(
                    {message:
                        {
                            "request" : "create",
                            "room" : string_ids ? String(roomId) : roomId,
                            "description" : '测试房间'
                        }
                    }
                )
                originalJanusPluginHandle.send({
                    message: {
                        request: "list"
                    }
                })
            }
        }
        if (urlParams.share) {
            if (originalJanusPluginHandle) {
                let room = urlParams.roomId;
                if (!room) {
                    ZkToast.error("未发现房间号");
                    return;
                }
                roomId = room;
                originalJanusPluginHandle.send(
                    {message:
                        {
                            "request" : "join",
                            "ptype": "publisher",
                            "room" : string_ids ? String(room) : room,
                            "display" : '面试者'
                        }
                    }
                )
                originalJanusPluginHandle.send({
                    message: {
                        request: "list"
                    }
                })
            }
        }
    }, [originalJanusPluginHandle, location])

    useEffect(() => {
        let url = location.search ? location.search.split("?")[1]: "";
        let urlParams = queryAllParams(url)
        console.log(urlParams, location);
        let server = `wss://${baseIp}:${wss_port}`
        Janus.init({
            debug: "all",
            callback: () => {
                janus = janus = new Janus({
                iceServers: iceServers && iceServers.length > 0 ? iceServers : null,
                server,
                success: () => {
                  janus.attach({
                    plugin: "janus.plugin.videoroom",
                    opaqueId: Janus.randomString(12),
                    success: (pluginHandle) => {
                        JanusPluginHandle = pluginHandle;
                        setoriginalJanusPluginHandle(pluginHandle);
                    },
                    error: (error) => {
                      ZkToast.error(error);
                    },
                    // 在getUserMedia调用时触发　提示用户接受设备访问授权
                    consentDialog: (on) => {
                    },
                    // PeerConnection处于活跃状态并且ICE DTLS都操作成功是返回true PeerConnection断开返回false
                    webrtcState: (medium, on) => {
                    },
                    onmessage: (msg, jsep) => {
                        console.log(msg, JanusPluginHandle);
                        let {
                            videoroom: event,
                            plugindata,
                            unpublished,
                            publishers,
                            leaving,
                            participants,
                            transaction,
                            list
                        } = msg;
                        if (unpublished) {
                            
                        }
                        if (publishers) {
                            publishers.forEach(item => {
                                let { audio_codec, id, display, talking, video_codec} = item;
                                newRemoteFeed(id, roomId, display, true, video_codec);
                            })
                        }
                        if (list) {
                            // console.log("delet room", roomId);
                            list.forEach(item => {
                                let { room: exit_room } = item;
                                let parrent = /^6081[0-9]+$/
                                if (exit_room != roomId && parrent.test(exit_room)) {
                                    JanusPluginHandle.send({
                                        message: {
                                            request: "destroy",
                                            room: exit_room
                                        }
                                    })
                                }
                            })
                        }
                      if (event) {
                        switch (event) {
                            case "created":
                                JanusPluginHandle.send(
                                    {message:
                                        {
                                            "request" : "join",
                                            "ptype": "publisher",
                                            "room" : string_ids ? String(roomId) : roomId,
                                            "display" : '面试官'
                                        }
                                    }
                                )
                                
                            case "joined":
                                publishOwnFeed(JanusPluginHandle, true, uuidv4())
                                break;
                            case "participants":
                                break;
                            case "event":
                                if ('error' in msg) {
                                    console.log('JANUS异常:', msg['error']);
                                    ZkToast.error(msg['error'], 5);
                                } else {
                                    JanusPluginHandle.send(
                                        {message: 
                                            {
                                                "request" : "listparticipants",
                                                "room" : string_ids ? String(roomId) : roomId,
                                            }
                                        }
                                    )
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
                      console.log(`111111111ondata${data}`);
                    },
                    onlocalstream: (stream) => {
                        console.log("local stream", stream);
                        setLocalStream(stream);
                    },
                    oncleanup: () => {
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
          return (() => {
            if(!urlParams.share) {
                JanusPluginHandle.send({
                    message: {
                        request: "destroy",
                        room: roomId
                    }
                })
            }
            
          })
    }, [JanusPluginHandle]);
    /**
     * 
     * @param {String} url page url
     * @param {Number} index 要插入的位置
     * @param {String} param 要插入的参数String
     * @returns 
     */
    const insertParams = (url, index, param) => {
        return url.slice(0, index) + param + url.slice(index);
    }
    /**
     * @description 把地址栏URL拷贝到剪切板
     */
    const copyPageUrl = async () => {
        try {
            let href = window.location.href;
            let hasParam = location.search ? true : false;
            let param = `share=true&roomId=${roomId}`;
            param = hasParam ? `&${param}` : `?${param}`;
            href += param;
            await navigator.clipboard.writeText(href);
            ZkToast.success("url复制成功");
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }
    /**
    * 
    * @param {Number} id feedid
    * @param {*} room_id room_id
    * @param {*} display display
    * @param {*} audio true
    * @param {*} video  false
    */
    const newRemoteFeed = (id, room_id, display, audio, video) => {
     let remoteHandle = null;
     if (janus) {
       janus.attach({
         plugin: "janus.plugin.videoroom",
         opaqueId: "video-room" + Janus.randomString(12),
         success: function (pluginHandle) {
           remoteHandle = pluginHandle;
           remoteHandle.simulcastStarted = false;
           let subscribe = {
             request: "join",
             room: string_ids ? String(room_id) : room_id,
             ptype: "subscriber",
             feed: id
           };
           if (
             Janus.webRTCAdapter.browserDetails.browser === "safari" &&
             (video === "vp9" || (video === "vp8" && !Janus.safariVp8))
           ) {
             if (video) video = video.toUpperCase();
             subscribe["offer_video"] = false;
           }
           remoteHandle.videoCodec = video;
           remoteHandle.send({
             message: subscribe,
           });
         },
         error: function (error) {
           Janus.error("  -- Error attaching plugin...", error);
         },
         onmessage: (msg, jsep) => {
           let event = msg["videoroom"];
           if (event) {
             if (event === "attached") {
               try {
                 remoteHandle.rfid = msg["id"];
                 remoteHandle.rfdisplay = msg["display"];
                 for (let i = 1; i < feeds.length; i++) {
                   if (!feeds[i]) {
                     feeds[i] = remoteHandle;
                     remoteHandle.rfindex = i;
                     break;
                   }
                 }
               } catch (error) {
               }
             } else if (event === "event") {
 
             }
           }
           if (jsep) {
             // Answer and attach
             remoteHandle.createAnswer({
               jsep: jsep,
               media: {
                 audioSend: false,
                 videoSend: false,
                 data: true
               },
               success: function (jsep) {
                 let body = {
                   request: "start",
                   room: string_ids ? String(room_id) : room_id,
                 };
                 remoteHandle.send({
                   message: body,
                   jsep: jsep,
                 });
               },
               error: function (error) {
                 Janus.error("WebRTC error:", error);
               },
             });
           }
         },
         webrtcState: function (on) {},
         ondata: data => {
            setcodeStr(data);
         },
         onremotestream: (stream) => {
            let copyList = [...remoteStreamList]
            let hasStream_index = copyList.findIndex(item => item.id == id);
            if (hasStream_index != -1) {
                copyList[hasStream_index].stream = stream;
            } else {
                copyList.push({
                    id,
                    display,
                    stream
                });
            }
            setRemoteStreamList(copyList);
        //    let videoTracks = stream.getVideoTracks();
         },
         oncleanup: function () {
           console.log('clear..............')
           remoteHandle.simulcastStarted = false;
         },
         detach: (a, b, c) => {
           console.log('detachdetachdetachdetach', a, b, c);
         }
       });
     }
   };
    return(
        <div id="main">
            <div className="main_left">
                <div className="control_header">
                    <Button icon={<ShareAltOutlined />} onClick={() => {

        console.log(remoteStreamList, 2222, remoteStreamList.length)
        copyPageUrl()
                    }}></Button>
                </div>
                <div className="editer_containrt">
                    <CodeMirror
                        className="mirror_container"
                        value={codeStr}
                        options={codeMirrorOptions}
                        onChange={(editor, data) => {
                            let value = editor.getValue();
                            let { origin } = data;
                            setcodeStr(value);
                            if (JanusPluginHandle && origin !== "setValue") {
                                JanusPluginHandle.data({text: value, success: res=> {
                                }, err: err => {
                                    console.log(err);
                                }});
                            }
                        }}
                    />
                </div>
            </div>
            <div className="main_right">
                <div className="right_top">
                    <div className="camera">
                        <video autoPlay controls muted ref={localStreamElement}></video>
                        {remoteStreamList.length ? 
                        remoteStreamList.map(item => {
                           return <RtcView info={item} key={item.id}></RtcView>
                        }): null}
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