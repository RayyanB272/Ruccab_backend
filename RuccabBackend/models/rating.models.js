const mongoose = require("mongoose");

// Rating schema
const ratingSchema = new mongoose.Schema({
  raterId: String, // ID of the rating party
  ratedId: String, // ID of the party being rated
  stars: {
    type: Number,
    min: 1,
    max: 5,
  },
});

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;
