// 全局变量
let cart = [];
let currentFilter = 'all';
let displayedProducts = [...products];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    displayProducts(products);
    updateCartCount();
    initHeroSlider();
    initImageModal();
    
    // 搜索框回车事件
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });
});

// 显示产品
function displayProducts(productsToShow) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;"><p>没有找到相关产品</p></div>';
        return;
    }
    
    productsToShow.forEach(product => {
        const productCard = document.createElement('article');
        productCard.className = 'product-card';
        productCard.setAttribute('itemscope', '');
        productCard.setAttribute('itemtype', 'https://schema.org/Product');
        
        const imageHTML = product.image 
            ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;" itemprop="image">`
            : '📷';
        
        productCard.innerHTML = `
            <div class="product-image" onclick="openModal('${product.image}', '${product.name}')" style="cursor: pointer;">
                ${imageHTML}
            </div>
            <div class="product-info">
                <h3 class="product-name" itemprop="name">${product.name}</h3>
                <div class="product-category" itemprop="category">${product.category}</div>
                <div class="product-price-container">
                    <span class="product-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                        <meta itemprop="price" content="${product.price}">
                        <meta itemprop="priceCurrency" content="CNY">
                        <meta itemprop="availability" content="https://schema.org/InStock">
                        ¥${product.price.toLocaleString()}
                    </span>
                    <span class="product-original-price">¥${product.originalPrice.toLocaleString()}</span>
                    <span class="discount-badge">${product.discount}</span>
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="addToCart(${product.id})" aria-label="加入购物车 ${product.name}">加入购物车</button>
                    <button class="btn-view" onclick="openModal('${product.image}', '${product.name}')" aria-label="查看 ${product.name} 大图">查看大图</button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// 产品筛选
function filterProducts(category) {
    currentFilter = category;
    
    // 更新筛选按钮状态
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 筛选产品
    if (category === 'all') {
        displayedProducts = [...products];
    } else {
        displayedProducts = products.filter(product => product.category === category);
    }
    
    displayProducts(displayedProducts);
}

// 搜索产品
function searchProducts() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchInput === '') {
        if (currentFilter === 'all') {
            displayedProducts = [...products];
        } else {
            displayedProducts = products.filter(product => product.category === currentFilter);
        }
    } else {
        displayedProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchInput) || 
            product.category.toLowerCase().includes(searchInput)
        );
    }
    
    displayProducts(displayedProducts);
}

// 添加到购物车
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartCount();
    updateCartDisplay();
    showNotification('产品已添加到购物车！');
}

// 更新购物车数量
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

// 打开/关闭购物车
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('open');
    if (cartSidebar.classList.contains('open')) {
        updateCartDisplay();
    }
}

// 更新购物车显示
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">购物车为空</p>';
        document.getElementById('cartTotal').textContent = '¥0';
        return;
    }
    
    let cartHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-image">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 5px;">` : '📷'}
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">¥${item.price.toLocaleString()} x ${item.quantity}</div>
                </div>
                <span class="cart-item-remove" onclick="removeFromCart(${item.id})">×</span>
            </div>
        `;
    });
    
    cartItems.innerHTML = cartHTML;
    document.getElementById('cartTotal').textContent = `¥${total.toLocaleString()}`;
}

// 从购物车移除
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    updateCartDisplay();
    showNotification('产品已从购物车移除');
}

// 结算
function checkout() {
    if (cart.length === 0) {
        alert('购物车为空！');
        return;
    }
    
    // 计算订单总额
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // 生成订单号
    const orderNumber = 'ORD' + Date.now();
    
    // 构建订单数据
    const orderData = {
        orderNumber: orderNumber,
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: total,
        timestamp: new Date().toISOString()
    };
    
    // 保存订单到本地存储（用于后续查看）
    localStorage.setItem('order_' + orderNumber, JSON.stringify(orderData));
    
    // 跳转到支付页面
    const orderJSON = encodeURIComponent(JSON.stringify(orderData));
    window.location.href = `payment.html?order=${orderJSON}`;
}

// 图片放大模态框
function openModal(imageSrc, caption) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    
    modal.style.display = 'block';
    if (imageSrc) {
        modalImg.src = imageSrc;
        modalImg.alt = caption;
        document.querySelector('.modal-caption').textContent = caption;
    } else {
        modalImg.src = '';
        modalImg.innerHTML = '📷';
        document.querySelector('.modal-caption').textContent = caption + '（暂无图片）';
    }
}

// 初始化图片模态框
function initImageModal() {
    const modal = document.getElementById('imageModal');
    const closeModal = document.querySelector('.close-modal');
    
    closeModal.onclick = function() {
        modal.style.display = 'none';
    };
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// 轮播功能
let currentSlideIndex = 0;

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add('active');
                indicators[i].classList.add('active');
            } else {
                slide.classList.remove('active');
                indicators[i].classList.remove('active');
            }
        });
    }
    
    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        showSlide(currentSlideIndex);
    }
    
    setInterval(nextSlide, 5000);
}

function currentSlide(n) {
    currentSlideIndex = n - 1;
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    slides.forEach((slide, i) => {
        if (i === currentSlideIndex) {
            slide.classList.add('active');
            indicators[i].classList.add('active');
        } else {
            slide.classList.remove('active');
            indicators[i].classList.remove('active');
        }
    });
}

// 通知功能
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #4ade80;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideIn 0.3s;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

