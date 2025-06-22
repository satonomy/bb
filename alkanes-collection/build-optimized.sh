#!/usr/bin/env bash
set -e

echo "Starting optimized WASM build..."

# 1. Clean previous build artifacts
cargo clean

# 2. Set size optimizations & enable bulk-memory
export RUSTFLAGS="-C opt-level=z -C codegen-units=1 -C target-feature=+bulk-memory"

# 3. Compile release‐optimized WASM
echo "Compiling WASM..."
cargo build --target wasm32-unknown-unknown --release

# 4. Measure original WASM size
ORIG=target/wasm32-unknown-unknown/release/alkanes_collection.wasm
ORIG_SIZE=$(wc -c < "$ORIG")
echo "Original WASM size: ${ORIG_SIZE} bytes"

# 5. Run wasm-opt for further size reduction
if command -v wasm-opt &> /dev/null; then
    echo "Optimizing with wasm-opt (attempting bulk-memory)..."
    OPT_PATH="${ORIG%.wasm}_optimized.wasm"
    # try bulk-memory flag first
    if wasm-opt --enable-bulk-memory -Oz "$ORIG" -o "$OPT_PATH"; then
        echo "wasm-opt with bulk-memory succeeded"
    else
        echo "--enable-bulk-memory unsupported, retrying without it"
        wasm-opt -Oz "$ORIG" -o "$OPT_PATH"
    fi
    
    OPT_SIZE=$(wc -c < "$OPT_PATH")
    echo "Optimized WASM size: ${OPT_SIZE} bytes"

    SAVED=$((ORIG_SIZE - OPT_SIZE))
    PCT=$(echo "scale=2; 