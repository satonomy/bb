#!/usr/bin/env bash
set -e

echo "Starting optimized WASM build..."

# 1. Clean previous build artifacts
cargo clean

# 2. Compile release‐optimized WASM
echo "Compiling WASM..."
cargo build --target wasm32-unknown-unknown --release

# 3. Measure original WASM size
ORIG=target/wasm32-unknown-unknown/release/alkanes_collection.wasm
ORIG_SIZE=$(wc -c < "$ORIG")
echo "Original WASM size: ${ORIG_SIZE} bytes"

# 4. Run wasm-opt for further size reduction (best effort)
if command -v wasm-opt &> /dev/null; then
    echo "Optimizing with wasm-opt -Os..."
    OPT_PATH="${ORIG%.wasm}_optimized.wasm"
    if wasm-opt -Os "$ORIG" -o "$OPT_PATH"; then
        echo "wasm-opt succeeded"
    else
        echo "wasm-opt failed, falling back to original binary"
        cp "$ORIG" "$OPT_PATH"
    fi
    OPT_SIZE=$(wc -c < "$OPT_PATH")
    echo "Final WASM size: ${OPT_SIZE} bytes"
else
    echo "wasm-opt not installed; skipping optimization"
fi

echo "Build complete!"