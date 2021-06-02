/*
 * @Author: wangfpp
 * @Date: 2021-06-02 21:16:54
 * @LastEditTime: 2021-06-02 21:42:05
 * @Description: 封装WebSocket
 */

/**
 * WebSocket的封装
 * @param { String } url 通信的url 'ws://172.16.1.110:6081'
 * @param { Any } protocols 通信的协议　'face-coding'
 * @param { Number } heartJump 心跳间隔
 * @param { Any } data 需要发送的数据
 * @param { Funtion } callback　处理返回数据
 */
 class Zkws {
    constructor(url, protocols="face-coding", recoonect, heartJump, data, callback) {
        if (!url) {
            throw Error('未提供ws url')
        }
        this.url = url;
        this.protocols = protocols;
        this.recoonect = recoonect;
        this.data = data;
        this.callback = callback;
        this.heartJump = heartJump * 1000 || 25 * 1000; // 默认心跳25秒
        this.heartTag = null;
        this.pendingData = []; // 连接未完成是过来的数据
        this.main();
    }
    static tagtime = 20000;
    close() {
        if (this.ws) {
            this.ws.close()
        }
    }
    send(data) {
        // console.log('ws send data..... methods', data)
        let dataType = typeof data;
        let true_data = null;
        if (dataType === 'object') {
            true_data = JSON.stringify(data);
        } else if (dataType === 'string') {
            true_data = data;
        }
        if (data && this.ws) {
            if (this.ws.readyState === 1) {
                this.ws.send(true_data);
            } else if (this.ws.readyState === 0) {
                this.pendingData.push(true_data);
            }
        }
    }
    main() {
            let ws = null;
            if (this.protocols) {
                ws = new WebSocket(this.url, this.protocols)
            } else {
                ws = new WebSocket(this.url);
            }
            this.ws = ws;
            let data = this.data;
            ws.onopen = _ => {
                this.callback({code: 0, data: null});
                if (data) {
                    let dataType = typeof data;
                    if (dataType === 'object') {
                        let strData = JSON.stringify(data);
                        ws.send(strData);
                    } else if (dataType === 'string') {
                        ws.send(data);
                    }
                }
                if (this.pendingData.length) {
                    this.pendingData.forEach(ws_data => {
                        this.send(ws_data);
                    });
                    this.pendingData = [];
                }
                // this.heartTag = setInterval(() => {
                //     ws.send('ping');
                // }, Zkws.tagtime)
            }

            ws.onmessage = evt => {
                let { data } = evt;
                if (data === "pong" || data === "receive the connection") {
                    return;
                }

                let handledata = this.handleData(data);
                this.callback({ code: 0, data: handledata });
            }

            ws.onerror = err => {
                this.clearInterval();
                this.callback({ code: 1, data: 'websocket异常' + JSON.stringify(err) });
            }

            ws.onclose = _ => {
                this.clearInterval();
            }
            return ws;
        }
        // 链接失败和关闭链接时清除定时器
    clearInterval() {
            if (this.heartTag) {
                window.clearInterval(this.heartTag);
            }
        }
        /**
         * @description 处理WS传递过来的数据
         * @param {Any} data 
         */
    handleData(data) {
        if (data === 'pong') {
            return data;
        } else {
            // TODO....
            return data;
        }
    }
}


// let myws = new Zkws()
export default Zkws;
