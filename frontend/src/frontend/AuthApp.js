// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React, {useState} from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import withAuth from "./components/withAuth";
import Users from "./pages/user/user";
import Devices from "./pages/device/device";
import Configuration from "./pages/configuration/configuration";
import Dashboard from "./pages/dashboard/dashboard";
import Logs from "./pages/logs/logs";
import MainNav from "./components/mainNav";


const AuthApp = props => {
    const [statusNow, setStatus] = useState(false);
    const statusHandler = val => setStatus(val);
    return (
        <>
            <MainNav statusNow={statusNow} statusHandler={statusHandler}/>
            <Switch>
                <Route exact path="/" render={() => <Redirect to="/dashboard"/>}/>
                <Route path="/users" component={Users}/>
                <Route path="/devices" component={Devices}/>
                <Route path="/configurations" component={Configuration}/>
                <Route path="/dashboard" render={() => <Dashboard statusHandler={statusHandler}/>}/>
                <Route path="/logs" component={Logs}/>
            </Switch>
        </>
    );
};

export default withAuth(AuthApp);
