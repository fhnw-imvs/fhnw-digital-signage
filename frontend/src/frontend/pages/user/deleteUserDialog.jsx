// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React, {useState} from "react";
import {Button, Modal} from "react-bootstrap";

const DeleteUserDialog = props => {
    const [user, setUser] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const open = () => {
        setShowModal(true);
        setUser(props.user);
    };

    const close = () => {
        setShowModal(false);
    };

    const remove = () => {
        props.onRemove(user);
        setShowModal(false);
    };

    return (
        <>
            <button
                size="sm"
                className="btn btn-outline-danger m-1"
                onClick={open}
            >
                Delete
            </button>
            <Modal show={showModal} onHide={close}>
                <Modal.Header closeButton>
                    <Modal.Title>Remove User</Modal.Title>
                </Modal.Header>
                <Modal.Body>Delete User "{user.username}" ?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close}>
                        Close
                    </Button>
                    <Button
                        className="btn-danger"
                        variant="primary"
                        onClick={remove}
                    >
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default DeleteUserDialog;
