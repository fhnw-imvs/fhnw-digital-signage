// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React, {Component} from "react";
import AuthHelperMethods from "./AuthHelperMethods";

/* A higher order component is frequently written as a function that returns a class. */
export default function withAuth(AuthComponent) {
    const Auth = new AuthHelperMethods();

    return class AuthWrapped extends Component {
        state = {
            confirm: null,
            loaded: false
        };

        componentDidMount() {
            if (!Auth.loggedIn()) {
                this.props.history.push("/login");
            } else {
                try {
                    const confirm = Auth.getConfirm();
                    this.setState({
                        confirm: confirm,
                        loaded: true
                    });
                } catch (err) {
                    console.log(err);
                    Auth.logout();
                    this.props.history.replace("/login");
                }
            }
        }

        render() {
            if (this.state.loaded === true) {
                if (this.state.confirm) {
                    return (
                        <AuthComponent
                            history={this.props.history}
                            confirm={this.state.confirm}
                        />
                    );
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
    };
}
