/*
 * @Author: fangxb
 * @Descripttion: 
 * @Date: 2020-02-09 10:20:42
 * @LastEditTime : 2020-02-10 15:15:26
 */
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import StorePersistor from '../store/index.js';
import AppRouter from './routes/index';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN.js'
import moment from 'moment';
import 'moment/locale/zh-cn';
const { store, persistor } = StorePersistor();

moment.locale('zh-cn');

class StoreRouter extends Component {
    UNSAFE_componentWillMount() {
        this.errorLog();//监听组件外异常
    }
    errorLog() {
        window.onerror = (message, file, line, column, errorObject) => {
            column = column || (window.event && window.event.errorCharacter);
            const stack = errorObject ? errorObject.stack : null;
            const data = {
                message: message,
                file: file,
                line: line,
                column: column,
                errorStack: stack,
            };
            console.log(data);
            return false;
        }
    }
    render() {
        return (
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <ConfigProvider locale={zhCN}>
                        <AppRouter>
                        </AppRouter>
                    </ConfigProvider>
                </PersistGate>
            </Provider>
        )
    }
}

export default StoreRouter;