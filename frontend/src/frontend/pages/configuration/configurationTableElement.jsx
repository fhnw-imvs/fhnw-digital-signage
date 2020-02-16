// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React from 'react'
import UpdateConfigurationDialog from "./updateConfigurationDialog";
import DeleteConfigurationDialog from "./deleteConfigurationDialog";

const ConfigurationTableElement = ({configuration, onUpdate, onRemove}) => (
    <tr key={configuration.id}>
        <td>{configuration.id}</td>
        <td>{configuration.name}</td>
        <td>{configuration.description}</td>
        <td>{configuration.reloadtime}</td>
        <td>{configuration.cycletime}</td>
        <td>
            <div className="btn-group" role="group">
                <UpdateConfigurationDialog onUpdate={onUpdate} configuration={configuration}/>
                <DeleteConfigurationDialog onDelete={onRemove} configuration={configuration}/>
            </div>
        </td>

    </tr>
);

export default ConfigurationTableElement