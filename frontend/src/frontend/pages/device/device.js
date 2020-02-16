// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React, {useEffect, useState} from "react";
import {withRouter} from "react-router-dom";
import Container from "react-bootstrap/Container";
import "../../thirdparty/react-bootstrap-table2.min.css";
import {configurationAPI, deviceApi} from "../../tools/global";
import AuthHelperMethods from "../../components/AuthHelperMethods";
import PageTitle from "../../components/PageTitle";
import DeviceTable from "./deviceTable";
import {normalizeConfigurations} from "../configuration/utils";
import {Col, Row} from "react-bootstrap";

const Device = props => {
    const Auth = new AuthHelperMethods();

    const [devices, setDevices] = useState([{}])
    const [configurations, setConfigurations] = useState([{}]);

    useEffect(() => {
        const Auth = new AuthHelperMethods();

        const fetchConfigurations = () => {
            Auth.fetch(configurationAPI)
                .then(data => {
                    setConfigurations(normalizeConfigurations(data.configuration));
                })
                .catch(error => {
                    console.error(error);
                    alert(error.message)
                });
        };
        fetchConfigurations();
        console.log("fetched Configurations");
    }, []);

    useEffect(() => {
        const Auth = new AuthHelperMethods();
        const fetchDevices = () => {
            Auth.fetch(deviceApi)
                .then(data => {
                    setDevices(data.device);
                })
                .catch(error => {
                    console.error(error);
                    alert(error.message)
                });
        };
        fetchDevices();
        console.log("fetched Devices");
    }, []);

    const editItem = updatedDevice => {
        const device = devices.find(
            c => c.id === updatedDevice.id
        );
        console.log("updating device:");
        console.log(device);
        Auth.fetch(deviceApi + updatedDevice.id, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedDevice)
        })
            .then(data => {
                const updatedDevices = [...devices];
                updatedDevices[updatedDevices.indexOf(device)] = data.device;
                setDevices(updatedDevices);
            })
            .catch(error => {
                console.error(error.message);
                alert(error.message);
            });
    };

    const deleteItem = device => {
        const filteredDevices = devices.filter(
            d => d.id !== device.id
        );

        Auth.fetch(deviceApi + device.id, {
            method: "DELETE"
        })
            .then(data => {
                if (data.device === device.id) {
                    setDevices(filteredDevices);
                } else {
                    console.error("No delete confirmation from backend: ", data);
                    alert("Device could not be deleted. Please try again.");
                }
            })
            .catch(error => {
                console.error(error);
                alert(error.message)
            });
    };

    const approveDevice = device => {
        let updatedDevice = {...device};
        updatedDevice.approved = true;
        editItem(updatedDevice);
    };

    return (
        <Container fluid={true} style={{paddingTop: 20}}>
            <Row>
                <Col md="1"/>
                <Col md="10">
                    <Container fluid={true}>
                        <PageTitle pageTitle={"Devices"}/>
                        <DeviceTable devices={devices}
                                     configurations={configurations}
                                     onUpdate={editItem}
                                     onRemove={deleteItem}
                                     onApproveDevice={approveDevice}/>

                    </Container>
                </Col>
            </Row>
        </Container>
    );
};

export default withRouter(Device);
