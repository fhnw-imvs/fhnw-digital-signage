// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React from 'react'
import UpdateDeviceDialog from "./updateDeviceDialog";
import DeleteDeviceDialog from "./deleteDeviceDialog";
import _ from 'lodash';

const DeviceTableElement = ({device, configurations, onUpdate, onRemove, onApproveDevice}) => {
    const getConfigurationName = (id) => {
        if (id <= 0) return "None";
        let index = _.findIndex(configurations, function (c) {
            return c.id === id;
        });
        if (index === -1) return "None";
        return configurations[index].name;
    };
    return (
        <tr>
            <td>{device.id}</td>
            <td>{device.name}</td>
            <td>{device.mac}</td>
            <td>{getConfigurationName(device.configurationId)}</td>
            <td>{device.description}</td>
            <td>{'' + device.approved}</td>
            <td>
                <div className="btn-group" role="group">
                    {!device.approved &&
                    <button
                        key={device.id}
                        className="btn btn-outline-primary m-1"
                        onClick={() => onApproveDevice(device)}
                    >
                        Approve
                    </button>}
                    {device.approved &&
                        <div>
                            <UpdateDeviceDialog onUpdate={onUpdate} device={device} configurations={configurations}/>
                            < DeleteDeviceDialog onDelete={onRemove} device={device}/>
                        </div>
                    }
                </div>
            </td>

        </tr>
    );
};

export default DeviceTableElement