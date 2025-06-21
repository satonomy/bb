const backChance = 0.85
const handChance = 0.4
const hatChance = 0.9 // 0.8% chance
const bgChance = 0.015

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function weightedPick(arr, weights) {
  let total = 0
  arr.forEach((v) => (total += weights[v] || 1))
  let r = Math.random() * total
  for (const v of arr) {
    const w = weights[v] || 1
    if (r < w) return v
    r -= w
  }
  return arr[arr.length - 1]
}

function getHandWeights(pool) {
  const w = {}
  pool.forEach((h) => (w[h] = /\bBlue\b/.test(h) ? 0.1 : 1))
  return w
}

function generateNFTs(count) {
  const combos = new Set()
  specialBackgrounds.forEach((bg) =>
    combos.add(
      JSON.stringify({
        Background: bg,
        Back: "None.png",
        Body: "None.png",
        Head: "None.png",
        Hat: "None.png",
        Hand: "None.png",
      })
    )
  )

  const usedGoldenTriples = new Set()

  while (combos.size < count) {
    // Background + Body + color
    const bgPool = traitFiles.Background.filter(
      (b) =>
        !specialBackgrounds.includes(b) && b !== "City.png" && b !== "Stars.png"
    )
    const Body = pick(traitFiles.Body)

    const isGoldenBody = Body.includes("Golden")
    const Background =
      Math.random() < (isGoldenBody ? bgChance + bgChance : bgChance)
        ? isGoldenBody
          ? "Stars.png"
          : "City.png"
        : pick(bgPool)

    const m = Body.match(/\b(Red|Blue|Green|Golden)\b/)
    const color = m ? m[1] : "Gray"

    // Back
    let Back = null
    if (Math.random() < backChance) {
      Back = pick(traitFiles.Back)
    }

    // Head
    const isMulti = multiColorBody.includes(Body)
    const headPool = isMulti
      ? // allow any non-Golden head for multi-color bodies
        traitFiles.Head.filter((h) => !/\bGolden\b/.test(h))
      : color === "Gray"
      ? traitFiles.Head.filter((h) => !/(Red|Blue|Green|Golden)\b/.test(h))
      : traitFiles.Head.filter((h) => new RegExp(`\\b${color}\\b`).test(h))
    const Head = headPool.length ? pick(headPool) : null

    // skip duplicate Golden triple
    if (color === "Golden") {
      const triple = `${Body}|${Head}|${Back}`
      if (usedGoldenTriples.has(triple)) continue
      usedGoldenTriples.add(triple)
    }

    // Hand always matches Body color (multi-color bodies still match by color if any)
    const handPool = traitFiles.Hand.filter((h) =>
      color === "Gray"
        ? !/(Red|Blue|Green|Golden)\b/.test(h)
        : new RegExp(`\\b${color}\\b`).test(h)
    )
    const Hand =
      Math.random() < handChance
        ? weightedPick(handPool, getHandWeights(handPool))
        : null

    combos.add(
      JSON.stringify({ Background, Back, Body, Head, Hat: null, Hand })
    )
  }

  // Hats assignment
  const arr = Array.from(combos).map((s) => JSON.parse(s))

  const usage = {}
  traitFiles.Hat.forEach((h) => (usage[h] = 0))
  const maxHatUses = 2

  // 1) Pick exactly one “Mice Hat” on a random non‐special, non‐golden NFT:
  const candidates = arr.filter(
    (o) =>
      !specialBackgrounds.includes(o.Background) && !/\bGolden\b/.test(o.Body)
  )
  if (candidates.length > 0) {
    const one = candidates[Math.floor(Math.random() * candidates.length)]
    one.Hat = "Mice Hat.png"
    usage["Mice Hat.png"] = 1
  }

  const usedGoldenHats = new Set()

  arr.forEach((o) => {
    if (o.Hat) return

    if (Math.random() >= hatChance) {
      o.Hat = null
      return
    }

    if (/\bGolden\b/.test(o.Body)) {
      if (Math.random() >= hatChance * 0.9) {
        o.Hat = null
        return
      }

      const hatWeights = {}
      const pool = traitFiles.Hat.filter((h) => h !== "Mice Hat.png")
      o.Hat = weightedPick(pool, hatWeights)
      usage[o.Hat]++
    } else {
      const hatWeights = {}
      const pool = traitFiles.Hat.filter((h) => h !== "Mice Hat.png")
      o.Hat = weightedPick(pool, hatWeights)
      usage[o.Hat]++
    }

    if (specialBackgrounds.includes(o.Background)) {
      o.Back = "None.png"
      o.Hat = "None.png"
      o.Hand = "None.png"
    }
  })

  const forcedGolden = {
    Background: pick(
      traitFiles.Background.filter((b) => !specialBackgrounds.includes(b))
    ),
    Back:
      traitFiles.Back.find((b) => /\bGolden\b/.test(b)) ||
      pick(traitFiles.Back),
    Body: traitFiles.Body.find((b) => /\bGolden\b/.test(b)),
    Head: traitFiles.Head.find((h) => /\bGolden\b/.test(h)),
    Hat: traitFiles.Hat.find((h) => /\Royal Crown\b/.test(h)),
    Hand: traitFiles.Hand.find((h) => /\bGolden\b/.test(h)),
  }

  // Remove any existing full golden
  const isFullGolden = (o) =>
    /\bGolden\b/.test(o.Body) &&
    /\bGolden\b/.test(o.Head) &&
    /\bGolden\b/.test(o.Hat) &&
    /\bGolden\b/.test(o.Hand)

  const filtered = arr.filter((o) => !isFullGolden(o))

  // Ensure exactly 10,000
  while (filtered.length > 9999) filtered.pop()
  filtered.unshift(forcedGolden)

  return filtered
}

const specialBackgrounds = [
  "Alkane Pandas.png",
  "Dead Alkanes.png",
  "Oyly.png",
  "Holographic.png",
  "Orbinauts.png",
  "Alchemist.png",
  "Airhead.png",
  "Satonomy.png",
  "Square Head.png",
  "Dark Force.png",
  "Light Force.png",
]

const multiColorBody = [
  "Blazer.png",
  "Hooded Sweatshirt.png",
  "Leather Jacket.png",
  "Suit.png",
]

const traitFiles = {
  Background: [
    "Blue.png",
    "Green.png",
    "Cyan.png",
    "Red.png",
    "Purple.png",
    "Stars.png",
    "City.png",
    "Alkane Pandas.png",
    "Dead Alkanes.png",
    "Oyly.png",
    "Holographic.png",
    "Orbinauts.png",
    "Alchemist.png",
    "Airhead.png",
    "Satonomy.png",
    "Square Head.png",
    "Dark Force.png",
    "Light Force.png",
  ],
  Back: [
    "Fairy Wings.png",
    "Backpack.png",
    "Imp Wings.png",
    "Drone 01.png",
    "Drone 03.png",
    "Drone 02.png",
    "Jetpack.png",
    "Golden Wings.png",
    "Golden Jetpack.png",
    "Angel Wings.png",
    "None.png",
  ],
  Body: [
    "Red Mainframe 09.png",
    "Hooded Sweatshirt.png",
    "Lab Coat.png",
    "Red Mainframe 08.png",
    "Red Plumber Overalls.png",
    "Suit.png",
    "Leather Jacket.png",
    "Red Skull Shirt.png",
    "Skull Shirt.png",
    "Butcher Apron.png",
    "Green Butcher Apron.png",
    "Mainframe 03.png",
    "Blue Mainframe 07.png",
    "Blue Mainframe 06.png",
    "Mainframe 02.png",
    "Blue Mainframe 04.png",
    "Blue Mainframe 10.png",
    "Blue Mainframe 05.png",
    "Golden Frame.png",
    "Mainframe 01.png",
    "Mainframe 05.png",
    "Blue Mainframe 01.png",
    "Mainframe 10.png",
    "Mainframe 04.png",
    "Mainframe 06.png",
    "Green Mainframe 09.png",
    "Blue Mainframe 02.png",
    "Green Plumber Overalls.png",
    "Blue Mainframe 03.png",
    "Mainframe 07.png",
    "Green Mainframe 08.png",
    "Green Mainframe 05.png",
    "Golden Chassis.png",
    "Golden Hull.png",
    "Green Mainframe 10.png",
    "Mainframe 09.png",
    "Red Butcher Apron.png",
    "Mainframe 08.png",
    "Green Mainframe 03.png",
    "Blue Mainframe 08.png",
    "Blue Mainframe 09.png",
    "Green Mainframe 02.png",
    "Green Mainframe 01.png",
    "Plumber Overalls.png",
    "Red Mainframe 06.png",
    "Striped Shirt.png",
    "Red Mainframe 05.png",
    "Red Lab Coat.png",
    "Red Mainframe 10.png",
    "Red Mainframe 04.png",
    "Blazer.png",
  ],
  Head: [
    "Golden Neuron.png",
    "Brain Unit.png",
    "Organic Unit.png",
    "Party Glasses.png",
    "Processing Unit 08.png",
    "Processing Unit 09.png",
    "Red Processing Unit 14.png",
    "Red Processing Unit 11.png",
    "Red Processing Unit 04.png",
    "Red Processing Unit 10.png",
    "Red Processing Unit 06.png",
    "Red Processing Unit 12.png",
    "Red Processing Unit 13.png",
    "Red Processing Unit 07.png",
    "Seed Unit.png",
    "Processing Unit 01.png",
    "Golden Cortex.png",
    "Processing Unit 14.png",
    "Red Processing Unit 09.png",
    "Processing Unit 02.png",
    "Processing Unit 03.png",
    "Red Processing Unit 08.png",
    "Processing Unit 07.png",
    "Processing Unit 13.png",
    "Processing Unit 12.png",
    "Processing Unit 06.png",
    "Processing Unit 10.png",
    "Processing Unit 04.png",
    "Processing Unit 05.png",
    "Processing Unit 11.png",
    "Golden Analyzer.png",
    "Blue Processing Unit 13.png",
    "Blue Sunglasses.png",
    "Sunglasses.png",
    "Blue Processing Unit 06.png",
    "Blue Processing Unit 12.png",
    "Red Sunglasses.png",
    "Blue Processing Unit 04.png",
    "Blue Processing Unit 10.png",
    "Golden Synapse.png",
    "Blue Processing Unit 05.png",
    "Energy Unit.png",
    "Blue Processing Unit 01.png",
    "Red Party Glasses.png",
    "Blue Processing Unit 03.png",
    "Blue Party Glasses.png",
    "Green Processing Unit 13.png",
    "Green Processing Unit 07.png",
    "Green Processing Unit 06.png",
    "Green Processing Unit 12.png",
    "Green Processing Unit 04.png",
    "Green Processing Unit 10.png",
  ],
  Hat: [
    "Royal Crown.png",
    "Mice Hat.png",
    "Egg Basket.png",
    "Trainer Cap.png",
    "Baseball Cap.png",
    "Propeller Hat.png",
    "Golden Halo.png",
    "Signal Antenna.png",
    "Golden Egg Basket.png",
    "Beanie.png",
    "Bird Hat.png",
    "Gentleman Hat.png",
    "Cooking Hat.png",
    "Adventurer Hat.png",
    "Farmer Hat.png",
    "Mushroom Hat.png",
    "Magic Hat.png",
    "Mining Hat.png",
    "Radio Antenna.png",
    "Plumber Hat.png",
    "Magician Hat.png",
    "Pirate Hat.png",
    "Cowboy Hat.png",
    "None.png",
  ],
  Hand: [
    "Golden Elder Staff.png",
    "Racket.png",
    "Coffe Mug.png",
    "Red Walkie-talkie.png",
    "Green Racket.png",
    "Alien Gun.png",
    "Golden Rail Gun.png",
    "Green Magic Wand.png",
    "Green Lightsaber.png",
    "Green Coffe Mug.png",
    "Walkie-talkie.png",
    "Green Walkie-talkie.png",
    "Green Rail Gun.png",
    "Alien Sword.png",
    "Beer Mug.png",
    "Red Alien Sword.png",
    "Golden Lightsaber.png",
    "Green Beer Mug.png",
    "Green Green Lightsaber.png",
    "Rail Gun.png",
    "Elder Staff.png",
    "Red Lightsaber.png",
    "Green Burger & Fork.png",
    "Burger & Fork.png",
    "Red Magic Wand.png",
    "Green Elder Staff.png",
    "Red Coffe Mug.png",
    "Magic Wand.png",
    "Red Elder Staff.png",
    "Blue Elder Staff.png",
    "Blue Magic Wand.png",
    "Golden Lighter.png",
    "Red Lighter.png",
    "Blue Lighter.png",
    "Green Lighter.png",
    "Lighter.png",
    "Butcher Knife.png",
    "Flash Drive.png",
    "Blue Flash Drive.png",
    "Red Red Lightsaber.png",
    "None.png",
  ],
}

const LAYER_ORDER = [
  { key: "Background", folder: "Background" },
  { key: "Back", folder: "Back" },
  { key: "Body", folder: "Body" },
  { key: "Head", folder: "Head" },
  { key: "Hat", folder: "Hat" },
  { key: "Hand", folder: "Hand" },
]
