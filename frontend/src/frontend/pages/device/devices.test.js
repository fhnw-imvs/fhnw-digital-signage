// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React from 'react';
import Clients from './device';
import Adapter from 'enzyme-adapter-react-16';
import {MemoryRouter} from 'react-router-dom';
import {configure, mount} from 'enzyme';

configure({adapter: new Adapter()});

test('modal add shows up after clicking add', () => {
    // Render a checkbox with label in the document
    const clients = mount(<MemoryRouter initialEntries={['/']} initialIndex={0}><Clients/></MemoryRouter>);

    expect(clients.find("#modal-add-clients").first().prop("show")).toEqual(false);
    clients.find('button').findWhere(n => n.prop('id') === 'button-users-add').first().simulate('click');
    /*
    clients.find('Modal').findWhere(n => n.prop('id') === 'modal-add-clients')
        .find('Button').findWhere(n => n.prop('variant') === 'primary').simulate('click');
    */

    expect(clients.find("#modal-add-clients").first().prop("show")).toEqual(true);
});