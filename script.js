class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }
    
    init() {
        this.render();
        this.updateCount();
        this.setupEventListeners();
    }
    
    addItem(product) {
        const existing = this.items.find(item => item.id === product.id && item.size === product.size);
        
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                size: product.size,
                price: product.price,
                quantity: 1
            });
        }
        
        this.save();
        this.render();
        this.updateCount();
    }
    
    increaseQuantity(id, size) {
        const item = this.items.find(item => item.id === id && item.size === size);
        if (item) {
            item.quantity += 1;
            this.save();
            this.render();
            this.updateCount();
        }
    }
    
    decreaseQuantity(id, size) {
        const index = this.items.findIndex(item => item.id === id && item.size === size);
        if (index !== -1) {
            const item = this.items[index];
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                this.items.splice(index, 1);
            }
            this.save();
            this.render();
            this.updateCount();
        }
    }
    
    removeItem(id, size) {
        const index = this.items.findIndex(item => item.id === id && item.size === size);
        if (index !== -1) {
            this.items.splice(index, 1);
            this.save();
            this.render();
            this.updateCount();
        }
    }
    
    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    getCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }
    
    updateCount() {
        const count = this.getCount();
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
    }
    
    render() {
        const cartItems = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartTotal = document.querySelector('.cart__total-price');
        
        if (!cartItems || !cartEmpty) return;
        
        if (this.items.length === 0) {
            cartEmpty.style.display = 'block';
            cartItems.innerHTML = '';
            if (cartTotal) cartTotal.textContent = '0 ₽';
            return;
        }
        
        cartEmpty.style.display = 'none';
        
        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}" data-size="${item.size}">
                <div class="cart-item__image">
                    <img src="images/pizza-${this.getImageName(item.id)}.jpg" alt="${item.name}">
                </div>
                <div class="cart-item__content">
                    <h4 class="cart-item__title">${item.name}</h4>
                    <div class="cart-item__size">${item.size} см</div>
                    <p class="cart-item__price">${item.price} ₽ × ${item.quantity}</p>
                </div>
                <div class="cart-item__actions">
                    <div class="cart-item__quantity">
                        <button class="cart-item__btn cart-item__decrease">-</button>
                        <span class="cart-item__count">${item.quantity}</span>
                        <button class="cart-item__btn cart-item__increase">+</button>
                    </div>
                    <button class="cart-item__remove">×</button>
                </div>
            </div>
        `).join('');
        
        if (cartTotal) cartTotal.textContent = this.getTotal() + ' ₽';
        
        setTimeout(() => {
            this.setupCartItemEvents();
        }, 0);
    }
    
    getImageName(productId) {
        const names = {
            1: 'margherita',
            2: 'pepperoni',
            3: 'quattro-formaggi',
            4: 'ham-mushrooms',
            5: 'vegetarian',
            6: 'meat'
        };
        return names[productId] || 'default';
    }
    
    setupCartItemEvents() {
        document.querySelectorAll('.cart-item__increase').forEach(btn => {
            btn.removeEventListener('click', this.increaseHandler);
            this.increaseHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const cartItem = e.target.closest('.cart-item');
                if (!cartItem) return;
                const id = cartItem.dataset.id;
                const size = cartItem.dataset.size;
                this.increaseQuantity(id, size);
            };
            btn.addEventListener('click', this.increaseHandler.bind(this));
        });
        
        document.querySelectorAll('.cart-item__decrease').forEach(btn => {
            btn.removeEventListener('click', this.decreaseHandler);
            this.decreaseHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const cartItem = e.target.closest('.cart-item');
                if (!cartItem) return;
                const id = cartItem.dataset.id;
                const size = cartItem.dataset.size;
                this.decreaseQuantity(id, size);
            };
            btn.addEventListener('click', this.decreaseHandler.bind(this));
        });
        
        document.querySelectorAll('.cart-item__remove').forEach(btn => {
            btn.removeEventListener('click', this.removeHandler);
            this.removeHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const cartItem = e.target.closest('.cart-item');
                if (!cartItem) return;
                const id = cartItem.dataset.id;
                const size = cartItem.dataset.size;
                this.removeItem(id, size);
            };
            btn.addEventListener('click', this.removeHandler.bind(this));
        });
    }
    
    setupEventListeners() {
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.menu__card');
                const sizeInput = card.querySelector('input[type="radio"]:checked');
                const size = sizeInput.value;
                const price = parseInt(sizeInput.dataset.price);
                
                this.addItem({
                    id: btn.dataset.id,
                    name: btn.dataset.name,
                    size: size,
                    price: price
                });
                
                sizeInput.checked = true;
            });
        });
        
        document.querySelectorAll('.menu__size input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const card = e.target.closest('.menu__card');
                const priceSpan = card.querySelector('.menu__price');
                const price = e.target.dataset.price;
                priceSpan.textContent = price + ' ₽';
                
                const addBtn = card.querySelector('.add-to-cart');
                addBtn.dataset.price = price;
            });
        });
        
        const cartToggle = document.getElementById('cartToggle') || document.getElementById('orderCartToggle');
        const mobileCartBtn = document.getElementById('mobileCartBtn');
        
        [cartToggle, mobileCartBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openCart();
                });
            }
        });
        
        const cartClose = document.getElementById('cartClose');
        if (cartClose) {
            cartClose.addEventListener('click', () => this.closeCart());
        }
        
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                if (this.items.length === 0) {
                    e.preventDefault();
                    alert('Корзина пуста. Добавьте пиццу в корзину.');
                }
            });
        }
        
        const continueCheckout = document.getElementById('continueCheckout');
        if (continueCheckout) {
            continueCheckout.addEventListener('click', () => {
                if (this.items.length === 0) {
                    alert('Корзина пуста');
                } else {
                    window.location.href = 'order.html';
                }
            });
        }
        
        document.addEventListener('click', (e) => {
            const cart = document.getElementById('cart');
            const toggle = document.getElementById('cartToggle') || document.getElementById('orderCartToggle');
            
            if (cart?.classList.contains('cart--active') &&
                !cart.contains(e.target) &&
                e.target !== toggle &&
                !toggle?.contains(e.target)) {
                this.closeCart();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
            }
        });
    }
    
    openCart() {
        const cart = document.getElementById('cart');
        let overlay = document.getElementById('cartOverlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'cartOverlay';
            overlay.className = 'cart__overlay';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', () => this.closeCart());
        }
        
        cart.classList.add('cart--active');
        overlay.classList.add('cart__overlay--active');
        document.body.style.overflow = 'hidden';
    }
    
    closeCart() {
        const cart = document.getElementById('cart');
        const overlay = document.getElementById('cartOverlay');
        
        cart?.classList.remove('cart--active');
        overlay?.classList.remove('cart__overlay--active');
        document.body.style.overflow = '';
    }
}

class MobileMenu {
    constructor() {
        this.burger = document.getElementById('headerBurger');
        this.menu = document.getElementById('mobileMenu');
        
        if (this.burger && this.menu) {
            this.init();
        }
    }
    
    init() {
        this.burger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        this.menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.close());
        });
        
        document.addEventListener('click', (e) => {
            if (this.menu.classList.contains('mobile-menu--active') &&
                !this.menu.contains(e.target) &&
                e.target !== this.burger &&
                !this.burger.contains(e.target)) {
                this.close();
            }
        });
    }
    
    toggle() {
        this.burger.classList.toggle('header__burger--active');
        this.menu.classList.toggle('mobile-menu--active');
        document.body.style.overflow = this.menu.classList.contains('mobile-menu--active') ? 'hidden' : '';
    }
    
    close() {
        this.burger.classList.remove('header__burger--active');
        this.menu.classList.remove('mobile-menu--active');
        document.body.style.overflow = '';
    }
}

class OrderPage {
    constructor() {
        if (window.location.pathname.includes('order.html')) {
            this.init();
        }
    }
    
    init() {
        this.setupPhoneMask();
        this.setupDeliveryTime();
        this.setupForm();
        this.loadCartItems();
    }
    
    setupPhoneMask() {
        const phone = document.getElementById('phone');
        if (!phone) return;
        
        phone.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = `+7 (${value}`;
                } else if (value.length <= 6) {
                    value = `+7 (${value.slice(1, 4)}) ${value.slice(4)}`;
                } else if (value.length <= 8) {
                    value = `+7 (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7)}`;
                } else {
                    value = `+7 (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7, 9)}-${value.slice(9, 11)}`;
                }
            }
            
            e.target.value = value;
        });
    }
    
    setupDeliveryTime() {
        const radios = document.querySelectorAll('input[name="delivery-time"]');
        const specificTime = document.getElementById('specificTimeField');
        
        if (!radios.length || !specificTime) return;
        
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                specificTime.style.display = e.target.value === 'specific' ? 'block' : 'none';
            });
        });
    }
    
    loadCartItems() {
        const items = JSON.parse(localStorage.getItem('cart')) || [];
        const container = document.getElementById('orderItems');
        const itemsPrice = document.getElementById('items-price');
        const deliveryPrice = document.getElementById('delivery-price');
        const totalPrice = document.getElementById('total-price');
        
        if (!container || !itemsPrice || !deliveryPrice || !totalPrice) return;
        
        if (items.length === 0) {
            window.location.href = 'index.html';
            return;
        }
        
        container.innerHTML = items.map(item => `
            <div class="order-item">
                <div class="order-item__info">
                    <h4 class="order-item__title">${item.name} (${item.size} см)</h4>
                    <p class="order-item__details">${item.quantity} × ${item.price} ₽</p>
                </div>
                <div class="order-item__price">${item.price * item.quantity} ₽</div>
            </div>
        `).join('');
        
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const delivery = subtotal >= 1500 ? 0 : 200;
        const total = subtotal + delivery;
        
        itemsPrice.textContent = subtotal + ' ₽';
        deliveryPrice.textContent = delivery === 0 ? 'Бесплатно' : delivery + ' ₽';
        totalPrice.textContent = total + ' ₽';
    }
    
    setupForm() {
        const form = document.getElementById('orderForm');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const items = JSON.parse(localStorage.getItem('cart')) || [];
            
            if (items.length === 0) {
                alert('Корзина пуста');
                return;
            }
            
            const name = document.getElementById('name')?.value.trim();
            const phone = document.getElementById('phone')?.value.trim();
            const address = document.getElementById('address')?.value.trim();
            
            if (!name || !phone || !address) {
                alert('Заполните обязательные поля');
                return;
            }
            
            if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone)) {
                alert('Введите корректный номер телефона');
                return;
            }
            
            const order = {
                id: Date.now(),
                customer: { name, phone, address },
                items,
                total: document.getElementById('total-price').textContent,
                date: new Date().toLocaleString('ru-RU')
            };
            
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));
            
            localStorage.removeItem('cart');
            
            this.showConfirmation(order);
        });
    }
    
    showConfirmation(order) {
        const modal = document.createElement('div');
        modal.className = 'order-confirmation';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(30, 28, 26, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3000;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 8px; max-width: 480px; width: 100%; text-align: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5d4037" stroke-width="1.5" style="margin-bottom: 20px;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <h3 style="margin-bottom: 16px; color: #3e2723;">Заказ оформлен</h3>
                <p style="margin-bottom: 8px; color: #5c5651;">Спасибо, ${order.customer.name}!</p>
                <p style="margin-bottom: 24px; color: #7c756f;">Ваш заказ №${order.id.toString().slice(-8)}</p>
                <p style="margin-bottom: 8px; color: #5d4037; font-weight: 500;">Сумма: ${order.total}</p>
                <p style="margin-bottom: 32px; color: #7c756f;">Доставка: ${order.customer.address}</p>
                <a href="index.html" class="btn btn--primary">Вернуться на главную</a>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                window.location.href = 'index.html';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cart = new Cart();
    window.mobileMenu = new MobileMenu();
    window.orderPage = new OrderPage();
});