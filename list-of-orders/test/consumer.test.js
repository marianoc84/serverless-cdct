let Pact = require("@pact-foundation/pact");
let path = require("path")
let loo = require("../src/add-order-lambda");

describe("Given the ListOfOrders service", () => {

  // initialize the pact
  let messagePact = new Pact.MessageConsumerPact({
    consumer: "ListOfOrders",
    dir: path.resolve(process.cwd(), "..", "pacts"),
    provider: "Orders",
  });

  // describe the test case
  describe("When an order_confirmed event is received", () => {
    it("Then it should respect the pact", () => {
      
      let dtregex = '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$';

      // consumer's expectations
      return messagePact
        .expectsToReceive("an order_confirmed event")
        .withContent({
          type: "order_confirmed",
          order_id: Pact.Matchers.term({matcher: "^[0-9]{1,4}$", generate: "4121"}),
          customer_id: "mariano",
          timestamp: Pact.Matchers.term({matcher: dtregex, generate: "2019-12-10T17:16:06.656Z"})
        })

        // verify consumer's ability to handle messages
        .verify(Pact.synchronousBodyHandler(loo.validateMessage));
    });
  });
});