// nft-ui.js
let nft10k = [],
  filtered = [],
  currentPage = 0,
  pageSize = 50

async function renderNFT(traits) {
  const stack = document.createElement("div")
  stack.className = "nft-stack"
  for (const layer of LAYER_ORDER) {
    const file = traits[layer.key]
    if (!file) continue
    const img = await new Promise((res) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = () => res(null)
      i.src =
        layer.key === "Background"
          ? `../../../alkanes-image/src/traits/${
              layer.folder
            }/${encodeURIComponent(file)}`
          : `traits/${layer.folder}/${encodeURIComponent(file)}`
    })
    if (img) stack.appendChild(img)
  }
  return stack
}

function renderPage(arr, page) {
  const area = document.getElementById("previewArea")
  area.innerHTML = ""
  ;(async () => {
    const start = page * pageSize
    for (let i = 0; i < Math.min(pageSize, arr.length - start); i++) {
      const wrap = document.createElement("div")
      wrap.className = "nft-preview"
      wrap.appendChild(await renderNFT(arr[start + i]))
      wrap.innerHTML += `<span class="nft-index">#${start + i}</span>`
      area.appendChild(wrap)
    }
  })()
}

function updatePaging(total, page) {
  const pg = document.getElementById("paging")
  pg.innerHTML = ""
  const pages = Math.ceil(total / pageSize)
  pg.style.display = pages > 1 ? "block" : "none"
  for (let p = 0; p < pages; p++) {
    const b = document.createElement("button")
    b.textContent = p + 1
    if (p === page) b.style.background = "#666"
    b.onclick = () => {
      currentPage = p
      renderPage(filtered, p)
      updatePaging(filtered.length, p)
      updateStats(filtered)
    }
    pg.appendChild(b)
  }
}

function updateStats(arr) {
  const sd = document.getElementById("stats")
  sd.style.display = "block"
  let html = `<strong>Total:</strong> ${arr.length}`
  const layer = document.getElementById("filterLayer").value
  if (layer) {
    const cnt = {}
    arr.forEach((o) => (cnt[o[layer]] = (cnt[o[layer]] || 0) + 1))
    html +=
      `<br><strong>${layer} Distribution:</strong><br>` +
      Object.entries(cnt)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")
  }
  sd.innerHTML = html
}

function updateMetadata() {
  const format = {
    Back: { shift: 0, mask: "0xf", bits: 4 },
    Body: { shift: 4, mask: "0x3f", bits: 6 },
    Hand: { shift: 10, mask: "0x1f", bits: 5 },
    Hat: { shift: 15, mask: "0x1f", bits: 5 },
    Head: { shift: 20, mask: "0x3f", bits: 6 },
    Background: { shift: 26, mask: "0xf", bits: 4 },
  }
  const indices = {}
  Object.keys(format).forEach((layer) => {
    indices[layer] = traitFiles[layer].map((f) => f.replace(/\.png$/i, ""))
  })
  const items = nft10k.map((traits) => {
    let code = 0
    Object.entries(format).forEach(([layer, { shift, bits }]) => {
      const name = (traits[layer] || "").replace(/\.png$/i, "")
      const idx = indices[layer].indexOf(name)
      code |= (idx & ((1 << bits) - 1)) << shift
    })
    return code >>> 0
  })
  document.getElementById("metadata").textContent = JSON.stringify(
    { format, indices, items },
    null,
    2
  )
}

document.getElementById("generate10k").onclick = () => {
  nft10k = generateNFTs(10000)
  filtered = nft10k
  currentPage = 0
  document.getElementById("controls").style.display = "block"
  renderPage(filtered, 0)
  updatePaging(filtered.length, 0)
  updateStats(filtered)
  updateMetadata()
}

document.getElementById("filterLayer").onchange = function () {
  const sel = document.getElementById("filterTrait")
  sel.style.display = this.value ? "inline-block" : "none"
  sel.innerHTML = ""
  if (this.value) {
    traitFiles[this.value].forEach((t) => {
      const o = document.createElement("option")
      o.value = o.textContent = t
      sel.appendChild(o)
    })
  }
  document.getElementById("clearFilter").style.display = "none"
}

document.getElementById("filterTrait").onchange = function () {
  const layer = document.getElementById("filterLayer").value
  filtered = nft10k.filter((o) => o[layer] === this.value)
  currentPage = 0
  renderPage(filtered, 0)
  updatePaging(filtered.length, 0)
  updateStats(filtered)
  document.getElementById("clearFilter").style.display = "inline-block"
}

document.getElementById("clearFilter").onclick = function () {
  filtered = nft10k
  currentPage = 0
  renderPage(filtered, 0)
  updatePaging(filtered.length, 0)
  updateStats(filtered)
  this.style.display = "none"
  document.getElementById("filterTrait").style.display = "none"
  document.getElementById("filterLayer").value = ""
}
