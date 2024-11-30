// Product Data
const product = {
  name: "Fall Limited Edition Sneakers",
  price: 250.0,
  discountPercentage: 50,
  stock: {
    White: { 7: 5, 8: 3, 9: 8, 10: 2, 11: 0 },
    Black: { 7: 3, 8: 7, 9: 4, 10: 1, 11: 2 },
    Orange: { 7: 0, 8: 4, 9: 6, 10: 3, 11: 1 },
  },
  colors: ["White", "Black", "Orange"],
  sizes: ["7", "8", "9", "10", "11"],
  images: ["images/1.jpg", "images/2.jpg", "images/3.jpg", "images/4.jpg"],
};

// State Management
let state = {
  currentImage: 0,
  quantity: 1,
  selectedColor: "White",
  selectedSize: "9",
  cartItems: [],
  wishlist: new Set(),
  lightboxOpen: false,
};

// DOM Elements
const elements = {
  mainImage: document.querySelector("#mainImage"),
  thumbnails: document.querySelectorAll(".thumbnail"),
  quantityInput: document.querySelector(".quantity"),
  addToCartBtn: document.querySelector(".add-to-cart-btn"),
  cartCount: document.querySelector(".cart-count"),
  cartDropdown: document.querySelector(".cart-dropdown"),
  cartBtn: document.querySelector(".cart-btn"),
  colorOptions: document.querySelector(".color-options"),
  sizeOptions: document.querySelector(".size-options"),
  wishlistBtn: document.querySelector(".wishlist-btn"),
  shareBtn: document.querySelector(".share-btn"),
  lightbox: document.querySelector(".lightbox"),
  stockStatus: document.querySelector(".stock-status"),
  emptyCartMessage: document.querySelector(".empty-cart-message"),
  cartItems: document.querySelector(".cart-items"),
  checkoutBtn: document.querySelector(".checkout-btn"),
  modals: {
    sizeGuide: document.querySelector(".size-guide-modal"),
    share: document.querySelector(".share-modal"),
    quickBuy: document.querySelector(".quick-buy-modal"),
  },
};

// Initialize Product Display
function initializeProduct() {
  renderColorOptions();
  renderSizeOptions();
  updateStock();
  setupEventListeners();
  renderReviews();
  updateCartDisplay();
  handleImageNavigation();
}

// Color Selection
function renderColorOptions() {
  elements.colorOptions.innerHTML = product.colors
    .map(
      (color) => `
        <button class="color-btn ${
          color === state.selectedColor ? "active" : ""
        }" 
                style="background-color: ${color.toLowerCase()}"
                data-color="${color}">
        </button>
    `
    )
    .join("");
}

// Size Selection
function renderSizeOptions() {
  elements.sizeOptions.innerHTML = product.sizes
    .map(
      (size) => `
        <button class="size-btn ${size === state.selectedSize ? "active" : ""} 
                ${
                  product.stock[state.selectedColor][size] === 0
                    ? "out-of-stock"
                    : ""
                }"
                data-size="${size}">
            ${size}
        </button>
    `
    )
    .join("");
}

// Stock Management
function updateStock() {
  const currentStock = product.stock[state.selectedColor][state.selectedSize];
  const stockStatus = elements.stockStatus;

  if (stockStatus) {
    if (currentStock === 0) {
      stockStatus.textContent = "Out of Stock";
      stockStatus.classList.add("out-of-stock");
      elements.addToCartBtn.disabled = true;
    } else {
      stockStatus.textContent = `In Stock: ${currentStock} pairs left`;
      stockStatus.classList.remove("out-of-stock");
      elements.addToCartBtn.disabled = false;
    }
  }

  // Update size buttons
  const sizeButtons = document.querySelectorAll(".size-btn");
  sizeButtons.forEach((btn) => {
    const size = btn.dataset.size;
    const sizeStock = product.stock[state.selectedColor][size];
    if (sizeStock === 0) {
      btn.classList.add("out-of-stock");
      btn.disabled = true;
    } else {
      btn.classList.remove("out-of-stock");
      btn.disabled = false;
    }
  });
}

function addToCart() {
  if (state.quantity <= 0) return;

  const currentStock = product.stock[state.selectedColor][state.selectedSize];
  if (currentStock < state.quantity) {
    showToast("Not enough items in stock", "error");
    return;
  }

  const cartItem = {
    id: Date.now(),
    name: product.name,
    color: state.selectedColor,
    size: state.selectedSize,
    quantity: state.quantity,
    price: calculatePrice(),
    image: product.images[state.currentImage],
  };

  state.cartItems.push(cartItem);
  product.stock[state.selectedColor][state.selectedSize] -= state.quantity;

  updateCartDisplay();
  updateStock();
  showToast("Added to cart successfully", "success");

  // Reset quantity
  state.quantity = 1;
  elements.quantityInput.textContent = "1";
}

function updateCartDisplay() {
  const totalItems = state.cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Update cart count badge
  elements.cartCount.textContent = totalItems;
  elements.cartCount.style.display = totalItems > 0 ? "block" : "none";

  // Update cart dropdown content
  if (state.cartItems.length === 0) {
    elements.cartItems.innerHTML = "";
    elements.checkoutBtn.style.display = "none";
    elements.emptyCartMessage.style.display = "block";
  } else {
    elements.emptyCartMessage.style.display = "none";
    elements.checkoutBtn.style.display = "block";

    elements.cartItems.innerHTML = state.cartItems
      .map(
        (item) => `
          <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
              <div class="cart-item-title">${item.name}</div>
              <div class="cart-item-price">
                $${item.price.toFixed(2)} x ${item.quantity}
                <span class="total">$${(item.price * item.quantity).toFixed(
                  2
                )}</span>
              </div>
            </div>
            <button class="delete-item" onclick="deleteCartItem(${item.id})">
              <img src="images/delete.svg" alt="Delete">
            </button>
          </div>
        `
      )
      .join("");
  }
}

// Image Gallery and Lightbox
function handleImageNavigation() {
  const mainImage = document.querySelector("#mainImage");
  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = document.querySelector(".lightbox-image");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  const closeLightbox = document.querySelector(".close-lightbox");
  const thumbnails = document.querySelectorAll(".thumbnail");

  // Open lightbox on main image click
  mainImage.addEventListener("click", () => {
    lightbox.style.display = "flex";
    lightboxImage.src = mainImage.src;
  });

  // Close lightbox
  closeLightbox.addEventListener("click", () => {
    lightbox.style.display = "none";
  });

  // Navigate images
  function updateImage(index) {
    state.currentImage = index;
    mainImage.src = product.images[index];
    lightboxImage.src = product.images[index];

    // Update thumbnails
    thumbnails.forEach((thumb, i) => {
      if (i === index) {
        thumb.classList.add("active");
      } else {
        thumb.classList.remove("active");
      }
    });
  }

  // Previous image
  prevBtn.addEventListener("click", () => {
    let newIndex = state.currentImage - 1;
    if (newIndex < 0) newIndex = product.images.length - 1;
    updateImage(newIndex);
  });

  // Next image
  nextBtn.addEventListener("click", () => {
    let newIndex = state.currentImage + 1;
    if (newIndex >= product.images.length) newIndex = 0;
    updateImage(newIndex);
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (lightbox.style.display === "flex") {
      if (e.key === "ArrowLeft") {
        let newIndex = state.currentImage - 1;
        if (newIndex < 0) newIndex = product.images.length - 1;
        updateImage(newIndex);
      } else if (e.key === "ArrowRight") {
        let newIndex = state.currentImage + 1;
        if (newIndex >= product.images.length) newIndex = 0;
        updateImage(newIndex);
      } else if (e.key === "Escape") {
        lightbox.style.display = "none";
      }
    }
  });

  // Click outside to close
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.style.display = "none";
    }
  });

  // Thumbnail click
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener("click", () => {
      updateImage(index);
    });
  });
}

// Lightbox
function toggleLightbox() {
  state.lightboxOpen = !state.lightboxOpen;
  elements.lightbox.classList.toggle("active", state.lightboxOpen);
  if (state.lightboxOpen) {
    elements.lightbox.querySelector(".lightbox-main-image").src =
      product.images[state.currentImage];
  }
}

// Wishlist
function toggleWishlist() {
  const productId = 1;
  if (state.wishlist.has(productId)) {
    state.wishlist.delete(productId);
    elements.wishlistBtn.classList.remove("active");
    showToast("Removed from wishlist", "success");
  } else {
    state.wishlist.add(productId);
    elements.wishlistBtn.classList.add("active");
    showToast("Added to wishlist", "success");
  }
}

// Share Functionality
function shareProduct() {
  elements.modals.share.classList.add("active");
}

async function copyProductLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast("Link copied to clipboard", "success");
  } catch (err) {
    showToast("Failed to copy link", "error");
  }
}

// Reviews
function renderReviews() {
  const reviewsContainer = document.querySelector(".reviews-list");
  const reviews = [
    {
      id: 1,
      username: "John Doe",
      rating: 5,
      date: "2023-05-15",
      content: "Great sneakers! Very comfortable and stylish.",
      avatar: "images/avatar.jpeg",
      images: ["images/1.jpg"],
    },
  ];

  reviewsContainer.innerHTML = reviews
    .map(
      (review) => `
        <div class="review" data-review-id="${review.id}">
            <div class="review-header">
                <img src="${review.avatar}" alt="${
        review.username
      }" class="reviewer-avatar">
                <div class="review-meta">
                    <div class="reviewer-name">${review.username}</div>
                    <div class="review-date">${review.date}</div>
                    <div class="review-rating">
                        ${Array(5)
                          .fill("")
                          .map(
                            (_, i) => `
                            <span class="star ${
                              i < review.rating ? "filled" : ""
                            }">★</span>
                        `
                          )
                          .join("")}
                    </div>
                </div>
            </div>
            <p class="review-content">${review.content}</p>
            ${
              review.images && review.images.length > 0
                ? `
                <div class="review-images">
                    ${review.images
                      .map(
                        (img) => `
                        <img src="${img}" alt="Review image" class="review-image">
                    `
                      )
                      .join("")}
                </div>
            `
                : ""
            }
        </div>
    `
    )
    .join("");
}

// Utility Functions
function calculatePrice() {
  const basePrice = product.price;
  const discount = product.discountPercentage / 100;
  return basePrice * (1 - discount);
}

function calculateCartTotal() {
  return state.cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Event Listeners
function setupEventListeners() {
  // Cart Toggle
  elements.cartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    elements.cartDropdown.style.display =
      elements.cartDropdown.style.display === "none" ? "block" : "none";
  });

  // Close cart when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".cart-dropdown") && !e.target.closest(".cart-btn")) {
      elements.cartDropdown.style.display = "none";
    }
  });

  // Prevent closing when clicking inside cart
  elements.cartDropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Quantity Controls
  document.querySelector(".minus").addEventListener("click", () => {
    if (state.quantity > 1) {
      state.quantity--;
      elements.quantityInput.textContent = state.quantity;
    }
  });

  document.querySelector(".plus").addEventListener("click", () => {
    const maxStock = product.stock[state.selectedColor][state.selectedSize];
    if (state.quantity < maxStock) {
      state.quantity++;
      elements.quantityInput.textContent = state.quantity;
    }
  });

  // Add to Cart
  elements.addToCartBtn.addEventListener("click", addToCart);

  // Delete Cart Item
  window.deleteCartItem = function (id) {
    const itemIndex = state.cartItems.findIndex((item) => item.id === id);
    if (itemIndex !== -1) {
      const item = state.cartItems[itemIndex];
      product.stock[item.color][item.size] += item.quantity;
      state.cartItems.splice(itemIndex, 1);
      updateCartDisplay();
      updateStock();
    }
  };

  // Image Gallery
  elements.thumbnails.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      elements.thumbnails.forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
      elements.mainImage.src = product.images[index];
      state.currentImage = index;
    });
  });

  // Other event listeners remain the same...
}

// Initialize the product page
document.addEventListener("DOMContentLoaded", initializeProduct);
