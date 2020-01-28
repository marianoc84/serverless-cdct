"use strict"

// module configuration
let AWS = require("aws-sdk");
let sqs = new AWS.SQS();

// Lambda handler
async function handler(event) {
  try {
    // create the order_confirmed event
    let evt = makeOrderConfirmedEvent(event.customer_name);

    // wrap the evt to respect SQS format
    let params = {
      MessageBody: JSON.stringify(evt),
      QueueUrl: process.env.QUEUE_URL
    }

    // send event on SQS
    await sqs.sendMessage(params).promise();

    // return a successfull response to API Gateway
    return {
      statusCode: 200,
      body: JSON.stringify({
        order_id: evt.order_id
      })
    }
  } catch (error) {
    // in case of error return 500 to API Gateway
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({error_message: `${error}`})
    }
  }
}

function makeOrderConfirmedEvent(customer_name) {
  if(!customer_name)
    throw "customer_name field is mandatory!";
  
  return {
    "type": "order_confirmed",
    "order_id": (Math.floor(Math.random() * 10000) + 1).toString(),
    "timestamp": new Date(),
    "customer_id": customer_name 
    //"customer_name": customer_name // junior dev work
  }
}

module.exports = {
  handler: handler, // this module needs to be exported so Lambda platform can execute it
  makeOrderConfirmedEvent: makeOrderConfirmedEvent // this model needs to be exported so we can run CDCT on it
}