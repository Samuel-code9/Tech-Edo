renderNavbar("login");

const form = document.getElementById("login-form");
const errorBox = document.getElementById("error-box");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.innerHTML = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Logging in...";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const { token } = await api.login({ email, password });
    await Auth.setSession(token, email.split("@")[0]);
    window.location.href = "/index.html";
  } catch (err) {
    errorBox.innerHTML = `<div class="form-error">${err.message}</div>`;
    submitBtn.disabled = false;
    submitBtn.textContent = "Log in";
  }
});
