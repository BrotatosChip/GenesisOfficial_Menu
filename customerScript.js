document.addEventListener("DOMContentLoaded", function () {
    const cart = [];
    let totalPrice = 0;
    const conversionRate = 4000;

    // Telegram Bot Config
    const telegramBotToken = "7809999917:AAFjpVxgcLASnwcK6F6NMA5815j3wXPDMcE";
    const telegramGroupChatId = "-1001921593847"; // Fixed incorrect formatting

    // Select DOM elements
    const addToCartButtons = document.querySelectorAll(".addToCartButton");
    const cartList = document.getElementById("cartList");
    const totalPriceDisplay = document.getElementById("totalPrice");
    const checkoutButton = document.getElementById("checkoutButton");
    const checkoutPopup = document.getElementById("checkoutPopup");
    const checkoutSummary = document.getElementById("checkoutSummary");
    const checkoutTotalPrice = document.getElementById("checkoutTotalPrice");
    const confirmCheckout = document.getElementById("confirmCheckout");
    const cancelCheckout = document.getElementById("cancelCheckout");

    // Form Inputs
    const customerNameInput = document.getElementById("customerName");
    const customerClassInput = document.getElementById("customerClass");
    const customerPhoneInput = document.getElementById("customerPhone");
    const deliveryMethodSelect = document.getElementById("deliveryMethod");
    const specialInstructionsInput = document.getElementById("specialInstructions");

    // Optional: Phone number dropdown selection
    const phoneOptionSelect = document.getElementById("phoneOption");

    // Function to format and validate Cambodian phone numbers
    const formatPhoneNumber = (phoneNumber) =>
        phoneNumber.startsWith("0") && phoneNumber.length >= 9
            ? `+855${phoneNumber.slice(1)}`
            : phoneNumber;

    const isValidCambodianPhone = (phoneNumber) =>
        /^\+855\d{8,9}$/.test(formatPhoneNumber(phoneNumber));

    // Show/hide the phone number input based on selection
    phoneOptionSelect.addEventListener('change', function () {
        if (phoneOptionSelect.value === "hasPhone") {
            customerPhoneInput.style.display = "block"; // Show phone input
        } else {
            customerPhoneInput.style.display = "none"; // Hide phone input
        }
    });

    // Function to update the cart display
    const updateCartDisplay = () => {
        cartList.innerHTML = "";
        cart.forEach((item, index) => {
            const li = document.createElement("li");

            li.innerHTML = ` 
                <div class="quantity-container">
                    <button class="quantity-button decreaseQuantity" data-index="${index}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-button increaseQuantity" data-index="${index}">+</button>
                </div>
                <p>${item.food} ($${item.price.toFixed(2)})</p>
            `;

            cartList.appendChild(li);
        });

        const totalPriceKHR = totalPrice * conversionRate;
        totalPriceDisplay.textContent = `$${totalPrice.toFixed(2)} (៛${totalPriceKHR.toLocaleString()})`;

        // Add event listeners for quantity buttons
        document.querySelectorAll(".increaseQuantity").forEach((button) => {
            button.addEventListener("click", function () {
                const index = this.getAttribute("data-index");
                cart[index].quantity += 1;
                totalPrice += cart[index].price;
                updateCartDisplay();
            });
        });

        document.querySelectorAll(".decreaseQuantity").forEach((button) => {
            button.addEventListener("click", function () {
                const index = this.getAttribute("data-index");
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                    totalPrice -= cart[index].price;
                } else {
                    totalPrice -= cart[index].price;
                    cart.splice(index, 1);
                }
                updateCartDisplay();
            });
        });
    };

    addToCartButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const food = this.getAttribute("data-food");
            const price = parseFloat(this.getAttribute("data-price"));

            const existingItem = cart.find((item) => item.food === food);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ food, price, quantity: 1 });
            }

            totalPrice += price;
            updateCartDisplay();
        });
    });

    checkoutButton.addEventListener("click", function () {
        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }
        checkoutPopup.style.display = "block";
        checkoutSummary.innerHTML = "";
        cart.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = `${item.food} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
            checkoutSummary.appendChild(li);
        });

        const checkoutTotalPriceKHR = totalPrice * conversionRate;
        checkoutTotalPrice.textContent = `$${totalPrice.toFixed(2)} (៛${checkoutTotalPriceKHR.toLocaleString()})`;
    });

    const sendTelegramMessage = (message) => {
        fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: telegramGroupChatId, text: message }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (!data.ok) {
                    console.error("Error sending Telegram message:", data);
                }
            })
            .catch((error) => {
                console.error("Error sending Telegram message:", error);
            });
    };

    confirmCheckout.addEventListener("click", function () {
        let orders = JSON.parse(localStorage.getItem("foodOrders")) || {};

        const customerName = customerNameInput.value.trim();
        const customerClass = customerClassInput.value.trim();
        let customerPhone = customerPhoneInput.value.trim();
        const deliveryMethod = deliveryMethodSelect.value;
        const specialInstructions = specialInstructionsInput.value.trim();
        const phoneOption = phoneOptionSelect.value;

        if (!customerName || !customerClass) {
            alert("Please fill in all the required fields.");
            return;
        }

        if (phoneOption === "hasPhone") {
            if (!customerPhone || !isValidCambodianPhone(customerPhone)) {
                alert("Please enter a valid Cambodian phone number (e.g., 012345678 or +85512345678).");
                return;
            }
            customerPhone = formatPhoneNumber(customerPhone); // Format phone number if provided
        }

        if (!orders[customerName]) {
            orders[customerName] = [];
        }

        let orderDetails = `🛒 *New Order Placed* 🛒\n👤 Customer: ${customerName}\n🏫 Class or Address: ${customerClass}\n`;

        if (phoneOption === "hasPhone") {
            orderDetails += `📞 Phone Number: ${customerPhone}\n`;
        } else {
            orderDetails += `📞 Phone Number: Not Provided\n`;
        }

        orderDetails += `📦 Method: ${deliveryMethod}\n`;

        cart.forEach((item) => {
            orders[customerName].push({ food: item.food, price: item.price, quantity: item.quantity });
            orderDetails += `🍪 ${item.food} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
        });

        orderDetails += `\n💰 Total: $${totalPrice.toFixed(2)} (៛${(totalPrice * conversionRate).toLocaleString()})`;

        if (specialInstructions) {
            orderDetails += `\n✍️ Special Instructions: ${specialInstructions}`;
        }

        localStorage.setItem("foodOrders", JSON.stringify(orders));
        sendTelegramMessage(orderDetails);
        cart.length = 0;
        totalPrice = 0;
        updateCartDisplay();
        checkoutPopup.style.display = "none";
        alert("Order placed successfully!");
    });

    cancelCheckout.addEventListener("click", function () {
        checkoutPopup.style.display = "none";
        alert("Order canceled.");
    });

    updateCartDisplay();
});
