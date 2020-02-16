// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React, {useState} from "react";
import {Button, Form, FormControl, Modal} from "react-bootstrap";

const UpdateConfigurationDialog = props => {
    const [configuration, setConfiguration] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [urls, setUrls] = useState("");


    const open = () => {
        setShowModal(true);
        setConfiguration(props.configuration);
        setUrls(props.configuration.urls.join('\n'))
    };

    const close = () => {
        setShowModal(false);
        setUrls("");
    };

    const update = () => {
        configuration.urls = urls.split("\n");
        setConfiguration(configuration);
        props.onUpdate(configuration);
        setShowModal(false);
    };

    const handleChange = event => {
        if (event.target.name === "urls") {
            setUrls(event.target.value);
        } else {
            const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
            setConfiguration({...configuration, [event.target.name]: value})
        }
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
                    <Modal.Title>Edit Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label>Name</Form.Label>
                            <FormControl
                                type="text"
                                name="name"
                                value={configuration.name}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formDescription">
                            <Form.Label>Description</Form.Label>
                            <FormControl
                                type="text"
                                name="description"
                                value={configuration.description}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formCycleTime">
                            <Form.Label>Cycle Time</Form.Label>
                            <FormControl
                                type="number"
                                name="cycletime"
                                value={configuration.cycletime}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formRealoadTime">
                            <Form.Label>Reload Time</Form.Label>
                            <FormControl
                                type="number"
                                name="reloadtime"
                                value={configuration.reloadtime}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formUrls">
                            <Form.Label>Urls (One per Line)</Form.Label>
                            <FormControl
                                type="text"
                                as="textarea"
                                name="urls"
                                value={urls}
                                onChange={handleChange}
                            />
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

export default UpdateConfigurationDialog;
