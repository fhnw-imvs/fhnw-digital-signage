// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import {Form, FormControl} from "react-bootstrap";
import React from "react";

const UserForm = props => {
    return (
        <Form>
            <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <FormControl
                    type="text"
                    name="username"
                    value={props.user.username}
                    onChange={props.onChange}
                />
            </Form.Group>
            <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <FormControl
                    type="password"
                    name="password"
                    value={props.user.password}
                    onChange={props.onChange}
                />
            </Form.Group>
            <Form.Group controlId="formPasswordConfirmation">
                <Form.Label>Password confirmation</Form.Label>
                <FormControl
                    type="password"
                    name="passwordConfirmation"
                    onChange={props.onPasswordConfirmationChange}
                />
            </Form.Group>
        </Form>
    );
};

export default UserForm;