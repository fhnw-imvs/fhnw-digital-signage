// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React from 'react'

const LogTableElement = ({error, deviceid, date, time, devicename}) => (
    <tr key={error.toString()}>
        <td>{deviceid}</td>
        <td>{devicename}</td>
        <td>{error}</td>
        <td width={250}>{date + ", " + time}</td>
    </tr>
);

export default LogTableElement