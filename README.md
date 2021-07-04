# About

Example elasticsearch model for storing metrics

## Model

Each metric has it's own document along with tags for contextual purposes

```
{
  metric: "aws.lambda.invocation",
  value: 1,
  traceId: "11-21-231-13-132"
}
```

## Script

The example script introduces 5 million metrics into the data store, waits for a full refresh of the index, then benchmarks the store by querying for metrics that have a given tag.

> Note: In real world usage, waiting for a full refresh of the index would not be necessary

> Note 2: In real world usage,

### Usage

Start up elasticsearch

```
docker-compose up es0 es1 es2
```

Install node dependencies

```
docker-compose run model2 npm i
```

Run script

```
docker-compose run model1 node index.mjs
```

## Results

Testing at 5 million and 35 million documents, I was consistently <10ms read times for retrieval of all metrics for a given tag

```
####### Creating index #######
✅ done!

###### Inserting 5,000,000 documents #########
insertion: 15.369s
✅ done!

############ Waiting for full refresh of index (may take a while) ############
Total documents in index: 35,000,000
full index refresh: 2:26.071 (m:ss.mmm)
✅ done!

############ Reading elements from index ############
read #0: 6.304ms
Invocation invocation-382af508-3e1d-495b-87c3-94a584ac6f25 has 50 metric documents

read #1: 3.255ms
Invocation invocation-f99dc1cb-8912-45a0-bccc-ae2ead0efd05 has 50 metric documents

read #2: 3.686ms
Invocation invocation-c4f40ea6-1bbe-4dcb-b498-a76963949f0c has 50 metric documents

read #3: 4.581ms
Invocation invocation-40963a82-865b-4097-9c63-5a11e6fe8a08 has 50 metric documents

read #4: 4.035ms
Invocation invocation-79ae73fa-47c3-43aa-b725-194070ce11c1 has 50 metric documents

read #5: 3.814ms
Invocation invocation-0bf4c3c2-ed29-4681-85da-f1b3a05d5972 has 50 metric documents

read #6: 3.384ms
Invocation invocation-1d33dc2d-ec0f-4034-87f7-4093a9b90624 has 50 metric documents

read #7: 3.294ms
Invocation invocation-1ec651cd-02c4-4585-84b9-e775f9b4bf04 has 50 metric documents

read #8: 4.158ms
Invocation invocation-b2f6dfef-9502-49d5-a6ee-c4662a2bd1bf has 50 metric documents

read #9: 4.006ms
Invocation invocation-92ff936d-324d-4699-b07e-66d191e645a5 has 50 metric documents

✅ done!
```
