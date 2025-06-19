# Satonomy Beep Boop Collection

Satonomy Beep Boop Collection is an on-chain generative NFT collection powered by the Alkanes Protocol on Bitcoin L1.  
All traits and images are stored and composed on-chain. Minting logic, whitelisting, and trait metadata are implemented in Rust smart contracts.

---

## Features

- Fully on-chain NFT contract (Rust, Alkanes Protocol)
- Bit-packed, gas-efficient trait encoding
- Merkle proof whitelist minting
- SVG/PNG image generation from on-chain traits
- Configurable trait layers and metadata
- Bitcoin Taproot BTC payment support
- Cross-contract background/image composition

---

## How It Works

1. **Traits**

   - Define trait categories (e.g. Back, Base, Body, Hand, Hat, Head) and PNG assets in `src/generation/traits/`.
   - Configure trait structure and options in `encoded_traits.json` (`format`, `indices`, `items`).

2. **Encoding**

   - Each NFT is represented by a single integer (`items[n]`), encoding all traits using bit-packing.

3. **Minting**

   - Minting is controlled by block height and Merkle whitelist.
   - Users submit a Merkle proof to verify eligibility.
   - BTC is sent directly to the contract's Taproot address.

4. **Image Generation**
   - The contract dynamically assembles trait layers into a PNG/SVG image on request.

---

## How to Deploy

1. **Add your trait PNGs**

   - Place all layer images in `src/generation/traits/{Layer}/{TraitName}.png`.

2. **Configure traits**

   - Update `encoded_traits.json` (`format`, `indices`, and generate your `items` array).

3. **Build contract**

   - Build with your Rust toolchain for the Alkanes Protocol.

4. **Deploy**
   - Deploy to your desired Alkanes-compatible Bitcoin chain.
   - Set your background generator contract if customizing.
   - Max 500kb per contract

---

## Example Usage

- Query on-chain metadata and SVG/PNG for any NFT.
- Mint new NFTs using valid Merkle proofs and BTC payment.

---

## Credits

Developed by [Satonomy](https://satonomy.io)  
Built with ❤️ for the Alkanes Protocol & Bitcoin Ordinals ecosystem.
