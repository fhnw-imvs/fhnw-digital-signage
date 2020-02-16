// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React, {Component} from "react";
import {Button, Modal} from "react-bootstrap";

class AddModal extends Component {
    render() {
        return (
            <>
                <Modal show={this.props.show} onHide={this.props.onHide}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add Item</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Enter the item here</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.props.onHide}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={this.props.onAddItem}>
                            Add
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

export default AddModal;
