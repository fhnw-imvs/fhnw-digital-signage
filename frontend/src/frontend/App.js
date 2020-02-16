// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React from "react";
import Login from "./pages/login/login";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {Route, Switch, withRouter} from "react-router-dom";
import AuthApp from "./AuthApp";

//App
function App() {
    return (
        <Switch>
            <Route path="/login" component={Login}/>
            <Route path="/" component={AuthApp}/>
        </Switch>
    );
}

export default withRouter(App);
