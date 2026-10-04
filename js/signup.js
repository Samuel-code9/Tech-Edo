renderNavbar("signup");

const form = document.getElementById("signup-form");
const errorBox = document.getElementById("error-box");
const successBox = document.getElementById("success-box");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.innerHTML = "";
  successBox.innerHTML = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await api.signUp({ username, email, password });
    successBox.innerHTML = `<div class="form-success">Account created — taking you to login...</div>`;
    setTimeout(() => (window.location.href = "./login.html"), 1200);
  } catch (err) {
    errorBox.innerHTML = `<div class="form-error">${err.message}</div>`;
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign up";
  }
});
