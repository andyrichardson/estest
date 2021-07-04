import { Client } from "@elastic/elasticsearch";
import { v4 as uuid } from "uuid";

const INDEX = "index";
const INVOCATIONS = 100000;
// const INVOCATIONS = 1000000;
const METRICS = 50;

const client = new Client({
  nodes: ["es01", "es02", "es03"].map((n) => `http://${n}:9200`),
});

const invocations = new Array(INVOCATIONS)
  .fill(null)
  .map((_, i) => `invocation-${uuid()}`);
const metrics = new Array(METRICS).fill(null).map((_, i) => `metric-${uuid()}`);
const value = () => parseInt(Math.random() * 100);

const insert = async () => {
  const chunks = chunk(invocations, 50);

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map((inv) => {
        client.bulk({
          refresh: "wait_for",
          body: metrics.flatMap((metric) => {
            return [
              { index: { _index: INDEX } },
              { type: metric, value: value(), invocation: inv },
            ];
          }),
        });
      })
    );
  }
};

const read = (invocation) =>
  client.search({
    size: 50,
    index: INDEX,
    body: {
      query: {
        match: {
          invocation,
        },
      },
    },
  });

const chunk = (list, chunkSize) => {
  const iterations = Math.ceil(list.length / chunkSize);
  return new Array(iterations)
    .fill(null)
    .reduce(
      (acc, _, index) => [
        ...acc,
        list.slice(chunkSize * index, chunkSize * (index + 1)),
      ],
      []
    );
};

(async () => {
  console.log("####### Creating index #######");
  await client.indices
    .create({
      index: INDEX,
      body: {
        mappings: {
          properties: {
            invocation: { type: "keyword" },
            type: { type: "keyword" },
          },
        },
      },
    })
    .catch(console.warn);
  console.log("✅ done!\n");

  console.log(
    `###### Inserting ${prettyNum(
      invocations.length * metrics.length
    )} documents #########`
  );
  console.time("insertion");
  await insert();
  console.timeEnd("insertion");
  console.log("✅ done!\n");

  console.log(
    "############ Waiting for index to refresh (may take a while) ############"
  );
  console.time("count");
  const res = await client.cat.count({ index: INDEX, format: "json" });
  console.log(`Result: ${prettyNum(res.body[0].count)}`);
  console.timeEnd("count");
  console.log("✅ done!\n");

  console.log("############ Reading elements from index ############");
  for (let i in new Array(10).fill(null)) {
    console.time(`read #${i}`);
    const inv = invocations[Math.floor(Math.random() * invocations.length)];
    const response = await read(inv);
    console.timeEnd(`read #${i}`);
    console.log(
      `Invocation had ${response.body.hits.total.value} metric documents \n`
    );
  }
  console.log("✅ done!\n");
})();

const prettyNum = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
