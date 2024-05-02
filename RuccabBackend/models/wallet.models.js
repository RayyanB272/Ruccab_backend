const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student", // Reference the student model
    required: [true, "Please provide an owner"],
  },
  money: {
    type: Number,
    default: 50,
  },
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
