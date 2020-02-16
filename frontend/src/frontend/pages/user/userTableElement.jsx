// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React from 'react'
import UpdateUserDialog from "./updateUserDialog";
import DeleteUserDialog from "./deleteUserDialog";

const UserTableElement = ({user, onUpdate, onRemove }) => (
    <tr key={user.id} >
        <td>{user.id}</td>
        <td>{user.username}</td>
        <td>
            <div className="btn-group" role="group">
                <UpdateUserDialog onUpdate={onUpdate} user={user} />
                <DeleteUserDialog onRemove={onRemove} user = {user}/>
            </div>
        </td>

    </tr>
);

export default UserTableElement