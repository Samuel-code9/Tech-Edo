const Auth = {
  getToken() {
    return localStorage.getItem("touredo_token");
  },
  getUsername() {
    return localStorage.getItem("touredo_username");
  },
  isAdmin() {
    return localStorage.getItem("touredo_isAdmin") === "true";
  },
  isLoggedIn() {
    return !!this.getToken();
  },
  async setSession(token, username) {
    localStorage.setItem("touredo_token", token);
    localStorage.setItem("touredo_username", username);
    let admin = false;
    try {
      await api.getUsers();
      admin = true;
    } catch {
      admin = false;
    }
    localStorage.setItem("touredo_isAdmin", String(admin));
  },
  logout() {
    localStorage.removeItem("touredo_token");
    localStorage.removeItem("touredo_username");
    localStorage.removeItem("touredo_isAdmin");
    window.location.href = "/pages/login.html";
  },
  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = "/pages/login.html";
    }
  },
  requireAdmin() {
    if (!this.isLoggedIn() || !this.isAdmin()) {
      window.location.href = "/index.html";
    }
  },
};

function renderNavbar(activePage = "") {
  const el = document.getElementById("navbar");
  if (!el) return;

  const loggedIn = Auth.isLoggedIn();
  const isAdmin = Auth.isAdmin();
  const username = Auth.getUsername();
  const linkClass = (name) => (activePage === name ? "active" : "");

  el.innerHTML = `
    <div class="navbar-inner">
      <a href="/index.html" class="navbar-logo">touredo</a>

      <form class="search-pill" id="nav-search-form">
        <input type="text" id="nav-search-state" placeholder="Where — e.g. Edo" />
        <div class="divider"></div>
        <select id="nav-search-category">
          <option value="">Any category</option>
          <option value="nature">Nature</option>
          <option value="culture">Culture</option>
          <option value="history">History</option>
          <option value="adventure">Adventure</option>
          <option value="entertainment">Entertainment</option>
        </select>
        <button type="submit">Search</button>
      </form>

      <nav class="navbar-links">
        <a href="/pages/hotels.html" class="${linkClass("hotels")}">Hotels</a>
        <a href="/pages/events.html" class="${linkClass("events")}">Events</a>
        <a href="/pages/recommend.html" class="${linkClass("recommend")}">Plan my trip</a>
        ${
          loggedIn
            ? `
              ${isAdmin ? `<a href="/pages/admin.html" class="${linkClass("admin")}">Admin</a>` : ""}
              <a href="/pages/dashboard.html" class="${linkClass("dashboard")}">${username}</a>
              <button id="logout-btn">Log out</button>
            `
            : `
              <a href="/pages/login.html" class="${linkClass("login")}">Log in</a>
              <a href="/pages/signup.html" class="${linkClass("signup")}">Sign up</a>
            `
        }
      </nav>
    </div>
  `;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => Auth.logout());

  const searchForm = document.getElementById("nav-search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const state = document.getElementById("nav-search-state").value.trim();
      const category = document.getElementById("nav-search-category").value;
      const params = new URLSearchParams();
      if (state) params.set("state", state);
      if (category) params.set("category", category);
      const qs = params.toString();
      const inPagesFolder = window.location.pathname.includes("/pages/");
      const target = inPagesFolder ? "./attractions.html" : "pages/attractions.html";
      window.location.href = `${target}${qs ? "?" + qs : ""}`;
    });
  }
}
