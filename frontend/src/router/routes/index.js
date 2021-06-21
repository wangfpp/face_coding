import RouteList from './routes';
import { Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import React, { Component, Suspense, useState, useEffect } from 'react';
import { createHashHistory } from 'history';
import { Spin } from "antd";

import { JanusInfoServer } from "../../api/index.js";
import { SAVE_TOKEN } from "../../store/actions/action_type_initstate.js";
import { bindActionCreators } from "redux";
import { asyncSaveJanusInfo } from "../../store/actions/async_action";

const history = createHashHistory();

const AppRouter = props => {

    let { saveJanusInfo } = props;
    let [token, setToken] = useState(null);

    useEffect(async () => {
        let {data} = await JanusInfoServer.getToken();
        setToken(data);
    }, []);

    useEffect(async () => {
        if (token) {
            saveJanusInfo(token)
        }
    }, [token])

    return(
        <Router history={history}> 
        <Switch>
            {
                RouteList.map((route, index) => {
                    return(
                        <Route
                            key={index}
                            exact={route.exact}
                            path={route.path}
                            render = {props => {
                                document.title = route.title || '';
                                return <Suspense fallback={<Spin></Spin>}>
                                    <route.component {...props} routes={route.routes}/>
                                </Suspense>
                            }}>
                        </Route>
                    )
                })
            }
            </Switch>
        </Router>
    )
}

const mapDispatchToProps = dispatch => {
    return {
        saveToken: payload => {
            dispatch({type: SAVE_TOKEN, payload});
        },
        saveJanusInfo: payload => {
            bindActionCreators(asyncSaveJanusInfo, dispatch)(payload)
        }
    }
}

export default connect(null, mapDispatchToProps)(AppRouter);