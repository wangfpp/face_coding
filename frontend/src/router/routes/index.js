import RouteList from './routes';
import { Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import React, { Component, Suspense } from 'react';
import { createHashHistory } from 'history';
import { Spin } from "antd";
const history = createHashHistory();

class AppRouter extends Component {
    render() {
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
}
export default connect()(AppRouter);