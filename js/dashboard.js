Auth.requireLogin();
renderNavbar("dashboard");

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    document.getElementById("tab-bookings").style.display = tab === "bookings" ? "block" : "none";
    document.getElementById("tab-reviews").style.display = tab === "reviews" ? "block" : "none";
  });
});

function statusPill(status) {
  return `<span class="status-pill status-${status}">${status}</span>`;
}

async function loadBookings() {
  const el = document.getElementById("tab-bookings");
  try {
    const { bookings } = await api.getMyBookings();
    if (!bookings.length) {
      el.innerHTML = `<div class="empty-state">No bookings yet. <a href="./attractions.html">Browse attractions</a> to book one.</div>`;
      return;
    }
    el.innerHTML = bookings
      .map((b) => {
        const canPay = b.paymentStatus !== "paid" && b.status !== "cancelled";
        const canCancel = b.status === "pending";
        return `
          <div class="booking-item">
            <div class="review-item-head">
              <span>${b.attraction?.name || "Attraction"}</span>
              ${statusPill(b.status)}
            </div>
            <div class="card-meta">Date: ${new Date(b.date).toLocaleDateString()} &middot; Guests: ${b.guests}</div>
            <div class="card-meta">Total: NGN ${b.totalPrice.toLocaleString()} &middot; Payment: ${b.paymentStatus}</div>
            <div style="margin-top:10px; display:flex; gap:8px;">
              ${canPay ? `<button class="btn btn-primary btn-sm" data-pay="${b._id}">Pay now</button>` : ""}
              ${canCancel ? `<button class="btn btn-secondary btn-sm" data-cancel="${b._id}">Cancel</button>` : ""}
            </div>
          </div>
        `;
      })
      .join("");

    el.querySelectorAll("[data-pay]").forEach((btn) => btn.addEventListener("click", () => payForBooking(btn.dataset.pay)));
    el.querySelectorAll("[data-cancel]").forEach((btn) => btn.addEventListener("click", () => cancelBooking(btn.dataset.cancel)));
  } catch (err) {
    el.innerHTML = `<div class="form-error">${err.message}</div>`;
  }
}

async function payForBooking(bookingId) {
  try {
    const { authorizationUrl } = await api.initializePayment({ bookingId });
    window.location.href = authorizationUrl;
  } catch (err) {
    alert(err.message);
  }
}

async function cancelBooking(bookingId) {
  if (!confirm("Cancel this booking?")) return;
  try {
    await api.cancelBooking(bookingId);
    loadBookings();
  } catch (err) {
    alert(err.message);
  }
}

async function loadReviews() {
  const el = document.getElementById("tab-reviews");
  try {
    const { reviews } = await api.getMyReviews();
    if (!reviews.length) {
      el.innerHTML = `<div class="empty-state">You haven't written any reviews yet.</div>`;
      return;
    }
    el.innerHTML = reviews
      .map(
        (r) => `
        <div class="review-item">
          <div class="review-item-head">
            <span>${r.attraction?.name || "Attraction"}</span>
            <span class="stars">${r.rating}/5</span>
          </div>
          <div>${r.comment}</div>
          <div style="margin-top:8px;">
            <button class="btn btn-secondary btn-sm" data-delete="${r._id}">Delete</button>
          </div>
        </div>
      `
      )
      .join("");

    el.querySelectorAll("[data-delete]").forEach((btn) => btn.addEventListener("click", () => deleteReview(btn.dataset.delete)));
  } catch (err) {
    el.innerHTML = `<div class="form-error">${err.message}</div>`;
  }
}

async function deleteReview(reviewId) {
  if (!confirm("Delete this review?")) return;
  try {
    await api.deleteReview(reviewId);
    loadReviews();
  } catch (err) {
    alert(err.message);
  }
}

loadBookings();
loadReviews();
