# Alkane Collection

The collection contract for Alkanes Orbitals.

## Building

```bash
cargo build --target wasm32-unknown-unknown --release
```

## Check size

```bash
sudo ls -lh target/wasm32-unknown-unknown/release/alkanes_collection.wasm
```

The compiled WASM binary will be available in `target/wasm32-unknown-unknown/release/alkanes_collection.wasm`.

## Deployment

```bash
oyl alkane new-contract -c ./target/alkanes/wasm32-unknown-unknown/release/alkanes_collection.wasm -data 1,0 -p oylnet
```

## Tracing

```bash
oyl provider alkanes --method trace -params '{"txid":"f0513c7ef6f6816e208770d19eff7db4d284132686cf1f3f8d26236284d07f61", "vout":0}' -p oylnet
```

### output whitelist

```bash
cargo test test_merkle_generator2 -- --nocapture > test_output.log 2>&1
```
