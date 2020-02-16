// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React from 'react'
import _ from 'lodash'
import {Table} from 'react-bootstrap'
import DeviceTableElement from "./deviceTableElement"

const DeviceTable = ({devices, configurations, onUpdate, onRemove, onApproveDevice}) => {
    console.log("rendered Device table with devices: ", devices.length, " and configs: ", configurations.length);
    return (
        <Table hover>
            <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>MAC</th>
                <th>Configuration</th>
                <th>Description</th>
                <th>Approved</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {
                _.map(devices, device =>
                    <DeviceTableElement
                        key={device.id}
                        device={device}
                        onUpdate={onUpdate}
                        onRemove={onRemove}
                        configurations={configurations}
                        onApproveDevice={onApproveDevice}
                    />
                )
            }
            </tbody>
        </Table>
    )
};

export default DeviceTable