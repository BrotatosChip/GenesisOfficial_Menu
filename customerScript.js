document.addEventListener('DOMContentLoaded', function () {
    const cart = [];
    let totalPrice = 0;
    const conversionRate = 4100;

    // Telegram Bot Config
    const telegramBotToken = '7809999917:AAFjpVxgcLASnwcK6F6NMA5815j3wXPDMcE';
    const telegramGroupChatId = '-4672155220';

    // Select DOM elements
    const addToCartButtons = document.querySelectorAll('.addToCartButton');
    const cartList = document.getElementById('cartList');
    const totalPriceDisplay = document.getElementById('totalPrice');
    const checkoutButton = document.getElementById('checkoutButton');
    const checkoutPopup = document.getElementById('checkoutPopup');
    const checkoutSummary = document.getElementById('checkoutSummary');
    const checkoutTotalPrice = document.getElementById('checkoutTotalPrice');
    const confirmCheckout = document.getElementById('confirmCheckout');
    const cancelCheckout = document.getElementById('cancelCheckout');
    const discountButton = document.getElementById('discountButton');

    let discountApplied = 0; // Track applied discount

    // Function to update the cart display
    const updateCartDisplay = () => {
        cartList.innerHTML = ''; // Clear the cart list

        // Iterate through the cart and display each item
        cart.forEach((item) => {
            const li = document.createElement('li');
            li.textContent = `${item.food} ($${item.price}) - Quantity: ${item.quantity}`;
            cartList.appendChild(li);
        });

        // Update total price display in both USD and KHR
        const totalPriceKHR = totalPrice * conversionRate;
        totalPriceDisplay.textContent = `$${totalPrice.toFixed(2)} (៛${totalPriceKHR.toLocaleString()})`;
    };

    // Add item to the cart when the add to cart button is clicked
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function () {
            const food = this.getAttribute('data-food');
            const price = parseFloat(this.getAttribute('data-price'));

            // Check if the item already exists in the cart
            const existingItem = cart.find(item => item.food === food);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ food, price, quantity: 1 });
            }

            totalPrice += price;
            updateCartDisplay();
        });
    });

    // Apply Discount Button functionality
    discountButton.addEventListener('click', () => {
        const discountInput = prompt("Enter discount percentage (e.g., 20%):");

        if (discountInput && discountInput.endsWith('%')) {
            const discountPercent = parseFloat(discountInput);
            if (!isNaN(discountPercent) && discountPercent > 0 && discountPercent <= 100) {
                discountApplied = (discountPercent / 100) * totalPrice;
                totalPrice -= discountApplied;
                updateCartDisplay();
                alert(`Discount of ${discountPercent}% applied! New total is $${totalPrice.toFixed(2)}`);
            } else {
                alert("Please enter a valid percentage (e.g., 20%).");
            }
        } else {
            alert("Please enter a discount percentage (e.g., 20%).");
        }
    });

    // Show the checkout popup when the checkout button is clicked
    checkoutButton.addEventListener('click', function () {
        if (cart.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        // Show the checkout popup
        checkoutPopup.style.display = 'block';

        // Clear the current summary and update it with the cart items
        checkoutSummary.innerHTML = '';
        cart.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.food} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
            checkoutSummary.appendChild(li);
        });

        // Update the total price in both USD and KHR in the checkout summary
        const checkoutTotalPriceKHR = totalPrice * conversionRate;
        checkoutTotalPrice.textContent = `$${totalPrice.toFixed(2)} (៛${checkoutTotalPriceKHR.toLocaleString()})`;
    });

    // Function to send message to Telegram group
    const sendTelegramMessage = (message) => {
        fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: telegramGroupChatId, text: message })
        })
        .then(response => response.json())
        .then(data => {
            if (!data.ok) {
                console.error("Error sending Telegram message:", data);
            } else {
                console.log("Telegram message sent successfully");
            }
        })
        .catch(error => {
            console.error("Error sending Telegram message:", error);
        });
    };

    // Confirm the checkout and save the order to localStorage
    confirmCheckout.addEventListener('click', function () {
        // Save cart and discount to localStorage for admin view
        let orders = JSON.parse(localStorage.getItem('foodOrders')) || {};
        const customerName = prompt("Enter your name:", "Sigma") || "Sigma";

        if (!orders[customerName]) {
            orders[customerName] = [];
        }

        let orderDetails = `🛒 *New Order Placed* 🛒\n👤 Customer: ${customerName}\n`;

        // Store order with discount information
        cart.forEach(item => {
            orders[customerName].push({ food: item.food, price: item.price, quantity: item.quantity });
            orderDetails += `🍔 ${item.food} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
        });

        // Include discount amount in the order for reference
        orders[customerName].push({ discount: discountApplied.toFixed(2), totalPrice: totalPrice.toFixed(2) });

        orderDetails += `\n💰 Total: $${totalPrice.toFixed(2)} (៛${(totalPrice * conversionRate).toLocaleString()})`;

        if (discountApplied > 0) {
            orderDetails += `\n🎉 Discount Applied: -$${discountApplied.toFixed(2)}`;
        }

        localStorage.setItem('foodOrders', JSON.stringify(orders));

        // Send the order details to the Telegram group
        sendTelegramMessage(orderDetails);

        // Clear cart and hide checkout popup
        cart.length = 0;
        totalPrice = 0;
        discountApplied = 0;
        updateCartDisplay();
        checkoutPopup.style.display = 'none';
        alert("Order placed successfully!");
    });

    // Cancel the checkout and hide the checkout popup
    cancelCheckout.addEventListener('click', function () {
        checkoutPopup.style.display = 'none';
        cart.length = 0;
        totalPrice = 0;
        discountApplied = 0;
        checkoutSummary.innerHTML = '';
        updateCartDisplay();
        alert("Order canceled and cart cleared.");
    });

    // Initial display setup
    updateCartDisplay();
});
