// Toggle menu
function toggleMenu(event) {
  event.stopPropagation();
  var menu = document.getElementById("menuDropdown");
  var overlay = document.getElementById("overlay");
  const button = event.target;

  menu.classList.toggle("show");
  overlay.classList.toggle("show");
  button.classList.toggle("rotated");
  button.textContent = button.textContent === '☰' ? '✕' : '☰';
}

// Close Dropdown Menu
function closeMenu() {
  var menu = document.getElementById("menuDropdown");
  var overlay = document.getElementById("overlay");
  var menuButton = document.querySelector(".menu-button");

  if (menu.classList.contains("show")) {
    menu.classList.remove("show");
    overlay.classList.remove("show");
    menuButton.classList.remove("rotated");
    menuButton.textContent = '☰';
  }
}

// Scroll To Top Button
window.onscroll = function () {
  const btn = document.getElementById("goTopBtn");
  btn.style.display = (document.documentElement.scrollTop > 100) ? "block" : "none";
};

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Change Product Image
function changeImage(index, newSrc) {
  document.getElementById(`mainImage${index}`).src = newSrc;
}

// About Section Toggle
function showAbout(event) {
  document.getElementById('about-section').style.display = 'block';
  event.preventDefault();
}

function hideAbout() {
  document.getElementById('about-section').style.display = 'none';
}

// Authentication Form Toggle
window.showAuthForm = function () {
  document.getElementById("upload-form").classList.add("hidden");
  document.getElementById("auth-form").classList.remove("hidden");
};

window.closeAuthForm = function () {
  document.getElementById("auth-form").classList.add("hidden");
};

// Authentication Logic
window.authenticate = function () {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (username === password && userMap[username]) {
    currentCollection = userMap[username];
    document.getElementById("auth-form").classList.add("hidden");
    document.getElementById("upload-form").classList.remove("hidden");
  } else {
    alert("Invalid credentials");
  }
};

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfDB2Ca3Sb1mHuPN50i4nRzHFL_dgzpRA",
  authDomain: "message-792de.firebaseapp.com",
  projectId: "message-792de",
  storageBucket: "message-792de.appspot.com",
  messagingSenderId: "346450288358",
  appId: "1:346450288358:web:101992db1ca1de3af3e527",
  measurementId: "G-W7Q8K6B202"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
let products = [];
let currentCollection = "";

// Map of User Credentials
const userMap = {
  "1234": "products",
  "123456": "product2"
};

// Shuffle Helper
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Priority Product Sort
function applyPriorityAndRandomOrder(allProducts) {
  const prioritized = [];
  const remaining = [];
  allProducts.forEach(p => {
    if ((p.name && p.name.toLowerCase().includes("premium")) ||
        (p.link && p.link.toLowerCase().includes("top"))) {
      prioritized.push(p);
    } else {
      remaining.push(p);
    }
  });
  return [...prioritized, ...shuffle(remaining)];
}

// Render Products
function renderProducts(container, productList) {
  container.innerHTML = "";
  productList.forEach((product, index) => {
    const encodedMsg = encodeURIComponent(`Hi! I'm interested in "${product.name}" priced at ₹${product.price}, id = ${product.link}.`);
    const targetURL = `https://onlinech0t.blogspot.com/?m=0&message=${encodedMsg}`;
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.position = "relative";
    card.innerHTML = `
      <img id="mainImage${index}" class="product-img" src="${product.images[0]}" alt="${product.name}" onclick="zoomImage(this.src)">
      <h2>${product.name}</h2>
      <p class="price">₹${product.price.toFixed(2)}</p>
      <div class="thumbnail-container">
        ${product.images.map(img => `<img class="thumbnail" src="${img}" onclick="changeImage(${index}, '${img}')">`).join("")}
      </div>
      <a href="${targetURL}" class="shop-now-btn" target="_blank">Shop Now</a>
      <div class="watermark">${product.link}</div>
    `;
    container.appendChild(card);
  });
}

// Load Products from Firestore
function loadProducts() {
  const allCollections = Object.values(userMap);
  const fetches = allCollections.map(col =>
    db.collection(col).get().then(snap => snap.docs.map(doc => doc.data()))
  );
  Promise.all(fetches).then(results => {
    products = applyPriorityAndRandomOrder(results.flat());
    renderProducts(document.getElementById("productGrid"), products);
  });
}

// Upload Product
window.uploadProduct = async function () {
  const name = document.getElementById("name").value;
  const price = parseFloat(document.getElementById("price").value);
  const images = [
    document.getElementById("image1").value,
    document.getElementById("image2").value,
    document.getElementById("image3").value
  ];
  let link = document.getElementById("link").value;
  if (!name || !price || !link || images.some(img => img === "")) {
    alert("Please fill all fields.");
    return;
  }

  let finalLink = link;
  let exists = true;
  let attempts = 0;

  while (exists) {
    const querySnapshot = await db.collection(currentCollection).where("link", "==", finalLink).get();
    if (querySnapshot.empty) {
      exists = false;
    } else {
      attempts += 1;
      finalLink = link + (0.001 * attempts).toFixed(3);
    }
  }

  db.collection(currentCollection).add({ name, price, images, link: finalLink })
    .then(() => {
      alert("Product uploaded successfully!");
      location.reload();
    })
    .catch(err => {
      console.error("Upload failed:", err);
      alert("Upload failed.");
    });
};

// Load Products on Page Load
loadProducts();

// Debounce Function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Search Functionality
document.getElementById("search-input").addEventListener("input", debounce(function () {
  const query = document.getElementById("search-input").value.trim().toLowerCase();
  const productGrid = document.getElementById("productGrid");
  const otherGrid = document.getElementById("otherProductGrid");
  const noResults = document.getElementById("noResults");
  const otherContainer = document.getElementById("otherProducts");

  let filtered = [];
  let others = [];

  if (query === "") {
    renderProducts(productGrid, products);
    renderProducts(otherGrid, []);
    noResults.style.display = "none";
    otherContainer.style.display = "none";
    return;
  }

  if (query.startsWith("#")) {
    const idSearch = query.slice(1);
    filtered = products.filter(p => p.link.toLowerCase() === idSearch);
    others = products.filter(p => p.link.toLowerCase() !== idSearch);
  } else if (query.includes("between")) {
    const nums = query.match(/\d+/g);
    if (nums && nums.length >= 2) {
      const min = parseFloat(nums[0]);
      const max = parseFloat(nums[1]);
      filtered = products.filter(p => p.price >= min && p.price <= max);
      others = products.filter(p => p.price < min || p.price > max);
    }
  } else if (query.includes("under")) {
    const num = parseFloat(query.replace(/[^\d.]/g, ""));
    filtered = products.filter(p => p.price <= num);
    others = products.filter(p => p.price > num);
  } else if (query.includes("above")) {
    const num = parseFloat(query.replace(/[^\d.]/g, ""));
    filtered = products.filter(p => p.price >= num);
    others = products.filter(p => p.price < num);
  } else if (!isNaN(query)) {
    const num = parseFloat(query);
    filtered = products.filter(p => p.price === num);
    others = products.filter(p => p.price !== num);
  } else {
    filtered = products.filter(p => p.name.toLowerCase().includes(query));
    others = products.filter(p => !p.name.toLowerCase().includes(query));
  }

  renderProducts(productGrid, filtered);
  renderProducts(otherGrid, others);
  noResults.style.display = filtered.length === 0 ? "block" : "none";
  otherContainer.style.display = "block";
}, 300));

// Lazy Load Product Images
document.addEventListener('DOMContentLoaded', function () {
  const images = document.querySelectorAll('.product-img');
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        observer.unobserve(img);
      }
    });
  });
  images.forEach(img => observer.observe(img));
});