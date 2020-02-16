// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React, {useEffect, useState} from "react";
import {withRouter} from "react-router-dom";
import Container from "react-bootstrap/Container";
import "../../thirdparty/react-bootstrap-table2.min.css";
import {configurationAPI} from "../../tools/global";
import AuthHelperMethods from "../../components/AuthHelperMethods";
import CreateConfigurationDialog from "./createConfigurationDialog";
import PageTitle from "../../components/PageTitle";
import {normalizeConfiguration, normalizeConfigurations} from "./utils";
import ConfigurationTable from "./configurationTable";
import {Col, Row} from "react-bootstrap";

const Configuration = props => {
    const [configurations, setConfigurations] = useState([{}]);
    const Auth = new AuthHelperMethods();

    useEffect(() => {
        const Auth = new AuthHelperMethods();
        const fetchConfigurations = () => {
            Auth.fetch(configurationAPI)
                .then(data => {
                    setConfigurations(normalizeConfigurations(data.configuration));
                })
                .catch(error => {
                    console.error(error);
                    alert(error.message);
                });
        };
        fetchConfigurations();
    }, []);


    const deleteItem = configuration => {
        const filteredConfigurations = configurations.filter(
            c => c.id !== configuration.id
        );

        Auth.fetch(configurationAPI + configuration.id, {
            method: "DELETE"
        })
            .then(data => {
                if (data.configuration === configuration.id) {
                    setConfigurations(filteredConfigurations);
                } else {
                    alert("Unexpected delete confirmation from backend. Please reload site and check your data.");
                    console.error("No delete confirmation from backend: ", data);
                }
            })
            .catch(error => {
                console.error(error);
                alert(error.message);
            });
    };

    const editItem = updatedConfiguration => {
        const configuration = configurations.find(
            c => c.id === updatedConfiguration.id
        );
        const copiedConfiguration = [...configurations];
        copiedConfiguration[copiedConfiguration.indexOf(configuration)] = updatedConfiguration;

        Auth.fetch(configurationAPI + updatedConfiguration.id, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedConfiguration)
        })
            .then(data => {
                setConfigurations(copiedConfiguration);
            })
            .catch(error => {
                console.error(error);
                alert(error.message);
            });
    };

    const addItem = configuration => {
        console.log("add: ", configuration);
        let newConfigurations = [...configurations];

        Auth.fetch(configurationAPI, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(configuration)
        })
            .then(data => {
                newConfigurations.push(normalizeConfiguration(data.configuration));
                setConfigurations(newConfigurations);
            })
            .catch(error => {
                console.error(error);
                alert(error.message);
            });
    };
    return (
        <Container fluid={true} style={{paddingTop: 20}}>
            <Row>
                <Col md="1"/>
                <Col md="10">
                    <Container fluid={true}>
                        <PageTitle pageTitle={"Configurations"}/>
                        <CreateConfigurationDialog onCreate={addItem} />
                        <ConfigurationTable configurations={configurations} onUpdate={editItem} onRemove={deleteItem}/>
                    </Container>
                </Col>
            </Row>
        </Container>
    );
};

export default withRouter(Configuration);
