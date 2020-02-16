// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React, {useEffect, useState} from "react";
import {withRouter} from "react-router-dom";
import AuthHelperMethods from "../../components/AuthHelperMethods";
import {deviceApi, statusApi} from "../../tools/global";
import Container from "react-bootstrap/Container";
import PageTitle from "../../components/PageTitle";
import Tile from "./tile"
import {Col, Row} from "react-bootstrap";

const Dashboard = props => {
    const Auth = new AuthHelperMethods();

    const [tiles, setTiles] = useState([{
        id: "loading...",
        errors_array: ["loading..."],
        responses: ["loading..."],
        snapshot_timestamp: "loading...",
        snapshot_base64: "",
        name: "loading..."
    }]);
    const fetchTiles = () => {
        props.statusHandler(true);
        return Auth.fetch(statusApi)
            .then(tiles => {
                return Auth.fetch(deviceApi)
                    .then(devices => {
                        tiles.map(t => {
                            let devFound = devices.device.find(d => d.id.toString() === t.id.toString());
                            t.name = devFound !== undefined ? devFound.name : "N/A"
                        });
                        setTiles(tiles);
                        props.statusHandler(false);
                    });
            })
            .catch(error => {
                props.statusHandler(false);
                console.error(error)
            });
    };
    useEffect(() => {
        let refresh;
        fetchTiles().then(refresh = setInterval(fetchTiles, 5000));
        return () => clearInterval(refresh);
    }, []);

    return (
        <Container fluid={true} style={{paddingTop: 20}}>
            <Row>
                <Col md="1"/>
                <Col md="10">
                    <PageTitle pageTitle={"Dashboard"}/>
                    <Container
                        fluid={true}>
                        <Row>
                            {tiles.map(tile => <Tile key={tile.id.toString()} tile={tile}/>)}
                        </Row>
                    </Container>
                </Col>
                <Col md="1"/>
            </Row>
        </Container>);
};

export default withRouter(Dashboard);
