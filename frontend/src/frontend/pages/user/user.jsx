// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React, {useState, useEffect} from "react";
import {withRouter} from "react-router-dom";
import Container from "react-bootstrap/Container";
import "../../thirdparty/react-bootstrap-table2.min.css";
import {userApi} from "../../tools/global";
import AuthHelperMethods from "../../components/AuthHelperMethods";
import CreateUserDialog from "./createUserDialog";
import PageTitle from "../../components/PageTitle";
import UserTable from "./userTable";
import _ from "lodash";
import {Col, Row} from "react-bootstrap";

const User = props => {
    const [users, setUsers] = useState([{}]);
    const Auth = new AuthHelperMethods();

    useEffect(() => {
        const Auth = new AuthHelperMethods();
        const fetchUsers = () => {
            Auth.fetch(userApi)
                .then(data => {
                    let users = _.forEach(data, d => d.password = "");
                    setUsers(users);
                })
                .catch(error => {
                    console.error(error);
                    alert(error.message);
                });
        };
        fetchUsers();
    }, []);


    const remove = user => {
        Auth.fetch(userApi + user.id, {
            method: "DELETE"
        })
            .then(data => {
                setUsers(_.reject(users, {id: user.id}));
            })
            .catch(error => {
                console.error(error);
                alert(error);
            });
    };

    const update = updatedUser => {
        Auth.fetch(userApi + updatedUser.id, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUser)
        })
            .then(data => {
                setUsers(_.map(users, u => u.id === updatedUser.id ? updatedUser : u))
            })
            .catch(error => {
                console.error(error);
                alert(error.message);
            });
    };

    const create = user => {
        let newUsers = [...users];

        Auth.fetch(userApi, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
            .then(data => {
                newUsers.push(data.user);
                setUsers(newUsers);
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
                        <PageTitle pageTitle={"Users"}/>
                        <CreateUserDialog onCreate={create} />
                        <UserTable users={users} onUpdate={update} onRemove={remove}/>
                    </Container>
                </Col>
            </Row>
        </Container>
    );
};

export default withRouter(User);
