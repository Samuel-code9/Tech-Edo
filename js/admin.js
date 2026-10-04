Auth.requireAdmin();
renderNavbar("admin");

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    ["attractions", "hotels", "events", "users"].forEach((t) => {
      document.getElementById(`tab-${t}`).style.display = t === btn.dataset.tab ? "block" : "none";
    });
  });
});

const modalRoot = document.getElementById("modal-root");
function closeModal() { modalRoot.innerHTML = ""; }
function openModal(html) {
  modalRoot.innerHTML = `<div class="modal-overlay" id="modal-overlay"><div class="modal">${html}</div></div>`;
  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") closeModal();
  });
}

function imageModal(type, id, onDone) {
  openModal(`
    <h2 style="font-size:18px;">Upload image</h2>
    <div id="modal-error"></div>
    <form id="image-form">
      <div class="field"><label>Image file</label><input id="m-image" type="file" accept="image/*" required /></div>
      <button type="submit" class="btn btn-primary btn-block">Upload</button>
    </form>
  `);
  document.getElementById("image-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("modal-error");
    const file = document.getElementById("m-image").files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      if (type === "attraction") await api.uploadAttractionImage(id, formData);
      else await api.uploadHotelImage(id, formData);
      closeModal();
      onDone();
    } catch (err) {
      errorBox.innerHTML = `<div class="form-error">${err.message}</div>`;
    }
  });
}

// ---------- Attractions ----------
async function loadAttractions() {
  const el = document.getElementById("tab-attractions");
  el.innerHTML = `<div class="loading">Loading...</div>`;
  try {
    const { attractions } = await api.getAttractions();
    el.innerHTML = `
      <button class="btn btn-primary" id="add-attraction" style="margin-bottom:16px;">Add attraction</button>
      <table>
        <thead><tr><th>Name</th><th>Category</th><th>Price</th><th></th></tr></thead>
        <tbody>
          ${attractions.map((a) => `
            <tr>
              <td>${a.name}</td><td>${a.category}</td>
              <td>${a.price ? "NGN " + a.price.toLocaleString() : "Free"}</td>
              <td>
                <button class="btn btn-secondary btn-sm" data-edit="${a._id}">Edit</button>
                <button class="btn btn-secondary btn-sm" data-image="${a._id}">Image</button>
                <button class="btn btn-danger btn-sm" data-delete="${a._id}">Delete</button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    `;
    document.getElementById("add-attraction").addEventListener("click", () => attractionModal());
    el.querySelectorAll("[data-edit]").forEach((btn) => {
      const a = attractions.find((x) => x._id === btn.dataset.edit);
      btn.addEventListener("click", () => attractionModal(a));
    });
    el.querySelectorAll("[data-image]").forEach((btn) => btn.addEventListener("click", () => imageModal("attraction", btn.dataset.image, loadAttractions)));
    el.querySelectorAll("[data-delete]").forEach((btn) => btn.addEventListener("click", () => deleteAttraction(btn.dataset.delete)));
  } catch (err) {
    el.innerHTML = `<div class="form-error">${err.message}</div>`;
  }
}

function attractionModal(a = null) {
  const isEdit = !!a;
  openModal(`
    <h2 style="font-size:18px;">${isEdit ? "Edit" : "Add"} attraction</h2>
    <div id="modal-error"></div>
    <form id="attraction-form">
      <div class="field"><label>Name</label><input id="m-name" value="${a?.name || ""}" required /></div>
      <div class="field"><label>Description</label><textarea id="m-description" required>${a?.description || ""}</textarea></div>
      <div class="field"><label>Category</label>
        <select id="m-category">
          ${["nature", "culture", "history", "adventure", "entertainment"].map((c) => `<option value="${c}" ${a?.category === c ? "selected" : ""}>${c}</option>`).join("")}
        </select>
      </div>
      <div class="field-row">
        <div class="field"><label>State</label><input id="m-state" value="${a?.location?.state || ""}" required /></div>
        <div class="field"><label>City</label><input id="m-city" value="${a?.location?.city || ""}" required /></div>
      </div>
      <div class="field"><label>Address (optional)</label><input id="m-address" value="${a?.location?.address || ""}" /></div>
      <div class="field-row">
        <div class="field"><label>Latitude (optional)</label><input id="m-lat" type="number" step="any" value="${a?.location?.coordinates?.lat ?? ""}" /></div>
        <div class="field"><label>Longitude (optional)</label><input id="m-lng" type="number" step="any" value="${a?.location?.coordinates?.lng ?? ""}" /></div>
      </div>
      <div class="field"><label>Price</label><input id="m-price" type="number" min="0" value="${a?.price || 0}" /></div>
      <div class="field"><label>Opening hours</label><input id="m-hours" value="${a?.openingHours || ""}" /></div>
      <button type="submit" class="btn btn-primary btn-block">${isEdit ? "Save changes" : "Create"}</button>
    </form>
  `);

  document.getElementById("attraction-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("modal-error");
    const lat = document.getElementById("m-lat").value;
    const lng = document.getElementById("m-lng").value;
    const payload = {
      name: document.getElementById("m-name").value,
      description: document.getElementById("m-description").value,
      category: document.getElementById("m-category").value,
      location: {
        state: document.getElementById("m-state").value,
        city: document.getElementById("m-city").value,
        address: document.getElementById("m-address").value,
        coordinates: { lat: lat ? Number(lat) : null, lng: lng ? Number(lng) : null },
      },
      price: Number(document.getElementById("m-price").value) || 0,
      openingHours: document.getElementById("m-hours").value,
    };
    try {
      if (isEdit) await api.updateAttraction(a._id, payload);
      else await api.createAttraction(payload);
      closeModal();
      loadAttractions();
    } catch (err) {
      errorBox.innerHTML = `<div class="form-error">${err.message}</div>`;
    }
  });
}

async function deleteAttraction(id) {
  if (!confirm("Delete this attraction?")) return;
  try {
    await api.deleteAttraction(id);
    loadAttractions();
  } catch (err) {
    alert(err.message);
  }
}

// ---------- Hotels ----------
async function loadHotels() {
  const el = document.getElementById("tab-hotels");
  el.innerHTML = `<div class="loading">Loading...</div>`;
  try {
    const { hotels } = await api.getHotels();
    el.innerHTML = `
      <button class="btn btn-primary" id="add-hotel" style="margin-bottom:16px;">Add hotel</button>
      <table>
        <thead><tr><th>Name</th><th>Price/night</th><th>Rooms</th><th>Available</th><th></th></tr></thead>
        <tbody>
          ${hotels.map((h) => `
            <tr>
              <td>${h.name}</td><td>NGN ${h.price.toLocaleString()}</td><td>${h.rooms}</td>
              <td>${h.availability ? "Yes" : "No"}</td>
              <td>
                <button class="btn btn-secondary btn-sm" data-edit="${h._id}">Edit</button>
                <button class="btn btn-secondary btn-sm" data-image="${h._id}">Image</button>
                <button class="btn btn-danger btn-sm" data-delete="${h._id}">Delete</button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    `;
    document.getElementById("add-hotel").addEventListener("click", () => hotelModal());
    el.querySelectorAll("[data-edit]").forEach((btn) => {
      const h = hotels.find((x) => x._id === btn.dataset.edit);
      btn.addEventListener("click", () => hotelModal(h));
    });
    el.querySelectorAll("[data-image]").forEach((btn) => btn.addEventListener("click", () => imageModal("hotel", btn.dataset.image, loadHotels)));
    el.querySelectorAll("[data-delete]").forEach((btn) => btn.addEventListener("click", () => deleteHotel(btn.dataset.delete)));
  } catch (err) {
    el.innerHTML = `<div class="form-error">${err.message}</div>`;
  }
}

function hotelModal(h = null) {
  const isEdit = !!h;
  openModal(`
    <h2 style="font-size:18px;">${isEdit ? "Edit" : "Add"} hotel</h2>
    <div id="modal-error"></div>
    <form id="hotel-form">
      <div class="field"><label>Name</label><input id="m-name" value="${h?.name || ""}" required /></div>
      <div class="field-row">
        <div class="field"><label>Price/night</label><input id="m-price" type="number" min="0" value="${h?.price || ""}" required /></div>
        <div class="field"><label>Rooms</label><input id="m-rooms" type="number" min="0" value="${h?.rooms || ""}" required /></div>
      </div>
      <div class="field">
        <label>Available</label>
        <select id="m-availability">
          <option value="true" ${h?.availability !== false ? "selected" : ""}>Yes</option>
          <option value="false" ${h?.availability === false ? "selected" : ""}>No</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary btn-block">${isEdit ? "Save changes" : "Create"}</button>
    </form>
  `);

  document.getElementById("hotel-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("modal-error");
    const payload = {
      name: document.getElementById("m-name").value,
      price: Number(document.getElementById("m-price").value),
      rooms: Number(document.getElementById("m-rooms").value),
      availability: document.getElementById("m-availability").value === "true",
    };
    try {
      if (isEdit) await api.updateHotel(h._id, payload);
      else await api.createHotel(payload);
      closeModal();
      loadHotels();
    } catch (err) {
      errorBox.innerHTML = `<div class="form-error">${err.message}</div>`;
    }
  });
}

async function deleteHotel(id) {
  if (!confirm("Delete this hotel?")) return;
  try {
    await api.deleteHotel(id);
    loadHotels();
  } catch (err) {
    alert(err.message);
  }
}

// ---------- Events ----------
async function loadEvents() {
  const el = document.getElementById("tab-events");
  el.innerHTML = `<div class="loading">Loading...</div>`;
  try {
    const { events } = await api.getEvents();
    el.innerHTML = `
      <button class="btn btn-primary" id="add-event" style="margin-bottom:16px;">Add event</button>
      <table>
        <thead><tr><th>Title</th><th>Category</th><th>Dates</th><th></th></tr></thead>
        <tbody>
          ${events.map((ev) => `
            <tr>
              <td>${ev.title}</td><td>${ev.category}</td>
              <td>${new Date(ev.startDate).toLocaleDateString()} - ${new Date(ev.endDate).toLocaleDateString()}</td>
              <td>
                <button class="btn btn-secondary btn-sm" data-edit="${ev._id}">Edit</button>
                <button class="btn btn-danger btn-sm" data-delete="${ev._id}">Delete</button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    `;
    document.getElementById("add-event").addEventListener("click", () => eventModal());
    el.querySelectorAll("[data-edit]").forEach((btn) => {
      const ev = events.find((x) => x._id === btn.dataset.edit);
      btn.addEventListener("click", () => eventModal(ev));
    });
    el.querySelectorAll("[data-delete]").forEach((btn) => btn.addEventListener("click", () => deleteEvent(btn.dataset.delete)));
  } catch (err) {
    el.innerHTML = `<div class="form-error">${err.message}</div>`;
  }
}

function toDateInput(d) { return d ? new Date(d).toISOString().slice(0, 10) : ""; }

function eventModal(ev = null) {
  const isEdit = !!ev;
  openModal(`
    <h2 style="font-size:18px;">${isEdit ? "Edit" : "Add"} event</h2>
    <div id="modal-error"></div>
    <form id="event-form">
      <div class="field"><label>Title</label><input id="m-title" value="${ev?.title || ""}" required /></div>
      <div class="field"><label>Description</label><textarea id="m-description" required>${ev?.description || ""}</textarea></div>
      <div class="field"><label>Category</label>
        <select id="m-category">
          ${["festival", "cultural", "concert", "sports", "other"].map((c) => `<option value="${c}" ${ev?.category === c ? "selected" : ""}>${c}</option>`).join("")}
        </select>
      </div>
      <div class="field-row">
        <div class="field"><label>State</label><input id="m-state" value="${ev?.location?.state || ""}" required /></div>
        <div class="field"><label>City</label><input id="m-city" value="${ev?.location?.city || ""}" required /></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Start date</label><input id="m-start" type="date" value="${toDateInput(ev?.startDate)}" required /></div>
        <div class="field"><label>End date</label><input id="m-end" type="date" value="${toDateInput(ev?.endDate)}" required /></div>
      </div>
      <div class="field"><label>Price</label><input id="m-price" type="number" min="0" value="${ev?.price || 0}" /></div>
      <button type="submit" class="btn btn-primary btn-block">${isEdit ? "Save changes" : "Create"}</button>
    </form>
  `);

  document.getElementById("event-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("modal-error");
    const payload = {
      title: document.getElementById("m-title").value,
      description: document.getElementById("m-description").value,
      category: document.getElementById("m-category").value,
      location: { state: document.getElementById("m-state").value, city: document.getElementById("m-city").value },
      startDate: document.getElementById("m-start").value,
      endDate: document.getElementById("m-end").value,
      price: Number(document.getElementById("m-price").value) || 0,
    };
    try {
      if (isEdit) await api.updateEvent(ev._id, payload);
      else await api.createEvent(payload);
      closeModal();
      loadEvents();
    } catch (err) {
      errorBox.innerHTML = `<div class="form-error">${err.message}</div>`;
    }
  });
}

async function deleteEvent(id) {
  if (!confirm("Delete this event?")) return;
  try {
    await api.deleteEvent(id);
    loadEvents();
  } catch (err) {
    alert(err.message);
  }
}

// ---------- Users ----------
async function loadUsers() {
  const el = document.getElementById("tab-users");
  el.innerHTML = `<div class="loading">Loading...</div>`;
  try {
    const { users } = await api.getUsers();
    el.innerHTML = `
      <table>
        <thead><tr><th>Username</th><th>Email</th><th>Role</th><th></th></tr></thead>
        <tbody>
          ${users.map((u) => `
            <tr>
              <td>${u.username}</td><td>${u.email}</td><td>${u.role}</td>
              <td>
                <button class="btn btn-secondary btn-sm" data-toggle="${u._id}" data-role="${u.role}">${u.role === "admin" ? "Demote to user" : "Promote to admin"}</button>
                <button class="btn btn-danger btn-sm" data-delete="${u._id}">Delete</button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    `;
    el.querySelectorAll("[data-toggle]").forEach((btn) => btn.addEventListener("click", () => toggleRole(btn.dataset.toggle, btn.dataset.role)));
    el.querySelectorAll("[data-delete]").forEach((btn) => btn.addEventListener("click", () => deleteUser(btn.dataset.delete)));
  } catch (err) {
    el.innerHTML = `<div class="form-error">${err.message}</div>`;
  }
}

async function toggleRole(id, currentRole) {
  const newRole = currentRole === "admin" ? "user" : "admin";
  try {
    await api.updateUserRole(id, { role: newRole });
    loadUsers();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteUser(id) {
  if (!confirm("Delete this user?")) return;
  try {
    await api.deleteUser(id);
    loadUsers();
  } catch (err) {
    alert(err.message);
  }
}

loadAttractions();
loadHotels();
loadEvents();
loadUsers();
