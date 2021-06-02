/**
 * @Author: wangfpp
 * @Deprecated: 服务端代码
 * @Date: 2020-06-02 21:26:55
 */

 var express = require('express');
 var expressWs = require('express-ws');
 
 var app = express();
 let wsInstance = expressWs(app);
 let clients = wsInstance.getWss().clients
 app.ws('/ws', function (ws, req){
    ws.send('{data: 1, msg: "aa"}')
    ws.on('message', function (msg) {
        try {
            let parseMsg = JSON.parse(msg);
            parseMsg.date = new Date().toLocaleString();
            for (const ws_item of clients) {
                if (ws !== ws_item) {
                    ws_item.send(JSON.stringify(parseMsg));
                }
            }
        } catch (error) {
            
        }
    })
})
 
 app.listen(8089);
