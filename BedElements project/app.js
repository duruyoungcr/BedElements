// variables declaration

const cartBtn = document.querySelector(".top-cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
// Cart
let cart = [];
let buttonsDOM = [];
//getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}
//displaying the products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      result += `
            <!--single product-->
        <article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="product"
              class="product-img img-responsive"
            />
            <button class="cart-btn" data-id=${product.id}>
              <i class="fa fa-shopping-cart"></i>
              Add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>N ${product.price
            .toString()
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}</h4>
        </article>
        <!--single product-->
            `;
    });
    productsDOM.innerHTML = result;
  }
  getCartButton() {
    const buttons = [...document.querySelectorAll(".cart-btn")];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "IN CART";
        button.disabled = true;
      } else {
        button.addEventListener("click", event => {
          event.target.innerText = "IN CART";
          event.target.disabled = true;
          //get product from local storage
          let cartItem = { ...Storage.getProduct(id), quantity: 1 };
          //add product to cart
          cart = [...cart, cartItem];
          console.log(cart);
          //save cart in local storage
          Storage.saveCart(cart);
          //update cart values
          this.setCartValues(cart);
          //display products in cart
          this.displayCartItems(cartItem);
          //show cart
          this.showCart();
        });
      }
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.quantity;
      itemsTotal += item.quantity;
    });
    cartItems.innerText = itemsTotal;
    cartTotal.innerText = tempTotal
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    console.log(cartTotal, cartItems);
  }
  displayCartItems(item) {
    let price = item.price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} alt="product" />
            <div>
              <h4>${item.title}</h4>
              <h5>N ${price} </h5>
              <span class="remove-item" data-id = ${item.id}>remove</span>
            </div>
            <div>
              <i class="fa fa-plus-circle" aria-hidden="true" data-id = ${item.id}></i>
              <h6 class="item-count">${item.quantity}</h6>
              <i class="fa fa-minus-circle" aria-hidden="true" data-id = ${item.id}></i>
            </div>`;
    cartContent.appendChild(div);
    console.log(cartContent);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
    clearCartBtn.addEventListener("click", this.clearCart);
  }
  populateCart() {
    cart.forEach(item => this.displayCartItems(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => this.clearCart());
    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = event.target.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-plus-circle")) {
        let addQuantity = event.target;
        let id = addQuantity.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.quantity = tempItem.quantity + 1;
        addQuantity.nextElementSibling.innerText = tempItem.quantity;
        Storage.saveCart(cart);
        this.setCartValues(cart);
      } else if (event.target.classList.contains("fa-minus-circle")) {
        let minusQuantity = event.target;
        let id = minusQuantity.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        if (tempItem.quantity <= 1) {
          cartContent.removeChild(minusQuantity.parentElement.parentElement);
          this.removeItem(id);
          //minusQuantity.disabled = true;
          Storage.saveCart(cart);
          this.setCartValues(cart);
        } else {
          tempItem.quantity = tempItem.quantity - 1;
          minusQuantity.previousElementSibling.innerText = tempItem.quantity;
          Storage.saveCart(cart);
          this.setCartValues(cart);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(item => this.removeItem(item));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleBtn(id);
    button.disabled = false;
    button.innerHTML = `<i class="fa fa-shopping-cart"></i>Add to cart`;
  }
  getSingleBtn(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}
//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //setup application
  ui.setupAPP();
  //getting all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getCartButton();
      ui.cartLogic();
    });
});
