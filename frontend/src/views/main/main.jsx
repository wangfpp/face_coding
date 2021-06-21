import React, { useState, useEffect, useRef } from 'react';
import { INIT, ATTACH, CREATE, JOIN, PUBLISH } from "../../utils/janus_status.js";
import CodeMirror from '@uiw/react-codemirror';
import RtcView from "../../components/rtc_view/rtc_view.jsx";
import Janus from "../../utils/janus.js";
import Commication from "../../components/commication/commcation.jsx";
import { Input, Button, Modal, Form, notification, Select } from 'antd';
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
import allModes from "./mode.js"
import { codeMirrorThemes } from "./themes.js";

import 'codemirror/theme/3024-day.css';
import 'codemirror/theme/3024-night.css';
import 'codemirror/theme/abcdef.css';
import 'codemirror/theme/ambiance-mobile.css';
import 'codemirror/theme/ambiance.css';
import 'codemirror/theme/base16-dark.css';
import 'codemirror/theme/base16-light.css';
import 'codemirror/theme/bespin.css';
import 'codemirror/theme/blackboard.css';
import 'codemirror/theme/cobalt.css';
import 'codemirror/theme/colorforth.css';
import 'codemirror/theme/darcula.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/duotone-dark.css';
import 'codemirror/theme/duotone-light.css';
import 'codemirror/theme/eclipse.css';
import 'codemirror/theme/elegant.css';
import 'codemirror/theme/erlang-dark.css';
import 'codemirror/theme/gruvbox-dark.css';
import 'codemirror/theme/hopscotch.css';
import 'codemirror/theme/icecoder.css';
import 'codemirror/theme/idea.css';
import 'codemirror/theme/isotope.css';
import 'codemirror/theme/lesser-dark.css';
import 'codemirror/theme/liquibyte.css';
import 'codemirror/theme/lucario.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/mbo.css';
import 'codemirror/theme/mdn-like.css';
import 'codemirror/theme/midnight.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/theme/neat.css';
import 'codemirror/theme/neo.css';
import 'codemirror/theme/night.css';
import 'codemirror/theme/oceanic-next.css';
import 'codemirror/theme/panda-syntax.css';
import 'codemirror/theme/paraiso-dark.css';
import 'codemirror/theme/paraiso-light.css';
import 'codemirror/theme/pastel-on-dark.css';
import 'codemirror/theme/railscasts.css';
import 'codemirror/theme/rubyblue.css';
import 'codemirror/theme/seti.css';
import 'codemirror/theme/shadowfox.css';
import 'codemirror/theme/solarized.css';
import 'codemirror/theme/ssms.css';
import 'codemirror/theme/the-matrix.css';
import 'codemirror/theme/tomorrow-night-bright.css';
import 'codemirror/theme/tomorrow-night-eighties.css';
import 'codemirror/theme/ttcn.css';
import 'codemirror/theme/twilight.css';
import 'codemirror/theme/vibrant-ink.css';
import 'codemirror/theme/xq-dark.css';
import 'codemirror/theme/xq-light.css';
import 'codemirror/theme/yeti.css';
import 'codemirror/theme/zenburn.css';



const { Option } = Select;
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
let roomId = randomRoomId(10);
let rtcStatus = null; // 记录RTC的状态 attch createRoom joinRoom publish unpublish leave destory ...
let localDisplay = null;
let localId = null;
let screenId = null;
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
   return obj;
}
const Main = props => {
    const location = useLocation();
    const [form] = Form.useForm();
    
    let feeds = [];
    let { janus_info } = props;
    let { ws_port, wss_port, string_ids, ice_servers:iceServers } = janus_info;
    let [codeStr, setcodeStr] = useState("");
    let JanusPluginHandle = null;
    let JanusScreenPluginHandle = null;
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
    let [isMain, setIsMain] = useState(false);
    let [commicationText, setcommicationText] = useState("");
    let [commicationList, setcommicationList] = useState([]);
    let [originalJanusPluginHandle, setoriginalJanusPluginHandle] = useState(null);
    let [remoteStreamList, setRemoteStreamList] = useState([]);
    let [localStream, setLocalStream] = useState([]);
    let [display, setDisplay] = useState(null);
    let [showModal, setShowModal] = useState(false);
    let [mode, setMode] = useState("jsx");
    let [codeMirrorTheme, setcodeMirrorTheme] = useState("monokai")
    let localStreamElement = useRef(null);
    let ws = null;
    let janus = null;
    
    let url = location.search ? location.search.split("?")[1]: "";
    let urlParams = queryAllParams(url);

    useEffect(() => {
        let url = location.search ? location.search.split("?")[1]: "";
        let urlParams = queryAllParams(url);
        if (urlParams.share) {
            setIsMain(false);
            return
        }
        if (urlParams.init && !urlParams.share) {
            setIsMain(true);
        }
    }, []);

    
    const publishOwnFeed = (pluginHandle, useAudio, isScreen=false, transaction) => {
        pluginHandle.createOffer({
          media: {
            video: isScreen ? "screen" : true,
            audioRecv: false,
            videoRecv: false,
            audioSend: useAudio,
            videoSend: true,
            data: !isScreen 
          }, // Publishers are sendonly
          simulcast: false,
          simulcast2: false,
          success: function (jsep) {
            rtcStatus = PUBLISH;
            let publish = { request: "configure", audio: useAudio, video: true };
            pluginHandle.send({ message: publish, jsep: jsep }, transaction);
          },
          error: function (error) {
            if (useAudio) {
              publishOwnFeed(pluginHandle, false, isScreen, transaction);
            } else {
              ZkToast.error("WebRTC error... " + JSON.stringify(error));
            }
          },
        });
    }

    // 初始化 需要用户输入昵称再进行RTC通话
    useEffect(() => {
        setShowModal(true);
        let url = location.search ? location.search.split("?")[1]: "";
        let urlParams = queryAllParams(url);
        if (urlParams.share) {
            let room = urlParams.roomId;
            if (!room) {
                ZkToast.error("未发现房间号");
                return;
            }
            roomId = room;
        }
    }, [])
    /**
     * @description 表单验证通过后的事件 隐藏modal
     * @param {*} values 
     */
    const onFinish = values => {
        let { display } = values;
        localDisplay = display;
        setDisplay(display);
        setShowModal(false);
    }

    // 输入 昵称后才能加入房间
    useEffect(() => {
        console.log(rtcStatus, originalJanusPluginHandle);
        let url = location.search ? location.search.split("?")[1]: "";
        let urlParams = queryAllParams(url)
        if (display && rtcStatus && originalJanusPluginHandle) {
            if (urlParams.share && rtcStatus >= ATTACH) {
                originalJanusPluginHandle.send(
                    {message:
                        {
                            "request" : "join",
                            "ptype": "publisher",
                            "room" : string_ids ? String(roomId) : roomId,
                            "display" : display
                        }
                    }
                )
                return
            }
            if(urlParams.init && rtcStatus >= CREATE) {
                originalJanusPluginHandle.send(
                    {message:
                        {
                            "request" : "join",
                            "ptype": "publisher",
                            "room" : string_ids ? String(roomId) : roomId,
                            "display" : display
                        }
                    }
                )
            }
        }
    }, [display, originalJanusPluginHandle])

    // 本地流显示
    // useEffect(() => {
    //     if (localStreamElement && localStream) {
    //         let videoNode = localStreamElement.current;
    //         videoNode.srcObject = localStream;
    //     }
    // }, [localStreamElement, localStream])

    // 判断是否应该创建房间
    useEffect(() => {
        let url = location.search ? location.search.split("?")[1]: "";
        let urlParams = queryAllParams(url)
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
    }, [originalJanusPluginHandle])

    const screenAttach = _ => {
        janus.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: Janus.randomString(12),
        success: (pluginHandle) => {
            rtcStatus = ATTACH;
            JanusScreenPluginHandle = pluginHandle;
            pluginHandle.send(
                {message:
                    {
                        "request" : "join",
                        "ptype": "publisher",
                        "id": `${uuidv4()}-screen`,
                        "room" : string_ids ? String(roomId) : roomId,
                        "display" : `${localDisplay}-screen`
                    }
                }
            )
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
            console.log(msg, JanusScreenPluginHandle);
            let {
                videoroom: event,
                plugindata,
                publishers
            } = msg;
          if (event) {
            switch (event) {
                case "joined":
                    rtcStatus = JOIN;
                    screenId = msg.id;
                    publishOwnFeed(JanusScreenPluginHandle, true, true, uuidv4())
                    break;
                case "event":
                    if ('error' in msg) {
                        console.log('JANUS异常:', msg['error']);
                        ZkToast.error(msg['error'], 5);
                    }
                    break;
            }
          }
          if (jsep) {
            JanusScreenPluginHandle.handleRemoteJsep({
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
        onlocalstream: (stream) => {
        }
      });
    }
    /**
     * Janus 初始化的函数
     */
    useEffect(() => {
        if (!wss_port) {
            return
        }
        let url = location.search ? location.search.split("?")[1]: "";
        let urlParams = queryAllParams(url)
        console.log(urlParams, location);
        let server = `wss://${baseIp}:${wss_port}`
        Janus.init({
            debug: false,
            callback: () => {
                rtcStatus = INIT;
                janus = janus = new Janus({
                iceServers: iceServers && iceServers.length > 0 ? iceServers : null,
                server,
                success: () => {
                  janus.attach({
                    plugin: "janus.plugin.videoroom",
                    opaqueId: Janus.randomString(12),
                    success: (pluginHandle) => {
                        rtcStatus = ATTACH;
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
                            list,
                            id
                        } = msg;
                        if (unpublished || leaving) {
                            setRemoteStreamList(list => {
                                console.log(11111, list);
                                let _index = list.findIndex(item => item.id == (unpublished || leaving));
                                console.log(_index);
                                if (_index != -1) {
                                    list.splice(1, _index);
                                }
                                console.log(2222, list);
                                return [...list];
                            })
                        }
                        if (publishers) {
                            publishers.forEach(item => {
                                let { audio_codec, id, display, talking, video_codec} = item;
                                if (!(urlParams.share && id.indexOf("-screen") != -1)) {
                                    newRemoteFeed(id, roomId, display, true, video_codec);
                                }
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
                                rtcStatus = CREATE;
                                break;
                            case "joined":
                                console.log(msg);
                                rtcStatus = JOIN;
                                localId = msg.id;
                                publishOwnFeed(JanusPluginHandle, true, false, uuidv4())
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
                        setLocalStream( localstream => {
                            let _index = localstream.findIndex(item => item.stream.id == stream.id);
                            console.log(_index);
                            if (_index != -1) {
                                localstream[_index].stream = stream;
                            } else {
                                return localstream.concat([{
                                    id: localId,
                                    display: localDisplay,
                                    local: true,
                                    stream
                                }])
                            }
                            return localstream;
                        });
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
    }, [wss_port]);
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
    const setCodeValue = data => {
        let { text } = data;
        console.log(text)
        setcodeStr(text);
    }

    const setCommicationValue = data => {
        let oldlist = [...commicationList];
        oldlist.push(data)
        setcommicationList(oldlist);
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
        console.log("订阅", id, room_id, display, audio, video)
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
            try {
                let jsonData = JSON.parse(data);
                let { type, data: revicerData } = jsonData;
                switch(type) {
                    case "code":
                        let { text } = revicerData;
                        setcodeStr(text);
                        break;
                    case "msg":
                        setcommicationList(list => {
                            console.log("set set set ", list);
                            return list.concat([revicerData])
                        });
                        break;
                    case "screen":
                        console.log("datachannel screen.....")
                        let { text: viteText, display } = revicerData;
                        notification["info"]({
                            message: "远程提醒",
                            description: `${display}:${viteText}`,
                        });
                        setTimeout(() => {
                            screenAttach();
                        }, 1000);
                        // Modal.confirm({
                        //     title: `${display}:${viteText}`,
                        //     onOk: _ => {
                        //         console.log(originalJanusPluginHandle, JanusPluginHandle);
                        //         if (JanusPluginHandle) {
                        //             publishOwnFeed(JanusPluginHandle, true, true, uuidv4())
                        //         }
                        //     }
                        // })
                        
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.log(error);
            }
            // setcodeStr(data);
         },
         onremotestream: (stream) => {
            setRemoteStreamList(copyList => {
                let hasStream_index = copyList.findIndex(item => item.id == id);
                if (hasStream_index == -1) {
                    return copyList.concat({
                        id,
                        display,
                        stream
                    })
                }
                return copyList;
            });
        //    let videoTracks = stream.getVideoTracks();
         },
         oncleanup: function () {
           remoteHandle.simulcastStarted = false;
         },
         detach: (a, b, c) => {
           console.log('detachdetachdetachdetach', a, b, c);
         }
       });
     }
   };
   console.log(11111, localStream, remoteStreamList);
   const listStream = localStream ? [...localStream, ...remoteStreamList] : [...remoteStreamList];
   /**
    * @description 发送聊天信息
    * @param {Any} _ 
    */
   const sendMsg = _ => {
    if (originalJanusPluginHandle) {
        let msg = {
            type: "msg",
            data: {
                display: localDisplay,
                text: commicationText,
                date: new Date().toLocaleString()
            }
        };
        setcommicationList(list => {
            return list.concat([{
                display: "我",
                local: true,
                text: commicationText,
                date: new Date().toLocaleString()
            }])
        });
        originalJanusPluginHandle.data({text: JSON.stringify(msg), success: res=> {
            setcommicationText("");
        }, err: err => {
            console.log(err);
        }});
    }
   }
   const viteScreen = _ => {
    if (originalJanusPluginHandle) {
        let msg = {
            type: "screen",
            data: {
                display: localDisplay,
                text: "邀请您开启屏幕共享",
                date: new Date().toLocaleString()
            }
        };
        originalJanusPluginHandle.data({text: JSON.stringify(msg), success: res=> {
        }, err: err => {
            console.log(err);
        }});
    }
   }
   const loadCode = (mode) => {
    import(`codemirror/mode/${mode}/${mode}.js`).then((data) => {
    //   this.setState({
    //     code: data.default,
    //   });
    }).catch(() => {
    //   this.setState({ code: 'Please enter a sample code.' });
    });
  }
   const handleChangeMode = (mode) => {
    setcodeMirrorOptions(option => {
        return {...option, ...{mode}};
    })
    loadCode(mode)
   }

   const handleChangeTheme = theme => {
    setcodeMirrorOptions(option => {
        return {...option, ...{theme}};
    })
   }
    return(
        <div id="main">
            <div className="main_left">
                <div className="control_header">
                    {isMain ? <Button type="primary" icon={<ShareAltOutlined />} onClick={copyPageUrl}></Button>:null}
                    {isMain ? <Button type="primary" shape="round" onClick={viteScreen}>邀请开启屏幕</Button> : null}
                    <Select value={mode} style={{ width: 160 }} onChange={handleChangeMode}>
                        {
                            allModes.map((item, index) => {
                                let { mode, name } = item;
                                return <Option key={index} value={mode}>{name}</Option>
                            })
                        }
                    </Select>

                    <Select value={codeMirrorTheme} style={{ width: 160 }} onChange={handleChangeTheme}>
                        {
                            codeMirrorThemes.map((item, index) => {
                                return <Option key={index} value={item}>{item}</Option>
                            })
                        }
                    </Select>
                </div>
                <div className="editer_containrt">
                    <CodeMirror
                        className="mirror_container"
                        value={codeStr}
                        options={codeMirrorOptions}
                        onChange={(editor, data) => {
                            console.log(editor, data);
                            let value = editor.getValue();
                            let { origin } = data;
                            setcodeStr(value);
                            if (JanusPluginHandle && origin !== "setValue") {
                                let msg = {
                                    type: "code",
                                    data: {
                                        display: localDisplay,
                                        text: value,
                                        date: new Date().toLocaleString()
                                    }
                                };
                                JanusPluginHandle.data({text: JSON.stringify(msg), success: res=> {
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
                        {/* <video autoPlay controls muted ref={localStreamElement}></video> */}
                        {listStream.length ? 
                        listStream.map(item => {
                           return <RtcView info={item} key={item.id}></RtcView>
                        }): null}
                    </div>
                </div>
                <div className="right_bottom">
                    <div className="history_list">
                    {commicationList.length ?
                        commicationList.map((item, index) => {
                            return <Commication key={index} info={item}></Commication>
                        }) : null}
                    </div>
                    <div className="editer_a">
                        <Button type="primary" shape="round" disabled={!commicationText} onClick={sendMsg}>发送</Button>
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
            <Modal 
                visible={showModal}
                closable={false}
                keyboard={false}
                footer={[]}
                title="请输入昵称"
                type="info">
                    <Form
                        name="rtc_form"
                        initialValues={{ display }}
                        onFinish={onFinish}
                        >
                        <Form.Item
                            label="昵称"
                            name="display"
                            rules={[{ required: true, message: '请输入昵称' }]}
                        >
                            <Input></Input>
                        </Form.Item>
                        <Form.Item ayout = {{
                                    labelCol: {
                                        span: 16,
                                    },
                                    wrapperCol: {
                                        span: 8,
                                    },
                                    }}>
                            <Button type="primary" htmlType="submit">
                            确定
                            </Button>
                        </Form.Item>
                    </Form>
                    
            </Modal>
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