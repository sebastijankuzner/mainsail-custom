# Benchmark

```
$ pnpm run bench

sign-bls12-381 x 35 ops/sec @ 28ms/op
verify-bls12-381 x 27 ops/sec @ 35ms/op
sign-schnorr x 195 ops/sec @ 5ms/op
verify-schnorr x 7,972 ops/sec @ 125μs/op ± 3.59% (min: 125μs, max: 125μs)
```