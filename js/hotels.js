renderNavbar("hotels");

const results = document.getElementById("results");

function buildQuery() {
  const params = new URLSearchParams();
  const min = document.getElementById("f-min").value;
  const max = document.getElementById("f-max").value;
  const availability = document.getElementById("f-availability").value;
  if (min) params.set("minPrice", min);
  if (max) params.set("maxPrice", max);
  if (availability) params.set("availability", availability);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function renderCard(h) {
  const img = h.image
    ? `<img src="${h.image}" class="card-image" alt="${h.name}" />`
    : `<div class="card-image-placeholder">No image</div>`;
  return `
    <div class="card">
      <div class="card-image-wrap">
        ${img}
        ${!h.availability ? `<span class="card-badge">Fully booked</span>` : ""}
      </div>
      <div class="card-body">
        <div class="card-title-row"><h3>${h.name}</h3></div>
        <div class="card-meta">${h.rooms} rooms</div>
        <div class="card-price"><strong>NGN ${h.price.toLocaleString()}</strong> / night</div>
      </div>
    </div>
  `;
}

async function load() {
  results.innerHTML = `<div class="loading">Loading hotels...</div>`;
  try {
    const { hotels } = await api.getHotels(buildQuery());
    if (!hotels.length) {
      results.innerHTML = `<div class="empty-state">No hotels match those filters.</div>`;
      return;
    }
    results.innerHTML = `<div class="grid">${hotels.map(renderCard).join("")}</div>`;
  } catch (err) {
    results.innerHTML = `<div class="form-error">${err.message}</div>`;
  }
}

document.getElementById("filter-btn").addEventListener("click", load);
load();
