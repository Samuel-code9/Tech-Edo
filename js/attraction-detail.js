renderNavbar("attractions");

const id = new URLSearchParams(window.location.search).get("id");
const content = document.getElementById("content");
const reviewsList = document.getElementById("reviews-list");
const reviewFormWrap = document.getElementById("review-form-wrap");

if (!id) {
  content.innerHTML = `<div class="form-error">No attraction specified.</div>`;
} else {
  loadAttraction();
  loadReviews();
}

function buildMapEmbed(location) {
  if (!location) return "";
  const hasCoords = location.coordinates?.lat && location.coordinates?.lng;
  const query = hasCoords
    ? `${location.coordinates.lat},${location.coordinates.lng}`
    : encodeURIComponent(`${location.address || ""} ${location.city || ""} ${location.state || ""}`.trim());
  if (!query) return "";
  return `
    <div class="section-title">
      <h2 style="font-size:18px;">Location</h2>
      <iframe width="100%" height="320" style="border:0; border-radius:14px;" loading="lazy"
        src="https://www.google.com/maps?q=${query}&output=embed"></iframe>
    </div>
  `;
}

async function loadAttraction() {
  try {
    const { attraction: a } = await api.getAttraction(id);
    const img = a.image
      ? `<img src="${a.image}" class="detail-image" alt="${a.name}" />`
      : `<div class="detail-image-placeholder">No image</div>`;

    const canBook = Auth.isLoggedIn() && !Auth.isAdmin();

    content.innerHTML = `
      <div class="detail-header">
        <div>
          ${img}
          <div style="margin-top:24px;">
            <span class="badge">${a.category}</span>
            <h1 style="font-size:26px; margin-top:10px;">${a.name}</h1>
            <div class="card-meta">${a.location?.city || ""}, ${a.location?.state || ""}${a.location?.address ? " \u2014 " + a.location.address : ""}</div>
            ${a.openingHours ? `<div class="card-meta">Open: ${a.openingHours}</div>` : ""}
            <p style="margin-top:16px; color: var(--ink-soft);">${a.description}</p>
          </div>
          ${buildMapEmbed(a.location)}
        </div>

        <div class="booking-card">
          <div class="card-price">${a.price ? `<strong>NGN ${a.price.toLocaleString()}</strong> / guest` : "<strong>Free</strong>"}</div>
          ${
            canBook
              ? `
            <div id="booking-error"></div>
            <div id="booking-success"></div>
            <form id="booking-form">
              <div class="field">
                <label for="b-date">Date</label>
                <input id="b-date" type="date" required />
              </div>
              <div class="field">
                <label for="b-guests">Guests</label>
                <input id="b-guests" type="number" min="1" value="1" required />
              </div>
              <button type="submit" class="btn btn-primary btn-block">Book now</button>
            </form>
          `
              : Auth.isAdmin()
              ? `<p style="color:var(--ink-soft); font-size:14px;">Admin accounts can't make bookings.</p>`
              : `<a href="./login.html" class="btn btn-primary btn-block">Log in to book</a>`
          }
        </div>
      </div>
    `;

    if (canBook) {
      document.getElementById("booking-form").addEventListener("submit", (e) => submitBooking(e, a));
    }
  } catch (err) {
    content.innerHTML = `<div class="form-error">${err.message}</div>`;
  }
}

async function submitBooking(e, attraction) {
  e.preventDefault();
  const errorBox = document.getElementById("booking-error");
  const successBox = document.getElementById("booking-success");
  errorBox.innerHTML = "";
  successBox.innerHTML = "";

  const date = document.getElementById("b-date").value;
  const guests = Number(document.getElementById("b-guests").value);

  try {
    const { booking } = await api.createBooking({ attraction: attraction._id, date, guests });
    successBox.innerHTML = `<div class="form-success">Booked. Total: NGN ${booking.totalPrice.toLocaleString()}. <a href="./dashboard.html">Go to your bookings</a> to pay.</div>`;
  } catch (err) {
    errorBox.innerHTML = `<div class="form-error">${err.message}</div>`;
  }
}

async function loadReviews() {
  if (Auth.isLoggedIn()) {
    reviewFormWrap.innerHTML = `
      <form id="review-form" style="margin-bottom:24px; max-width:520px;">
        <div id="review-error"></div>
        <div class="field-row">
          <div class="field" style="flex:0 0 110px;">
            <label for="r-rating">Rating</label>
            <select id="r-rating">
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
          </div>
          <div class="field" style="flex:1;">
            <label for="r-comment">Comment</label>
            <input id="r-comment" type="text" required />
          </div>
        </div>
        <button type="submit" class="btn btn-secondary btn-sm">Add review</button>
      </form>
    `;
    document.getElementById("review-form").addEventListener("submit", submitReview);
  }

  try {
    const { reviews } = await api.getReviewsForAttraction(id);
    if (!reviews.length) {
      reviewsList.innerHTML = `<div class="empty-state">No reviews yet.</div>`;
      return;
    }
    reviewsList.innerHTML = reviews
      .map(
        (r) => `
        <div class="review-item">
          <div class="review-item-head">
            <span>${r.user?.username || "Anonymous"}</span>
            <span class="stars">${r.rating}/5</span>
          </div>
          <div>${r.comment}</div>
        </div>
      `
      )
      .join("");
  } catch (err) {
    reviewsList.innerHTML = `<div class="form-error">${err.message}</div>`;
  }
}

async function submitReview(e) {
  e.preventDefault();
  const errorBox = document.getElementById("review-error");
  errorBox.innerHTML = "";
  const rating = Number(document.getElementById("r-rating").value);
  const comment = document.getElementById("r-comment").value;

  try {
    await api.addReview({ attraction: id, rating, comment });
    loadReviews();
  } catch (err) {
    errorBox.innerHTML = `<div class="form-error">${err.message}</div>`;
  }
}
