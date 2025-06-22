#!/usr/bin/env bash
set -e

echo "Starting optimized WASM build..."

# 1. Clean previous build artifacts
cargo clean

# 2. Set optimization flags (size + LTO + bulk-memory)
export RUSTFLAGS="-C opt-level=z -C lto=true -C codegen-units=1 -C target-feature=+bulk-memory"

# 3. Compile release‐optimized WASM
echo "Compiling WASM with bulk-memory enabled..."
cargo build --target wasm32-unknown-unknown --release

# 4. Measure original WASM size
ORIGINAL=target/wasm32-unknown-unknown/release/alkanes_collection.wasm
ORIGINAL_SIZE=$(wc -c < "$ORIGINAL")
echo "Original WASM size: ${ORIGINAL_SIZE} bytes"

# 5. Run wasm-opt for further size reduction (enable bulk-memory)
if command -v wasm-opt &> /dev/null; then
    echo "Optimizing with wasm-opt (enable bulk-memory)..."
    wasm-opt --enable-bulk-memory -Oz \
      "$ORIGINAL" \
      -o "${ORIGINAL%.wasm}_optimized.wasm"

    OPTIMIZED="${ORIGINAL%.wasm}_optimized.wasm"
    OPTIMIZED_SIZE=$(wc -c < "$OPTIMIZED")
    echo "Optimized WASM size: ${OPTIMIZED_SIZE} bytes"

    SAVED=$((ORIGINAL_SIZE - OPTIMIZED_SIZE))
    PERCENTAGE=$(echo "scale=2; $SAVED * 100 / $ORIGINAL_SIZE" | bc)
    echo "Size reduced by: ${SAVED} bytes (${PERCENTAGE}%)"
else
    echo "wasm-opt not installed; skipping post-processing"
    echo "Install: npm install -g binaryen"
fi

echo "Build complete!"