import React, { useState } from "react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email");
      return;
    }

    alert("Thank you for subscribing!");

    setEmail("");
  };

  return (
    <section className="py-16 bg-gray-900">

      <div className="max-w-4xl mx-auto px-4 text-center">

        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Subscribe to Our Newsletter
        </h2>

        <p className="text-gray-300 mt-3 mb-8">
          Get the latest products, offers and updates
          directly in your inbox.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
        >

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-5 py-3 rounded-lg outline-none"
          />

          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Subscribe
          </button>

        </form>

      </div>

    </section>
  );
};

export default NewsletterSection;