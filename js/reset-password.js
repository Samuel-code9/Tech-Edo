renderNavbar("login");

// Backend CLIENT_URL should be: https://your-domain/pages/reset-password.html#
// so the emailed link lands here as .../reset-password.html#/<token>
function getTokenFromUrl() {
  const hash = window.location.hash;
  if (hash && hash.length > 2) {
    return hash.replace(/^#\/?/, "");
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get("token")) return params.get("token");
  return null;
}

const token = getTokenFromUrl();
const form = document.getElementById("reset-form");
const errorBox = document.getElementById("error-box");
const resultBox = document.getElementById("result-box");
const submitBtn = document.getElementById("submit-btn");

if (!token) {
  resultBox.innerHTML = `<div class="form-error">This reset link looks incomplete. Please request a new one.</div>`;
} else {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.innerHTML = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    const newPassword = document.getElementById("newPassword").value;

    try {
      await api.resetPassword(token, { newPassword });
      resultBox.innerHTML = `<div class="form-success">Password reset — taking you to login...</div>`;
      setTimeout(() => (window.location.href = "./login.html"), 1200);
    } catch (err) {
      errorBox.innerHTML = `<div class="form-error">${err.message}</div>`;
      submitBtn.disabled = false;
      submitBtn.textContent = "Reset password";
    }
  });
}
