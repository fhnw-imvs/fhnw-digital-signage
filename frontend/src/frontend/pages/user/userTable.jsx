// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React from 'react'
import _ from 'lodash'
import { Table } from 'react-bootstrap'
import UserTableElement from "./userTableElement"

const UserTable = ({ users, onUpdate, onRemove }) =>
    <Table hover>
        <thead>
        <tr>
            <th>id</th>
            <th>username</th>
            <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        {
            _.map(users, user =>
                <UserTableElement
                    user={ user }
                    onUpdate={ onUpdate }
                    onRemove={ onRemove } />
            )
        }
        </tbody>
    </Table>;

export default UserTable