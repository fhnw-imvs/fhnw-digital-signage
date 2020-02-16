// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React, {useState} from "react";
import {Button, Modal} from "react-bootstrap";
import UserForm from "./userForm"


const UpdateUserDialog = props => {
    const [user, setUser] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [passwordConfirmed, setPasswordConfirmed] = useState(false);


    const open = () => {
        setShowModal(true);
        setUser(props.user);
        setPasswordConfirmed(false);
    };

    const close = () => {
        setShowModal(false);
    };

    const update = () => {
        setUser(user);
        props.onUpdate(user);
        setShowModal(false);
    };

    const handleChange = event => {
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        setUser({...user, [event.target.name]: value})
    };

    const checkPasswordConfirmation = event => {
        const value = event.target.value;
        if(value !== "" && value === user.password){
            setPasswordConfirmed(true);
        } else{
            setPasswordConfirmed(false);
        }
        setUser({...user, [event.target.name]: value})
    };

    return (
        <>
            <button
                size="sm"
                className="btn btn-outline-warning m-1"
                onClick={open}
            >
                Edit
            </button>
            <Modal show={showModal} onHide={close} size={"lg"}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <UserForm user={user} onChange={handleChange} onPasswordConfirmationChange={checkPasswordConfirmation}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={update} disabled={!passwordConfirmed}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default UpdateUserDialog;
