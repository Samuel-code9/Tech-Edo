renderNavbar("login");

const form = document.getElementById("forgot-form");
const errorBox = document.getElementById("error-box");
const resultBox = document.getElementById("result-box");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.innerHTML = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  const email = document.getElementById("email").value;

  try {
    await api.forgotPassword({ email });
    resultBox.innerHTML = `<div class="form-success">If an account with that email exists, a reset link is on its way. Check your inbox.</div>`;
  } catch (err) {
    errorBox.innerHTML = `<div class="form-error">${err.message}</div>`;
    submitBtn.disabled = false;
    submitBtn.textContent = "Send reset link";
  }
});
