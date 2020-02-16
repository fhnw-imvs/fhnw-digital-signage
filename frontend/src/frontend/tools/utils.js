// Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
// Licensed under MIT License, see LICENSE for details.

export const getResponseErrorMessage = (response) =>{
    if(!response.errors) return "";
  let message = "";
    response.errors.forEach(error =>{
      message += error.msg +"\n";
    });
    return message;
};