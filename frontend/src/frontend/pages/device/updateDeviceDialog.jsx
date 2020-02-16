// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React, {useState} from "react";
import {Button, Form, FormControl, Modal} from "react-bootstrap";

const UpdateDeviceDialog = ({device: oldDevice, configurations, onUpdate,}) => {
    const [device, setDevice] = useState(oldDevice);
    const [showModal, setShowModal] = useState(false);

    const open = () => {
        setShowModal(true);
        setDevice(device);
    };

    const close = () => {
        setShowModal(false);
    };

    const update = () => {
        onUpdate(device);
        close();
    };

    const handleChange = event => {
        setDevice({...device, [event.target.name]: event.target.value})
    };

    return (
        <>
            <button
                className="btn btn-outline-warning m-1"
                onClick={open}
            >
                Edit
            </button>
            <Modal show={showModal} onHide={close} size={"lg"}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Device</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label>Name</Form.Label>
                            <FormControl
                                type="text"
                                name="name"
                                value={device.name}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formDescription">
                            <Form.Label>Description</Form.Label>
                            <FormControl
                                type="text"
                                name="description"
                                value={device.description}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="configurationId">
                            <Form.Label>Configuration Id</Form.Label>
                            <Form.Control
                                as="select"
                                controlId="configuration"
                                type="number"
                                name="configurationId"
                                value={device.configurationId}
                                onChange={handleChange}
                            >
                                <option key={0} value={0}/>
                                {configurations.map((configuration) => <option key={configuration.id}
                                                                               value={configuration.id}>{configuration.name}</option>)}
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={update}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default UpdateDeviceDialog;
