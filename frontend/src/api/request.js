/**
 * @Author: wangfpp
 * @Date: 2021-06-17 17:39:27
 * @Description: axios封装
 */
import axios from 'axios';
// import {
//     message
// } from 'antd'
const httpd = axios.create({});

//请求拦截处理
httpd.interceptors.request.use( config => {
    // 在发送请求之前做些什么
    return config;
},  error =>{
    // 对请求错误做些什么
    return Promise.reject(error);
});

//返回拦截处理
httpd.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
}, function (error) {
    // 对响应错误做点什么
    if (error.response && error.response.status !== 404) {
        return Promise.reject(error.response);
    } else {
        return Promise.reject(error);
    }
    

});
httpd.all = axios.all;
httpd.spread = axios.spread;

export default httpd;