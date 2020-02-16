// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React from "react";
import {Link, withRouter} from "react-router-dom";
import {Nav, Navbar, Row, Spinner} from "react-bootstrap";
import AuthHelperMethods from "./AuthHelperMethods";

const MainNav = props => {
    const Auth = new AuthHelperMethods();

    const _handleLogout = () => {
        Auth.logout();
        props.history.replace("/login");
    };

    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand href="/dashboard">MgmtApp</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link as={Link} to="/dashboard">
                        Dashboard
                    </Nav.Link>
                    <Nav.Link as={Link} to="/devices">
                        Devices
                    </Nav.Link>
                    <Nav.Link as={Link} to="/configurations">
                        Configurations
                    </Nav.Link>
                    <Nav.Link as={Link} to="/users">
                        Users
                    </Nav.Link>
                    <Nav.Link as={Link} to="/logs">
                        Logs
                    </Nav.Link>
                </Nav>
                <Nav className="mr-sm-2">
                    {props.statusNow &&
                    <Row style={{marginRight: 10}}>
                        <b style={{marginRight: 10}}>Loading</b>
                        <Spinner animation="border" role="status">
                            <span className="sr-only">Loading...</span>
                        </Spinner>
                    </Row>}
                </Nav>
                <Nav className="mr-sm-2">
                    <Nav.Link onClick={_handleLogout}>Logout</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default withRouter(MainNav);
