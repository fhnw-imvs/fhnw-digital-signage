// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import decode from "jwt-decode";
import {backendAPI, loginAPI} from "../tools/global";
import {getResponseErrorMessage} from "../tools/utils";

export default class AuthHelperMethods {
    // Initializing important variables
    constructor(domain) {
        //THIS LINE IS ONLY USED WHEN YOU'RE IN PRODUCTION MODE!
        this.domain = domain || backendAPI; // API server domain
    }

    login = (username, password) => {
        // Get a token from api server using the fetch api
        var data = new URLSearchParams();
        data.append("username", username);
        data.append("password", password);
        return this.fetch(loginAPI, {
            method: "POST",
            body: data
        }).then(res => {
            this.setToken(res.jwt); // Setting the token in localStorage
            return Promise.resolve(res);
        });
    };

    loggedIn = () => {
        // Checks if there is a saved token and it's still valid
        const token = this.getToken();
        return !!token && !this.isTokenExpired(token);
    };

    isTokenExpired = token => {
        try {
            return decode(token).exp < Date.now() / 1000;
        } catch (err) {
            console.log("expired check failed!");
            return false;
        }
    };

    setToken = idToken => {
        localStorage.setItem("id_token", idToken);
    };

    getToken = () => {
        return localStorage.getItem("id_token");
    };

    logout = () => {
        localStorage.removeItem("id_token");
    };

    getConfirm = () => {
        // Using jwt-decode npm package to decode the token
        let answer = decode(this.getToken());
        return answer;
    };

    fetch = (url, options) => {
        // performs api calls sending the required authentication headers
        let headers;
        if (options !== undefined && ('headers' in options)) {
            headers = options['headers']
        } else {
            headers = {};
        }
        // Setting Authorization header
        if (this.loggedIn()) {
            headers["bearer"] = this.getToken();
        }

        return fetch(url, {
            headers,
            ...options
        })
            .then(this._checkStatus)
            .then(response => response.json());
    };

  _checkStatus = response => {
    // raises an error in case response status is not a success
    if (response.status >= 200 && response.status < 300) {
      // Success status lies between 200 to 300
      return response;
    } else if(response.status === 401){
        //logout if user is unauthorized
        this.logout();
        window.location.reload();
        let error = new Error(response.statusText + "\nPlease log in again");
        throw error;
    }
    else {
      const statusText = response.statusText;
      if(response.contentType === "application/json") {
          return response.json().then(response => {
              const responseText = getResponseErrorMessage(response);
              let error = new Error(statusText + "\n" + responseText);
              error.response = response;
              throw error;
          });
      } else {
          let error = new Error(statusText);
          throw error;
      }
    }
  };
}
