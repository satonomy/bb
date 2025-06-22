#!/usr/bin/env bash
set -e

echo "Starting optimized WASM build..."

# 1. Clean previous build artifacts
cargo clean

echo "Compiling WASM..."
cargo build --target wasm32-unknown-unknown --release

# 2. Define paths
ORIG=target/wasm32-unknown-unknown/release/alkanes_collection.wasm
OPT_PATH="${ORIG%.wasm}_optimized.wasm"

# Verify original exists
if [ ! -f "$ORIG" ]; then
  echo "Error: original WASM not found at $ORIG"
  exit 1
fi
ORIG_SIZE=$(wc -c < "$ORIG")
echo "Original WASM size: ${ORIG_SIZE} bytes"

# 3. Optimize with wasm-opt if available
if command -v wasm-opt &> /dev/null; then
  echo "Optimizing with wasm-opt -Os..."
  if wasm-opt -Os "$ORIG" -o "$OPT_PATH"; then
    echo "wasm-opt succeeded, output: $OPT_PATH"
  else
    echo "wasm-opt failed; copying original to optimized path"
    cp "$ORIG" "$OPT_PATH"
  fi
else
  echo "wasm-opt not installed; copying original to optimized path"
  cp "$ORIG" "$OPT_PATH"
fi

# 4. Verify optimized file and report size
if [ -f "$OPT_PATH" ]; then
  FINAL_SIZE=$(wc -c < "$OPT_PATH")
  echo "Final WASM size: ${FINAL_SIZE} bytes"
else
  echo "Error: optimized file not found at $OPT_PATH"
  exit 1
fi

echo "Build complete!"