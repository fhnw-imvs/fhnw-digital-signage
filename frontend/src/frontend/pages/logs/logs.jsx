// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React, {useEffect, useState} from "react";
import {withRouter} from "react-router-dom";
import Container from "react-bootstrap/Container";
import "../../thirdparty/react-bootstrap-table2.min.css";
import {deviceApi, statusApi} from "../../tools/global";
import AuthHelperMethods from "../../components/AuthHelperMethods";
import PageTitle from "../../components/PageTitle";
import LogTable from "./logTable";
import {Col, Row} from "react-bootstrap";

const Logs = props => {
    const [errors, setErrors] = useState([{
        id: "loading...",
        errors_array: ["loading..."],
        responses: ["loading..."],
        snapshot_timestamp: "loading...",
        snapshot_base64: ""
    }]);

    useEffect(() => {
        const Auth = new AuthHelperMethods();
        const fetchErrors = () => {
            return Auth.fetch(statusApi)
                .then(errors => {
                    return Auth.fetch(deviceApi)
                        .then(devices => {
                            errors.map(e => {
                                let devFound = devices.device.find(d => d.id.toString() === e.id.toString());
                                e.name = devFound !== undefined ? devFound.name : "N/A"
                            });
                            setErrors(errors)
                        });
                })
                .catch(error => console.error(error));
        };
        fetchErrors();
    }, []);

    return (
        <Container fluid={true} style={{paddingTop: 20}}>
            <Row>
                <Col md="1"/>
                <Col md="10">
                    <Container fluid={true}>
                        <PageTitle pageTitle={"Logs"}/>
                        <LogTable errors={errors}/>
                    </Container>
                </Col>
            </Row>
        </Container>
    );
};

export default withRouter(Logs);
