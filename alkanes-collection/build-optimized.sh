#!/usr/bin/env bash
set -e

echo "Starting optimized WASM build..."

# 1. Clean previous build artifacts
cargo clean

# 2. Set size optimizations & enable bulk-memory (no LTO here)
export RUSTFLAGS="-C opt-level=z -C codegen-units=1 -C target-feature=+bulk-memory"

# 3. Compile release‐optimized WASM
echo "Compiling WASM..."
cargo build --target wasm32-unknown-unknown --release

# 4. Measure original WASM size
ORIG=target/wasm32-unknown-unknown/release/alkanes_collection.wasm
ORIG_SIZE=$(wc -c < "$ORIG")
echo "Original WASM size: ${ORIG_SIZE} bytes"

# 5. Run wasm-opt for further size reduction (bulk-memory enabled)
if command -v wasm-opt &> /dev/null; then
  echo "Optimizing with wasm-opt..."
  wasm-opt --enable-bulk-memory -Oz \
    "$ORIG" \
    -o "${ORIG%.wasm}_opt.wasm"

  OPT="${ORIG%.wasm}_opt.wasm"
  OPT_SIZE=$(wc -c < "$OPT")
  echo "Optimized WASM size: ${OPT_SIZE} bytes"

  SAVED=$((ORIG_SIZE - OPT_SIZE))
  PCT=$(echo "scale=2; $SAVED * 100 / $ORIG_SIZE" | bc)
  echo "Size reduced by: ${SAVED} bytes (${PCT}%)"
else
  echo "wasm-opt not found; skipping post‐processing"
fi

echo "Build complete!"