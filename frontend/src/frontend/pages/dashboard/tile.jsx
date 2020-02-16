// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React from "react";
import {Card} from "react-bootstrap";


const Tile = props => {
    const computeStatus = () => {
        const lastIndex = props.tile.responses[props.tile.responses.length - 1];
        const firstIndex = props.tile.responses[0];
        return (lastIndex - firstIndex) / (props.tile.responses.length * 1000) < 30
            && (Date.now() - lastIndex) < 30 * 1000;
    };
    return (
        <Card style={{width: '15rem'}}>
            <Card.Img variant="top"
                      src={props.tile.snapshot_base64 ? "data:image/png;base64, " + props.tile.snapshot_base64 : "loading.gif"}
                      alt={"device id " + props.tile.id}/>
            <Card.Body>
                <Card.Title>{props.tile.name}</Card.Title>
                <Card.Text>
                    Status: {computeStatus() ? <b style={{color: "green"}}>GOOD</b> : <b style={{color: "red"}}>BAD</b>}
                    <br/>
                        ID: {props.tile.id}
                    <br/>
                        IP: {props.tile.ip}
                    <br/>
                        <i>{new Date(props.tile.snapshot_timestamp).toDateString()}</i>
                        <i>, {new Date(props.tile.snapshot_timestamp).toTimeString().slice(0, 8)}</i>
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default Tile;