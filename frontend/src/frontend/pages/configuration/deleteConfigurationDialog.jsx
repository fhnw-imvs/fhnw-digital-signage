// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React, {useState} from "react";
import {Button, Modal} from "react-bootstrap";

const DeleteConfigurationDialog = props => {
    const [configuration, setConfiguration] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const open = () => {
        setShowModal(true);
        setConfiguration(props.configuration);
    };

    const close = () => {
        setShowModal(false);
    };

    const deleteConfiguration = () => {
        props.onDelete(configuration);
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
                    <Modal.Title>Delete Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>Delete configuration "{configuration.name}" ?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close}>
                        Close
                    </Button>
                    <Button
                        className="btn-danger"
                        variant="primary"
                        onClick={deleteConfiguration}
                    >
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default DeleteConfigurationDialog;
