# Introduction
This Git repository is the code companion for [this](https://medium.com/swlh/why-unit-testing-is-not-enough-when-it-comes-to-microservices-c3b0dde14174?source=friends_link&sk=b9bc3b4067cd2e97615fa55974189b31) Medium blogpost.
Aim of the article is to *demonstrate how challenging can be the testing of service oriented architectures* (in our example two micro/nanoservices deployed on AWS Lambda).

# From "unit" to "consumer-driven contract" testing
With good reason, unit tests are seen as a guiding light by every good developer. As the name suggest, this type of test involves just a unit of the overall codebase, without any external dependencies like databases, HTTP calls, queues, topics or something like that. This characteristics makes unit testing deterministic and, above all, fast; so we could run an entire suite of thousands of tests in a bunch of seconds.
Back in the days of big fat monolithic projects, a good suite of unit tests may validate the entire system right after a refactoring work.

Today, with the raise of microservices architectures, this is simply undoable! What we used to call the system, in fact, is now spread into hundreds or thousands of tiny little projects, completely unaware one another.
For this reason, **unit testing (alone) is not enough when it comes to testing microservices oriented architectures**!

Beware: I’m not saying that unit testing isn’t useful! What I’m saying, instead, is that even though **unit tests are a great tool for validating microservices’ internal behaviour; what we really need is a complementary tool for testing their external behaviour too.**
Generally speaking, **we need to check that a modification of a provider service does not impact its consumers**. As this type of tests are _consumer-first_ they are called Consumer-Driven Contract Testing (CDCT).

Read more [here](https://medium.com/swlh/why-unit-testing-is-not-enough-when-it-comes-to-microservices-c3b0dde14174?source=friends_link&sk=b9bc3b4067cd2e97615fa55974189b31).

# Filetree
```
.
├── README.md                       # this file
├── list-of-orders                  # ListOfOrders service
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   │   └── add-order-lambda.js     # Lambda's source
│   └── test
│       └── consumer.test.js        # Consumer's test
├── orders                          # Orders service
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   │   └── create-order-lambda.js  # Lambda's source
│   └── test
│       └── provider.test.js        # Provider's test
├── pacts
│   └── listoforders-orders.json    # contract built after cdct run
└── template.yml                    # IaC definition

7 directories, 12 files
```

# CDCT in action
To run your test you have to install all the dependencies (including testing frameworks: [Pact](https://docs.pact.io/) for CDCT and [Jest](https://jestjs.io/)) for both microservices `list-of-orders` and `orders`:

```
cd orders
rm -rf node_modules
npm install --development

cd ../list-of-orders
rm -rf node_modules
npm install --development
```

once this activity has been done we have to create our contracts (you can read the aforementioned article for details). As we said, these tests are _consumer-first_, so we have to run the _ListOfOrders_ tests first, so if you are not already there, move into `list-of-orders` directory and run `npm run test` (it is an alias, defined in _package.json_):

```
cd list-of-orders
npm run test
```

[![asciicast](https://asciinema.org/a/0xy8FYgzED028F8AUTZTtQQvx.svg)](https://asciinema.org/a/0xy8FYgzED028F8AUTZTtQQvx)

If everything is OK, you should see a `/pacts` directory with a JSON file in it that represent the contract (i.e. the expectations of _ListOfOrders_ service).

From now on, every time we need to modify the provider service (i.e. _Orders_) we can run its test on it and verify if it broke the contract or not. For a better understanding, move into `orders` directory and run the provider's test:

```
cd orders
npm run test
```

[![asciicast](https://asciinema.org/a/m1I76TDQKGrBPUAthMz9Yn3t6.svg)](https://asciinema.org/a/m1I76TDQKGrBPUAthMz9Yn3t6)

Everything is OK! 

Suppose now a junior developer is working with _Orders_ service and, he thinks that is a good idea to change  
the line 47 of method `makeOrderConfirmedEvt` in _create-order-lambda.js_, so the message produced will be:

```
{
    "type": "order_confirmed",
    "order_id": "3123",
    "timestamp": "2019-12-10T17:16:06.656Z",
    "customer_name": "peter",
    "address": "14 North Moore Street, New York"
}
```

instead of

```
{
    "type": "order_confirmed",
    "order_id": "3123",
    "timestamp": "2019-12-10T17:16:06.656Z",
    "customer_id": "peter",
    "address": "14 North Moore Street, New York"
}
```

With a small work of refactoring, this change to the internal of _Orders_ service will be easily accepted by unit test. We have a great problem now, because _ListOfOrders_ service (i.e. the consumer) still waits for `customer_id` otherwise an exception will be thrown.

With CDCT in place we avoid this risk, as we have a tool to validate ahead of time if the contract between producer and consumer has been broken.

[![asciicast](https://asciinema.org/a/ynng5wvA0Kjkgw9zHcvfJr7hr.svg)](https://asciinema.org/a/ynng5wvA0Kjkgw9zHcvfJr7hr)

# Deploy on AWS
If CDCT doesn't return any error, you could safely deploy this application using the following command:

```
# satisfy orders dependencies
cd orders
rm -rf node_modules
npm install --production

# satisfy list-of-orders dependencies
cd ../list-of-orders
rm -rf node_modules
npm install --production

# deploy the solution
cd ..
sam deploy --profile <target profile> # how to create a target profile? https://amzn.to/2sI6s7i
```

If this is the first deploy of the project, some information will be asked through a wizard.

# Note
Concepts and ideas expressed in that article remains valid whatever the technological stack! We used Pact as CDCT framework and AWS Lambda as deployment, but you could reimplement the solution on-prem using Kubernetes and testing the contracts _manually_. 