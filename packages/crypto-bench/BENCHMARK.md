# Benchmark

```
$ pnpm run bench

block-factory-fromData x 117 ops/sec @ 8ms/op
block-factory-fromData-with-tx x 44 ops/sec @ 22ms/op
block-factory-fromData-json x 124 ops/sec @ 8ms/op
block-factory-fromData-json-with-tx x 108 ops/sec @ 9ms/op
block-factory-fromHex x 189 ops/sec @ 5ms/op
block-factory-fromHex-with-tx x 161 ops/sec @ 6ms/op

tx-factory-fromData x 179 ops/sec @ 5ms/op
tx-factory-fromJson x 403 ops/sec @ 2ms/op
tx-factory-fromHex x 1,048 ops/sec @ 953μs/op ± 1.30% (min: 953μs, max: 953μs)

sign-bls12-381 x 36 ops/sec @ 27ms/op
verify-bls12-381 x 28 ops/sec @ 34ms/op
sign-schnorr x 190 ops/sec @ 5ms/op
verify-schnorr x 8,119 ops/sec @ 123μs/op ± 3.62% (min: 123μs, max: 123μs)
```