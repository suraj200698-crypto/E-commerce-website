const API_URL = "https://e-commerce-website-i3qw.onrender.com";

export const startRazorpayPayment = async (amount) => {
  try {
    // 1. Backend se Razorpay Order create karo
    const response = await fetch(`${API_URL}/api/payment/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Order creation failed");
    }

    const order = data.order;

    // 2. Razorpay Checkout options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,

      amount: order.amount,
      currency: order.currency,

      name: "Suraj E-Commerce",
      description: "E-Commerce Order",

      order_id: order.id,

      handler: function (paymentResponse) {
        console.log("Payment Successful:", paymentResponse);

        alert("Payment Successful!");
      },

      prefill: {
        name: "Suraj Kumar",
        email: "test@example.com",
        contact: "9999999999",
      },

      theme: {
        color: "#3399cc",
      },
    };

    // 3. Razorpay Checkout open karo
    const razorpay = new window.Razorpay(options);

    razorpay.open();
  } catch (error) {
    console.error("Payment Error:", error);
    alert(error.message);
  }
};