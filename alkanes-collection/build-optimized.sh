#!/bin/bash

# WASM optimized build script

echo "Starting optimized WASM build..."

# 1. Clean previous build artifacts
cargo clean

# 2. Compile release‐optimized WASM
echo "Compiling WASM..."
cargo build --target wasm32-unknown-unknown --release

# 3. Measure original WASM size
ORIGINAL_SIZE=$(wc -c < target/wasm32-unknown-unknown/release/alkanes_collection.wasm)
echo "Original WASM size: ${ORIGINAL_SIZE} bytes"

# 4. Run wasm-opt for further size reduction, if available
if command -v wasm-opt &> /dev/null; then
    echo "Optimizing with wasm-opt..."
    wasm-opt -Os \
      target/wasm32-unknown-unknown/release/alkanes_collection.wasm \
      -o target/wasm32-unknown-unknown/release/alkanes_collection_optimized.wasm

    OPTIMIZED_SIZE=$(wc -c < target/wasm32-unknown-unknown/release/alkanes_collection_optimized.wasm)
    echo "Optimized WASM size: ${OPTIMIZED_SIZE} bytes"

    SAVED=$((ORIGINAL_SIZE - OPTIMIZED_SIZE))
    PERCENTAGE=$(echo "scale=2; $SAVED * 100 / $ORIGINAL_SIZE" | bc)
    echo "Size reduced by: ${SAVED} bytes (${PERCENTAGE}%)"
else
    echo "wasm-opt not installed; skipping optimization"
    echo "To install: npm install -g wasm-opt"
fi

echo "Build complete!"