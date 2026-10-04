renderNavbar("attractions");

const results = document.getElementById("results");
let activeCategory = new URLSearchParams(window.location.search).get("category") || "";
const initialState = new URLSearchParams(window.location.search).get("state") || "";

document.querySelectorAll(".pill").forEach((btn) => {
  if (btn.dataset.category === activeCategory) {
    document.querySelectorAll(".pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  }
});

function buildQuery() {
  const params = new URLSearchParams();
  if (initialState) params.set("state", initialState);
  if (activeCategory) params.set("category", activeCategory);
  const min = document.getElementById("f-min").value;
  const max = document.getElementById("f-max").value;
  if (min) params.set("minPrice", min);
  if (max) params.set("maxPrice", max);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function renderCard(a) {
  const img = a.image
    ? `<img src="${a.image}" class="card-image" alt="${a.name}" />`
    : `<div class="card-image-placeholder">No image</div>`;
  return `
    <a href="./attraction-detail.html?id=${a._id}" class="card">
      <div class="card-image-wrap">
        ${img}
        <span class="card-badge">${a.category}</span>
      </div>
      <div class="card-body">
        <div class="card-title-row"><h3>${a.name}</h3></div>
        <div class="card-meta">${a.location?.city || ""}, ${a.location?.state || ""}</div>
        <div class="card-price">${a.price ? `<strong>NGN ${a.price.toLocaleString()}</strong>` : "<strong>Free</strong>"}</div>
      </div>
    </a>
  `;
}

async function load() {
  results.innerHTML = `<div class="loading">Loading attractions...</div>`;
  try {
    const { attractions } = await api.getAttractions(buildQuery());
    if (!attractions.length) {
      results.innerHTML = `<div class="empty-state">No attractions match those filters.</div>`;
      return;
    }
    results.innerHTML = `<div class="grid">${attractions.map(renderCard).join("")}</div>`;
  } catch (err) {
    results.innerHTML = `<div class="form-error">${err.message}</div>`;
  }
}

document.querySelectorAll(".pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.category;
    load();
  });
});

document.getElementById("filter-btn").addEventListener("click", load);
load();
