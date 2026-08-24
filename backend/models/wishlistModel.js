import mongoose from "mongoose";

// ================= WISHLIST SCHEMA =================

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// ================= WISHLIST MODEL =================

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
