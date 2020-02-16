// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React from 'react'
import {Table} from 'react-bootstrap'
import LogTableElement from "./logTableElement"

const LogTable = props =>
    <Table hover>
        <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Message</th>
            <th>Timestamp</th>
        </tr>
        </thead>
        <tbody>
        {props.errors.map(e => e.errors_array.reverse().map(entry => <LogTableElement
            key={entry.toString()}
            date={new Date(entry.split("-timestamp-")[1]).toDateString()}
            time={new Date(entry.split("-timestamp-")[1]).toTimeString().slice(0, 8)}
            deviceid={e.id}
            devicename={e.name}
            error={entry.split("-timestamp-")[0]}/>))}
        </tbody>
    </Table>;

export default LogTable