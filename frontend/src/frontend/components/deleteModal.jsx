// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React, {Component} from "react";
import {Button, Modal} from "react-bootstrap";

class DeleteModal extends Component {
    render() {
        return (
            <>
                <Modal show={this.props.show} onHide={this.props.onHide}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Item</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{this.props.body}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.props.onHide}>
                            Close
                        </Button>
                        <Button
                            className="btn-danger"
                            variant="primary"
                            onClick={this.props.onDeleteItem}
                        >
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

export default DeleteModal;
