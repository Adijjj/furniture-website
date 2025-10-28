// 支付页面功能

// 从URL获取订单信息
function getOrderFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderData = urlParams.get('order');
    
    if (!orderData) {
        // 如果没有订单数据，显示示例数据
        return {
            orderNumber: 'ORD' + Date.now(),
            items: [
                { name: '示例产品', quantity: 1, price: 1999 }
            ],
            total: 1999
        };
    }
    
    try {
        return JSON.parse(decodeURIComponent(orderData));
    } catch (e) {
        console.error('解析订单数据失败:', e);
        return null;
    }
}

// 加载订单信息
function loadOrderInfo() {
    const order = getOrderFromURL();
    
    if (!order) {
        alert('订单数据无效');
        window.location.href = 'index.html';
        return;
    }
    
    // 显示订单号
    document.getElementById('orderNumber').textContent = order.orderNumber;
    document.getElementById('successOrderNumber').textContent = order.orderNumber;
    
    // 显示订单总额
    const total = order.total || 0;
    document.getElementById('orderTotal').textContent = '¥' + total.toLocaleString();
    document.getElementById('alipayAmount').textContent = '¥' + total.toLocaleString();
    document.getElementById('wechatAmount').textContent = '¥' + total.toLocaleString();
    document.getElementById('subtotal').textContent = '¥' + total.toLocaleString();
    document.getElementById('finalTotal').textContent = '¥' + total.toLocaleString();
    
    // 显示订单项
    const orderItems = document.getElementById('orderItems');
    orderItems.innerHTML = '';
    
    order.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        itemDiv.innerHTML = `
            <span class="order-item-name">${item.name}<span class="order-item-quantity"> x ${item.quantity}</span></span>
            <span class="order-item-price">¥${item.price.toLocaleString()}</span>
        `;
        orderItems.appendChild(itemDiv);
    });
}

// 选择支付方式
function selectPaymentMethod(method) {
    // 更新标签状态
    document.querySelectorAll('.payment-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-method="${method}"]`).classList.add('active');
    
    // 显示对应的支付内容
    document.querySelectorAll('.payment-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(method + 'Payment').classList.add('active');
    
    // 更新收款码
    updateQRCode(method);
}

// 更新收款码
function updateQRCode(method) {
    if (method === 'alipay') {
        const alipayImg = document.getElementById('alipayQR');
        const alipayPlaceholder = document.getElementById('alipayQRPlaceholder');
        
        if (alipayImg) {
            // 重新加载图片以检查是否存在
            alipayImg.src = 'images/alipay-qr.png';
        }
    } else if (method === 'wechat') {
        const wechatImg = document.getElementById('wechatQR');
        const wechatPlaceholder = document.getElementById('wechatQRPlaceholder');
        
        if (wechatImg) {
            // 重新加载图片以检查是否存在
            wechatImg.src = 'images/wechat-qr.png';
        }
    }
}

// 标记为已支付
function markAsPaid() {
    if (confirm('确认已完成支付？')) {
        const orderNumber = document.getElementById('orderNumber').textContent;
        
        // 显示支付成功弹窗
        document.getElementById('paymentSuccessModal').style.display = 'flex';
        
        // 保存订单到本地存储
        const order = getOrderFromURL();
        if (order) {
            order.status = 'paid';
            order.paymentTime = new Date().toISOString();
            localStorage.setItem('order_' + orderNumber, JSON.stringify(order));
        }
    }
}

// 返回首页
function goBackToHome() {
    window.location.href = 'index.html';
}

// 生成订单号
function generateOrderNumber() {
    return 'ORD' + Date.now();
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadOrderInfo();
    
    // 默认选择支付宝
    selectPaymentMethod('alipay');
});

// 检测支付结果（可选）
function checkPaymentStatus() {
    // 这里可以添加支付状态检测逻辑
    // 例如：定期检查支付状态，或使用支付接口查询
}

// 分享订单（可选功能）
function shareOrder() {
    const orderNumber = document.getElementById('orderNumber').textContent;
    const text = `我在上海市宝安家具购买的商品，订单号：${orderNumber}`;
    
    if (navigator.share) {
        navigator.share({
            title: '上海市宝安家具订单',
            text: text,
            url: window.location.href
        });
    } else {
        // 复制到剪贴板
        navigator.clipboard.writeText(text).then(() => {
            alert('订单信息已复制到剪贴板');
        });
    }
}

