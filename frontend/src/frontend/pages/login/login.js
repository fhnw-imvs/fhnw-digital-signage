// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React from "react";
import {withRouter} from "react-router-dom";
import AuthHelpermethods from "../../components/AuthHelperMethods";
import styled from "styled-components";
import {Button, Container} from "react-bootstrap";

class Login extends React.Component {
  state = {
    username: "",
    password: ""
  };
  Auth = new AuthHelpermethods();

    _handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    handleFormSubmit = e => {
        e.preventDefault();

        /* Here is where all the login logic will go. Upon clicking the login button, we would like to utilize a login method that will send our entered credentials over to the server for verification. Once verified, it should store your token and send you to the protected route. */
        this.Auth.login(this.state.username, this.state.password)
            .then(res => {
                if (res === false) {
                    return alert("Sorry those credentials don't exist!");
                }
                this.props.history.replace("/");
            })
            .catch(err => {
                alert(err);
            });
    };

    componentDidMount() {
        if (this.Auth.loggedIn()) {
            this.props.history.replace("/");
        }
    }

    render() {
        return (
            <Container>
                <Wrapper>
                    <FormContent>
                        <div className="form-group">
                            <label>
                                <b>Username</b>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Username"
                                    name="username"
                                    onChange={this._handleChange}
                                    value={this.state.username}
                                />
                            </label>
                            <br/>
                            <label>
                                <b>Password</b>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Password"
                                    name="password"
                                    onChange={this._handleChange}
                                    value={this.state.password}
                                />
                            </label>
                            <br/>
                            <Button
                                className="btn btn-primary"
                                type="submit"
                                onClick={this.handleFormSubmit}
                            >
                                Login
                            </Button>
                        </div>
                    </FormContent>
                </Wrapper>
            </Container>
        );
    }
}

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 80vh;
`;

const FormContent = styled.div`
  -webkit-border-radius: 10px 10px 10px 10px;
  border-radius: 10px 10px 10px 10px;
  background: #fff;
  padding: 10px;
  width: 90%;
  max-width: 450px;
  position: relative;
  -webkit-box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.3);
  box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.3);
  text-align: center;
`;

export default withRouter(Login);
