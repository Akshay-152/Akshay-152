 
    // Toggle menu
    
   function toggleMenu(event) {

      event.stopPropagation();

      // Toggle menu & overlay

      var menu = document.getElementById("menuDropdown");

      var overlay = document.getElementById("overlay");

      menu.classList.toggle("show");

      overlay.classList.toggle("show");

      // Toggle button icon and rotation

      const button = event.target;

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
        
        // Reset button appearance

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
    // Change Product Image on Thumbnail Click
    function changeImage(index, newSrc) {
      document.getElementById(`mainImage${index}`).src = newSrc;
    }
     // Show About Section
     function showAbout(event) {
      document.getElementById('about-section').style.display = 'block';
      event.preventDefault();
    }
    // Hide About Section
    function hideAbout() {
      document.getElementById('about-section').style.display = 'none';
    }
    // Show Authentication Form
    window.showAuthForm = function () {
      document.getElementById("upload-form").classList.add("hidden");
      document.getElementById("auth-form").classList.remove("hidden");
    };
    // Close Authentication Form
    window.closeAuthForm = function () {
      document.getElementById("auth-form").classList.add("hidden");
    };
    // User Authentication
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
    // User Credentials Map
    const userMap = {
      "1234": "products",
      "123456": "product2"
    };
    // Helper: Shuffle Array
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
    // Apply Priority and Random Order to Products
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
    // Render Products to the Grid
    function renderProducts(container, productList) {
      container.innerHTML = "";
      productList.forEach((product, index) => {
        const msg = `Hi! I'm interested in "${product.name}" priced at ₹${product.price}, id = ${product.link}.`;
        const encodedMsg = encodeURIComponent(msg);


 
  const msg2 = `@"${product.images[1]}"`;

        const encodedMsg2 = encodeURIComponent(msg2);
  
  

        const targetURL = `https://onlinech0t.blogspot.com/?m=0&message=${encodedMsg2}`;
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
    // Load Products from Firebase Collections
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
    // Expose changeImage globally
    window.changeImage = function (index, newSrc) {
      document.getElementById(`mainImage${index}`).src = newSrc;
    };
    // Upload Product with Unique Link Handling
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
  
    // Search Functionality with Debounce
    document.getElementById("search-input").addEventListener("input", function () {
      const query = this.value.trim().toLowerCase();
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
    });
    
    // Debounce function (if additional search logic is needed)
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
    document.getElementById('search-input').addEventListener('input', 
      debounce(function(e) {
        // Additional custom search logic if needed
      }, 300)
    );
 
    // Lazy Loading Images using IntersectionObserver
    document.addEventListener('DOMContentLoaded', function() {
      const images = document.querySelectorAll('.product-img');
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
          }
        });
      });
      images.forEach(img => {
        img.dataset.src = img.src;
        // Replace the image src with a tiny transparent placeholder
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        imageObserver.observe(img);
      });
    });
  
  

    // Zoom Image Functionality
    function zoomImage(src) {
      let overlay = document.getElementById("zoomOverlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "zoomOverlay";
        overlay.className = "zoom-overlay";
        overlay.innerHTML = '<img class="zoomed-img" src="">';
        document.body.appendChild(overlay);
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            overlay.classList.remove("active");
            document.body.classList.remove("no-scroll");
          }
        });
      }
      overlay.querySelector("img").src = src;
      overlay.classList.add("active");
      document.body.classList.add("no-scroll");
    }
  

  // Dots animation

  const dots = document.getElementById("dots");

  let dotCount = 0;

  const dotInterval = setInterval(() => {

    dotCount = (dotCount + 1) % 4;

    dots.textContent = '.'.repeat(dotCount);

  }, 500);

  // Simulate loading (e.g. fetch or image load)

  setTimeout(() => {

    clearInterval(dotInterval);                  // Stop the dots animation

    document.getElementById("loadingText").style.display = "none"; // Hide loading

    document.getElementById("mainContent").style.display = "block"; // Show content

  }, 2000); // Simulate 3 seconds loading


  


    function toggleDefinition(el) {

      el.classList.toggle('active');

    }
     
     
     
  
  