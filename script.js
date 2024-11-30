document.addEventListener("DOMContentLoaded", () => {
  let cartItems = [];
  let currentStock = 12;
  let isWishlisted = false;
  let currentImageIndex = 0;
  const images = Array.from(document.querySelectorAll(".thumbnail")).map(
    (thumb) => thumb.src
  );

  const minusBtn = document.querySelector(".minus");
  const plusBtn = document.querySelector(".plus");
  const quantityDisplay = document.querySelector(".quantity");
  const cartBtn = document.querySelector(".cart-btn");
  const cartDropdown = document.querySelector(".cart-dropdown");
  const cartCount = document.querySelector(".cart-count");
  const cartItemsContainer = document.querySelector(".cart-items");
  const checkoutBtn = document.querySelector(".checkout-btn");
  const emptyCartMessage = document.querySelector(".empty-cart-message");
  const mainImage = document.getElementById("mainImage");
  const thumbnails = document.querySelectorAll(".thumbnail");
  const wishlistBtn = document.querySelector(".wishlist-btn");
  const stockStatus = document.querySelector(".stock-status");
  const quickBuyBtn = document.querySelector(".quick-buy-btn");
  const quickBuyModal = document.querySelector(".quick-buy-modal");
  const closeModalBtn = document.querySelector(".close-modal");
  const quickBuyForm = document.querySelector(".quick-buy-form");
  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = document.querySelector(".lightbox-image");
  const closeLightboxBtn = document.querySelector(".close-lightbox");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  const fullscreenBtn = document.querySelector(".fullscreen-btn");
  const zoomLens = document.querySelector(".zoom-lens");

  let quantity = 0;

  minusBtn.addEventListener("click", () => {
    if (quantity > 0) {
      quantity--;
      quantityDisplay.textContent = quantity;
    }
  });

  plusBtn.addEventListener("click", () => {
    if (quantity < currentStock) {
      quantity++;
      quantityDisplay.textContent = quantity;
    }
  });

  cartBtn.addEventListener("click", () => {
    cartDropdown.style.display =
      cartDropdown.style.display === "none" ? "block" : "none";
    if (cartDropdown.style.display === "block") {
      cartDropdown.classList.add("slide-in");
    }
  });

  document.addEventListener("click", (e) => {
    if (!cartBtn.contains(e.target) && !cartDropdown.contains(e.target)) {
      cartDropdown.style.display = "none";
    }
  });

  const addToCartBtn = document.querySelector(".add-to-cart-btn");

  addToCartBtn.addEventListener("click", () => {
    if (quantity > 0 && currentStock >= quantity) {
      const product = {
        id: Date.now(),
        name: "Fall Limited Edition Sneakers",
        price: 125.0,
        quantity: quantity,
        image: document.getElementById("mainImage").src,
      };

      cartItems.push(product);
      updateCart();
      currentStock -= quantity;
      updateStockStatus();

      quantity = 0;
      quantityDisplay.textContent = quantity;

      cartDropdown.style.display = "block";
      cartDropdown.classList.add("slide-in");
      cartCount.classList.add("pulse");
    }
  });

  function updateCart() {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? "block" : "none";

    if (cartItems.length === 0) {
      cartItemsContainer.innerHTML = "";
      checkoutBtn.style.display = "none";
      emptyCartMessage.style.display = "block";
    } else {
      emptyCartMessage.style.display = "none";
      checkoutBtn.style.display = "block";

      cartItemsContainer.innerHTML = cartItems
        .map(
          (item) => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">
                            $${item.price.toFixed(2)} x ${item.quantity}
                            <span class="total">$${(
                              item.price * item.quantity
                            ).toFixed(2)}</span>
                        </div>
                    </div>
                    <button class="delete-item" onclick="deleteItem(${
                      item.id
                    })">
                        <img src="images/delete.svg" alt="Delete">
                    </button>
                </div>
            `
        )
        .join("");
    }
  }

  window.deleteItem = function (id) {
    const item = cartItems.find((item) => item.id === id);
    if (item) {
      currentStock += item.quantity;
      updateStockStatus();
    }
    cartItems = cartItems.filter((item) => item.id !== id);
    updateCart();
  };

  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener("click", () => {
      thumbnails.forEach((thumb) => thumb.classList.remove("active"));
      thumbnail.classList.add("active");
      mainImage.src = thumbnail.src;
      currentImageIndex = index;
    });
  });

  wishlistBtn.addEventListener("click", () => {
    isWishlisted = !isWishlisted;
    wishlistBtn.classList.toggle("active");
    wishlistBtn.classList.add("pulse");
  });

  function updateStockStatus() {
    stockStatus.textContent = `In Stock: ${currentStock} pairs left`;
    if (currentStock <= 5) {
      stockStatus.classList.add("low");
    } else {
      stockStatus.classList.remove("low");
    }
  }

  quickBuyBtn.addEventListener("click", () => {
    quickBuyModal.style.display = "block";
    quickBuyModal.classList.add("slide-in");
  });

  closeModalBtn.addEventListener("click", () => {
    quickBuyModal.style.display = "none";
  });

  quickBuyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const size = document.getElementById("size").value;
    const email = document.getElementById("email").value;

    alert(
      `Order placed!\nSize: US ${size}\nEmail: ${email}\nWe'll contact you soon!`
    );
    quickBuyModal.style.display = "none";
  });

  mainImage.addEventListener("mousemove", (e) => {
    const bounds = mainImage.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    zoomLens.style.left = `${x - 50}px`;
    zoomLens.style.top = `${y - 50}px`;
  });

  fullscreenBtn.addEventListener("click", () => {
    lightbox.style.display = "flex";
    lightboxImage.src = mainImage.src;
    lightbox.classList.add("slide-in");
  });

  closeLightboxBtn.addEventListener("click", () => {
    lightbox.style.display = "none";
  });

  prevBtn.addEventListener("click", () => {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    lightboxImage.src = images[currentImageIndex];
  });

  nextBtn.addEventListener("click", () => {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    lightboxImage.src = images[currentImageIndex];
  });

  window.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.style.display = "none";
    }
    if (e.target === quickBuyModal) {
      quickBuyModal.style.display = "none";
    }
  });

  updateStockStatus();
});
