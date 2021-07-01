import { Client } from "@elastic/elasticsearch";
import { v4 as uuid } from "uuid";

const index = "index";

const client = new Client({
  nodes: ["es01", "es02", "es03"].map((n) => `http://${n}:9200`),
});

const invocations = new Array(10000).fill(null).map((_, i) => `inv${i}`);
const value = () => parseInt(Math.random() * 100);
const metrics = new Array(50).fill(null).map((_, i) => `m${i}`);

const insert = () =>
  Promise.all(
    invocations.map(async (inv) => {
      // Run sequentially
      for (let m in metrics) {
        await client.create({
          id: uuid(),
          index,
          body: {
            type: m,
            value: value(),
            invocation: inv,
            tags: [{ type: "invocation", value: inv }],
          },
        });
      }
    })
  );

const read = () =>
  Promise.all(
    invocations.map((inv) =>
      client.search({
        size: 50,
        index,
        body: {
          query: {
            match: {
              invocation: inv,
            },
          },
        },
      })
    )
  );

(async () => {
  console.log("Starting insertion");
  const t1 = Date.now();
  await insert();
  console.log("Insert time: ", Date.now() - t1);

  console.log("Starting break");
  await delay(10000);
  console.log("Ended break");

  console.log("Starting read");
  const t2 = Date.now();
  await read();
  console.log("Read time: ", Date.now() - t2);
})();

const delay = (s) => new Promise((resolve) => setTimeout(resolve, s));
