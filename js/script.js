// ===============================
// GOOGLE SHEET CSV LINKS
// ===============================
const SHEET_URLS = {
  salonInfo:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRchPJ2xi5QOwGx3CE-cdjfQDPHSajCcfQhm58HQhzHQk-3uKjMTpcV53fNaaoNgl-_LQMq3lEj6FI8/pub?gid=0&single=true&output=csv",

  women:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRchPJ2xi5QOwGx3CE-cdjfQDPHSajCcfQhm58HQhzHQk-3uKjMTpcV53fNaaoNgl-_LQMq3lEj6FI8/pub?gid=354627380&single=true&output=csv",

  men:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRchPJ2xi5QOwGx3CE-cdjfQDPHSajCcfQhm58HQhzHQk-3uKjMTpcV53fNaaoNgl-_LQMq3lEj6FI8/pub?gid=433881596&single=true&output=csv",

  kids:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRchPJ2xi5QOwGx3CE-cdjfQDPHSajCcfQhm58HQhzHQk-3uKjMTpcV53fNaaoNgl-_LQMq3lEj6FI8/pub?gid=1162988976&single=true&output=csv",

  shadeChart:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRchPJ2xi5QOwGx3CE-cdjfQDPHSajCcfQhm58HQhzHQk-3uKjMTpcV53fNaaoNgl-_LQMq3lEj6FI8/pub?gid=278906803&single=true&output=csv"
};

// ===============================
// GLOBAL STORAGE
// ===============================
let allServices = {
  women: [],
  men: [],
  kids: []
};

// ===============================
// CSV PARSER
// ===============================
function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      row.push(current.trim());
      if (row.some(cell => cell !== "")) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some(cell => cell !== "")) rows.push(row);
  }

  return rows;
}

// ===============================
// FETCH CSV
// ===============================
async function fetchCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  return parseCSV(text);
}

// ===============================
// MOBILE MENU
// ===============================
function toggleMenu() {
  const navMenu = document.getElementById("navMenu");
  if (navMenu) navMenu.classList.toggle("open");
}

// ===============================
// SERVICES PAGE TAB SWITCH
// ===============================
function openTab(event, tabId) {
  const tabContents = document.querySelectorAll(".tab-content");
  const tabButtons = document.querySelectorAll(".tab-btn");

  tabContents.forEach(tab => tab.classList.remove("active-tab"));
  tabButtons.forEach(btn => btn.classList.remove("active"));

  const currentTab = document.getElementById(tabId);
  if (currentTab) currentTab.classList.add("active-tab");

  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  }

  // reset search when switching tabs
  const searchInput = document.getElementById("serviceSearch");
  if (searchInput) {
    searchInput.value = "";
  }

  renderServices("women", allServices.women);
  renderServices("men", allServices.men);
  renderServices("kids", allServices.kids);
}

// ===============================
// LOAD FOOTER / CONTACT INFO
// ===============================
async function loadSalonInfo() {
  try {
    const rows = await fetchCSV(SHEET_URLS.salonInfo);

    const info = {};
    rows.slice(1).forEach(row => {
      const key = row[0]?.trim().toLowerCase();
      const value = row[1]?.trim();
      if (key) info[key] = value;
    });

    const phoneEl = document.getElementById("footer-phone");
    const instaEl = document.getElementById("footer-instagram");
    const addressEl = document.getElementById("footer-address");
    const hoursEl = document.getElementById("footer-hours");

    if (phoneEl && info.phone) {
      phoneEl.innerHTML = `<strong>Phone:</strong> <a href="tel:${info.phone}">${info.phone}</a>`;
    }

    if (instaEl && info.instagram) {
      const instaHandle = info.instagram.startsWith("@")
        ? info.instagram.substring(1)
        : info.instagram;
      instaEl.innerHTML = `<strong>Instagram:</strong> <a href="https://instagram.com/${instaHandle}" target="_blank">${info.instagram}</a>`;
    }

    if (addressEl && info.address) {
      addressEl.innerHTML = `<strong>Address:</strong> ${info.address.replace(/\n/g, "<br>")}`;
    }

    if (hoursEl && info.hours) {
      hoursEl.innerHTML = `<strong>Hours:</strong> ${info.hours.replace(/\n/g, "<br>")}`;
    }

    // CONTACT PAGE
    const contactGrid = document.getElementById("contact-grid");
    if (contactGrid) {
      contactGrid.innerHTML = `
        ${info.phone ? `
          <div class="contact-card">
            <i class="fa-solid fa-phone"></i>
            <h3>Phone</h3>
            <p><a href="tel:${info.phone}">${info.phone}</a></p>
          </div>
        ` : ""}

        ${info.instagram ? `
          <div class="contact-card">
            <i class="fa-brands fa-instagram"></i>
            <h3>Instagram</h3>
            <p>
              <a href="https://instagram.com/${(info.instagram || "").replace("@", "")}" target="_blank">
                ${info.instagram}
              </a>
            </p>
          </div>
        ` : ""}

        ${info.address ? `
          <div class="contact-card">
            <i class="fa-solid fa-location-dot"></i>
            <h3>Address</h3>
            <p>${info.address.replace(/\n/g, "<br>")}</p>
          </div>
        ` : ""}

        ${info.hours ? `
          <div class="contact-card">
            <i class="fa-solid fa-clock"></i>
            <h3>Opening Hours</h3>
            <p>${info.hours.replace(/\n/g, "<br>")}</p>
          </div>
        ` : ""}

        ${info.maps ? `
          <div class="contact-card">
            <i class="fa-solid fa-map"></i>
            <h3>Find Us</h3>
            <p><a href="${info.maps}" target="_blank">Open in Google Maps</a></p>
          </div>
        ` : ""}
      `;
    }
  } catch (error) {
    console.error("Error loading salon info:", error);
  }
}

// ===============================
// SERVICES PAGE
// Expected CSV format:
// Category, Service Name, Price
// ===============================
async function loadServices() {
  const womenContainer = document.getElementById("women-content");
  const menContainer = document.getElementById("men-content");
  const kidsContainer = document.getElementById("kids-content");

  if (!womenContainer && !menContainer && !kidsContainer) return;

  try {
    const [womenRows, menRows, kidsRows] = await Promise.all([
      fetchCSV(SHEET_URLS.women),
      fetchCSV(SHEET_URLS.men),
      fetchCSV(SHEET_URLS.kids)
    ]);

    allServices.women = convertRowsToServices(womenRows);
    allServices.men = convertRowsToServices(menRows);
    allServices.kids = convertRowsToServices(kidsRows);

    renderServices("women", allServices.women);
    renderServices("men", allServices.men);
    renderServices("kids", allServices.kids);

    setupSearch();
  } catch (error) {
    console.error("Error loading services:", error);
  }
}

// Convert CSV rows to service objects
function convertRowsToServices(rows) {
  if (!rows || rows.length <= 1) return [];

  const services = [];

  rows.slice(1).forEach(row => {
    const category = row[0]?.trim();
    const name = row[1]?.trim();
    const price = row[2]?.trim();

    if (category && name && price) {
      services.push({ category, name, price });
    }
  });

  return services;
}

// Render services grouped by category as dropdown accordion
function renderServices(tabKey, services) {
  const container = document.getElementById(`${tabKey}-content`);
  if (!container) return;

  if (!services.length) {
    container.innerHTML = `<p class="no-services">No services found.</p>`;
    return;
  }

  const grouped = {};
  services.forEach(service => {
    if (!grouped[service.category]) grouped[service.category] = [];
    grouped[service.category].push(service);
  });

  let html = "";

  Object.keys(grouped).forEach((category, index) => {
    const sectionId = `${tabKey}-category-${index}`;

    html += `
      <div class="service-category">
        <button class="category-toggle ${index === 0 ? "active" : ""}" onclick="toggleCategory('${sectionId}')">
          <span>${category}</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>

        <div id="${sectionId}" class="category-services ${index === 0 ? "open" : ""}">
          <div class="service-grid">
            ${grouped[category].map(service => `
              <div class="price-card">
                <h3>${service.name}</h3>
                <span>₹${service.price}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Toggle category dropdown
function toggleCategory(categoryId) {
  const content = document.getElementById(categoryId);
  if (!content) return;

  const button = content.previousElementSibling;

  content.classList.toggle("open");
  if (button) button.classList.toggle("active");
}

// Search services
function setupSearch() {
  const searchInput = document.getElementById("serviceSearch");
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();

    ["women", "men", "kids"].forEach(tabKey => {
      if (!query) {
        renderServices(tabKey, allServices[tabKey]);
      } else {
        const filtered = allServices[tabKey].filter(service =>
          service.name.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.price.toLowerCase().includes(query)
        );
        renderServices(tabKey, filtered);
      }
    });
  });
}

// ===============================
// SHADE CHART PAGE
// Expected CSV format:
// Brand Name, Chart Link, Button Text, Active
// ===============================
async function loadShadeCharts() {
  const shadeContainer = document.getElementById("shade-chart-container");
  if (!shadeContainer) return;

  try {
    const rows = await fetchCSV(SHEET_URLS.shadeChart);

    if (!rows || rows.length <= 1) {
      shadeContainer.innerHTML = `<p class="shade-empty">No shade charts available right now.</p>`;
      return;
    }

    const charts = rows
      .slice(1)
      .map(row => ({
        brand: row[0]?.trim(),
        link: row[1]?.trim(),
        buttonText: row[2]?.trim() || "View Shade Chart",
        active: row[3]?.trim().toLowerCase()
      }))
      .filter(item =>
        item.brand &&
        item.link &&
        (item.active === "yes" || item.active === "true" || item.active === "1")
      );

    if (!charts.length) {
      shadeContainer.innerHTML = `<p class="shade-empty">No active shade charts available.</p>`;
      return;
    }

    shadeContainer.innerHTML = charts.map(chart => `
      <div class="shade-card">
        <div class="shade-card-icon">
          <i class="fa-solid fa-palette"></i>
        </div>
        <h3>${chart.brand}</h3>
        <a href="${chart.link}" target="_blank" class="shade-btn">
          ${chart.buttonText}
        </a>
      </div>
    `).join("");
  } catch (error) {
    console.error("Error loading shade charts:", error);
    shadeContainer.innerHTML = `<p class="shade-empty">Unable to load shade charts right now.</p>`;
  }
}

// ===============================
// INITIAL PAGE LOAD
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadSalonInfo();
  loadServices();
  loadShadeCharts();
});