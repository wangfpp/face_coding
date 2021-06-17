import { username, password } from "../utils/config.js";
import request from "./request.js";

const JanusInfoServer = {
    getToken: _ => {
        let params = {
            username,
            password
        }
        return request.post("/configserver/gettoken", params);
    },
    getInfo: token => {
        return request.get("/configserver/getjanusinfo", {headers: {
            "Authorization": `Bearer ${token}`
        }})
    }
}

export {
    JanusInfoServer
}