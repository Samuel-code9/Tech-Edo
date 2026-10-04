renderNavbar("home");

const results = document.getElementById("results");
let activeCategory = "";

function renderCard(a) {
  const img = a.image
    ? `<img src="${a.image}" class="card-image" alt="${a.name}" />`
    : `<div class="card-image-placeholder">No image</div>`;
  return `
    <a href="pages/attraction-detail.html?id=${a._id}" class="card">
      <div class="card-image-wrap">
        ${img}
        <span class="card-badge">${a.category}</span>
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <h3>${a.name}</h3>
        </div>
        <div class="card-meta">${a.location?.city || ""}, ${a.location?.state || ""}</div>
        <div class="card-price">${a.price ? `<strong>NGN ${a.price.toLocaleString()}</strong>` : "<strong>Free</strong>"}</div>
      </div>
    </a>
  `;
}

async function load() {
  results.innerHTML = `<div class="loading">Loading attractions...</div>`;
  try {
    const qs = activeCategory ? `?category=${activeCategory}` : "";
    const { attractions } = await api.getAttractions(qs);
    if (!attractions.length) {
      results.innerHTML = `<div class="empty-state">No attractions found. Try a different category.</div>`;
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

load();
