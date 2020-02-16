// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

let backend;
let port;

if (process.env.NODE_ENV === "production") {
    backend = "https://yourbackend";
    port = 80;
} else {
    backend = "http://localhost";
    port = 1337;
}

export const backendAPI = backend + ":" + port + "/api/";
export const authAPI = backendAPI + "auth/";
export const loginAPI = authAPI + "login/";
export const deviceApi = backendAPI + "device/";
export const configurationAPI = backendAPI + "configuration/";
export const statusApi = backendAPI + "ext/status/";
export const userApi = backendAPI + "user/";
