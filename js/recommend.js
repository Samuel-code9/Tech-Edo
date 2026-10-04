renderNavbar("recommend");

const form = document.getElementById("recommend-form");
const errorBox = document.getElementById("error-box");
const result = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.innerHTML = "";
  result.innerHTML = `<div class="loading">Finding matches...</div>`;

  const budget = Number(document.getElementById("budget").value);
  const days = Number(document.getElementById("days").value);
  const interest = document.getElementById("interest").value;

  try {
    const data = await api.getRecommendations({ budget, days, interest });
    render(data);
  } catch (err) {
    result.innerHTML = "";
    errorBox.innerHTML = `<div class="form-error">${err.message}</div>`;
  }
});

function render(data) {
  const { suggestions, estimatedBudget, msg } = data;

  if (!suggestions.attractions.length && !suggestions.hotels.length) {
    result.innerHTML = `<div class="empty-state">${msg}</div>`;
    return;
  }

  const attractionCards = suggestions.attractions
    .map((a) => {
      const img = a.image
        ? `<img src="${a.image}" class="card-image" alt="${a.name}" />`
        : `<div class="card-image-placeholder">No image</div>`;
      return `
      <a href="./attraction-detail.html?id=${a._id}" class="card">
        <div class="card-image-wrap">${img}</div>
        <div class="card-body">
          <div class="card-title-row"><h3>${a.name}</h3></div>
          <div class="card-price">${a.price ? `<strong>NGN ${a.price.toLocaleString()}</strong>` : "<strong>Free</strong>"}</div>
        </div>
      </a>
    `;
    })
    .join("");

  const hotelCards = suggestions.hotels
    .map((h) => {
      const img = h.image
        ? `<img src="${h.image}" class="card-image" alt="${h.name}" />`
        : `<div class="card-image-placeholder">No image</div>`;
      return `
      <div class="card">
        <div class="card-image-wrap">${img}</div>
        <div class="card-body">
          <div class="card-title-row"><h3>${h.name}</h3></div>
          <div class="card-price"><strong>NGN ${h.price.toLocaleString()}</strong> / night</div>
        </div>
      </div>
    `;
    })
    .join("");

  result.innerHTML = `
    <div class="recommend-result">
      <h3 style="font-size:16px;">Estimated budget</h3>
      <div class="budget-line"><span>Hotel</span><span>NGN ${estimatedBudget.estimatedHotelCost.toLocaleString()}</span></div>
      <div class="budget-line"><span>Attractions</span><span>NGN ${estimatedBudget.estimatedAttractionsCost.toLocaleString()}</span></div>
      <div class="budget-line"><span>Total</span><span>NGN ${estimatedBudget.estimatedTotal.toLocaleString()}</span></div>
      <p style="margin-top:12px; margin-bottom:0; font-weight:600; color: ${estimatedBudget.withinBudget ? "var(--success)" : "var(--error)"};">
        ${estimatedBudget.withinBudget ? "Within your budget" : "Over your budget"}
      </p>
    </div>
    ${suggestions.hotels.length ? `<h3 class="section-title" style="font-size:18px;">Suggested hotel</h3><div class="grid">${hotelCards}</div>` : ""}
    ${suggestions.attractions.length ? `<h3 class="section-title" style="font-size:18px;">Suggested attractions</h3><div class="grid">${attractionCards}</div>` : ""}
  `;
}
