// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

import React from "react";
import AuthHelperMethods from "../components/AuthHelperMethods";

const useFetch = (url, options) => {
    const [response, setResponse] = React.useState(null);
    const [error, setError] = React.useState(null);
    const Auth = new AuthHelperMethods();
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await Auth.fetch(url, options);
                const json = await res.json();
                setResponse(json);
            } catch (error) {
                setError(error);
            }
        };
        fetchData();
    }, []);
    return {response, error};
};

export default useFetch();