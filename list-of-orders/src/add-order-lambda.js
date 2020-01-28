"use strict"

let AWS = require("aws-sdk");

async function handler(event) {
  try {
    let json = JSON.parse(event.Records[0].body);
    validateMessage(json);

    console.log({added_order_id: json.order_id});

    return json.order_id;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function validateMessage(message) {
  if(message.type !== "order_confirmed")
    throw "the message type is wrong!";
}

module.exports = {
  handler: handler,
  validateMessage: validateMessage
}
  