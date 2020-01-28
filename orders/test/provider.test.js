let Pact = require("@pact-foundation/pact");
let path = require("path");
let order = require("../src/create-order-lambda");

describe("Given the Orders service", () => {
  
  // pact initialization
  let pact = new Pact.MessageProviderPact({
    messageProviders: {
      "an order_confirmed event": () => order.makeOrderConfirmedEvent("mariano"),
    },
    logLevel: "WARN",
    provider: "Orders",
    providerVersion: "1.0.0",
    pactUrls: [path.resolve(process.cwd(), "..", "pacts", "listoforders-orders.json")]
  })

  // verify the pact
  describe("When an order_confirmed event is published", () => {
    it("Then it should respect the pact", () => {
      return pact.verify();
    })
  })
})