renderNavbar("events");

const results = document.getElementById("results");

function buildQuery() {
  const params = new URLSearchParams();
  const state = document.getElementById("f-state").value.trim();
  const category = document.getElementById("f-category").value;
  const upcoming = document.getElementById("f-upcoming").value;
  if (state) params.set("state", state);
  if (category) params.set("category", category);
  if (upcoming) params.set("upcoming", upcoming);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function renderCard(e) {
  return `
    <div class="card">
      <div class="card-image-wrap">
        <div class="card-image-placeholder">${e.category}</div>
      </div>
      <div class="card-body">
        <div class="card-title-row"><h3>${e.title}</h3></div>
        <div class="card-meta">${e.location?.city || ""}, ${e.location?.state || ""}</div>
        <div class="card-meta">${formatDate(e.startDate)} \u2014 ${formatDate(e.endDate)}</div>
        <div class="card-price">${e.price ? `<strong>NGN ${e.price.toLocaleString()}</strong>` : "<strong>Free</strong>"}</div>
      </div>
    </div>
  `;
}

async function load() {
  results.innerHTML = `<div class="loading">Loading events...</div>`;
  try {
    const { events } = await api.getEvents(buildQuery());
    if (!events.length) {
      results.innerHTML = `<div class="empty-state">No events match those filters.</div>`;
      return;
    }
    results.innerHTML = `<div class="grid">${events.map(renderCard).join("")}</div>`;
  } catch (err) {
    results.innerHTML = `<div class="form-error">${err.message}</div>`;
  }
}

document.getElementById("filter-btn").addEventListener("click", load);
load();
