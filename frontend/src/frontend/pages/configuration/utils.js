// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

export const normalizeConfiguration = (configuration) => {
    let normalizedConfiguration = {};
    normalizedConfiguration['id'] = configuration.id;
    normalizedConfiguration['name'] = configuration.name;
    normalizedConfiguration['description'] = configuration.description;
    normalizedConfiguration['cycletime'] = configuration.cycletime;
    normalizedConfiguration['reloadtime'] = configuration.reloadtime;
    normalizedConfiguration['urls'] = [];
    configuration.urls.forEach(url => {
        normalizedConfiguration.urls.push(url.url);
    });
    return normalizedConfiguration;
};
export const normalizeConfigurations = (configurations) => {
    let normalizedConfigurations = [];
    configurations.forEach(configuration => {
        normalizedConfigurations.push(normalizeConfiguration(configuration));
    });
    return normalizedConfigurations;
};