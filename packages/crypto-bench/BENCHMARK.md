# Benchmark

```
$ pnpm run bench

block-factory-fromData x 137 ops/sec @ 7ms/op ± 1.95% (min: 6ms, max: 12ms)
block-factory-fromData-with-tx x 112 ops/sec @ 8ms/op ± 2.26% (min: 6ms, max: 24ms)
block-factory-fromData-json x 151 ops/sec @ 6ms/op ± 1.66% (min: 5ms, max: 9ms)
block-factory-fromData-json-with-tx x 122 ops/sec @ 8ms/op ± 1.82% (min: 6ms, max: 11ms)
block-factory-fromHex x 194 ops/sec @ 5ms/op ± 1.29% (min: 4ms, max: 8ms)
block-factory-fromHex-with-tx x 168 ops/sec @ 5ms/op ± 2.00% (min: 4ms, max: 9ms)

tx-factory-fromData x 1,729 ops/sec @ 578μs/op ± 12.70% (min: 200μs, max: 6ms)
tx-factory-fromJson x 1,787 ops/sec @ 559μs/op ± 9.88% (min: 219μs, max: 3ms)
tx-factory-serialize x 1,125 ops/sec @ 888μs/op ± 7.70% (min: 341μs, max: 3ms)
tx-factory-fromHex x 3,696 ops/sec @ 270μs/op ± 12.85% (min: 77μs, max: 2ms)

sign-bls12-381 x 3,177 ops/sec @ 314μs/op
verify-bls12-381 x 1,041 ops/sec @ 959μs/op
sign-schnorr x 16,675 ops/sec @ 59μs/op ± 64.66% (min: 37μs, max: 4ms)
verify-schnorr x 30,342 ops/sec @ 32μs/op ± 2.56% (min: 31μs, max: 120μs)

aggregate-signatures-bls12-381 x 704 ops/sec @ 1ms/op
aggregate-public-keys-bls12-381 x 1,191 ops/sec @ 839μs/op

worker-tx-factory-fromJson x 959 ops/sec @ 1ms/op ± 13.04% (min: 273μs, max: 16ms)
worker-tx-factory-fromHex x 2,026 ops/sec @ 493μs/op ± 8.57% (min: 144μs, max: 2ms)
worker-block-factory-fromData-json-with-tx x 55 ops/sec @ 17ms/op ± 2.34% (min: 15ms, max: 59ms)
worker-bls12-381-verify x 916 ops/sec @ 1ms/op
worker-schnorr-verify x 12,255 ops/sec @ 81μs/op ± 48.91% (min: 53μs, max: 5ms)
```