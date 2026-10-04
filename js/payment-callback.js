renderNavbar("dashboard");

const params = new URLSearchParams(window.location.search);
const reference = params.get("reference") || params.get("trxref");
const content = document.getElementById("content");

if (!reference) {
  content.innerHTML = `<div class="form-error">No payment reference found in the URL.</div>`;
} else {
  verify();
}

async function verify() {
  try {
    const { booking } = await api.verifyPayment(reference);
    content.innerHTML = `<div class="form-success">Payment verified. Your booking is now ${booking.status}.</div>`;
  } catch (err) {
    content.innerHTML = `<div class="form-error">${err.message}</div>`;
  }
}
