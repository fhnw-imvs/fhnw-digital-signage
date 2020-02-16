// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React from 'react'
import _ from 'lodash'
import {Table} from 'react-bootstrap'
import ConfigurationTableElement from "./configurationTableElement"

const ConfigurationTable = ({configurations, onUpdate, onRemove}) =>
    <Table hover>
        <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Reload Time</th>
            <th>Cycle Time</th>
            <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        {
            _.map(configurations, configuration =>
                <ConfigurationTableElement
                    configuration={configuration}
                    onUpdate={onUpdate}
                    onRemove={onRemove}/>
            )
        }
        </tbody>
    </Table>;

export default ConfigurationTable