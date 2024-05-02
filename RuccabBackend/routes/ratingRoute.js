const express = require("express");
const router = express.Router();
const Rating = require("../models/rating.models");
const { auth } = require("../middleware/auth");
router.use(auth);

// Route to handle rating (both drivers and riders)
router.post("/rating", async (req, res) => {
  try {


    const raterId = req.student.id;
    // Extract rating data from request body
    const { ratedId, stars } = req.body;

    // Create a new rating instance
    const newRating = new Rating({
      raterId : raterId, // mn el token
      ratedId,// front end yb3tau y3ne bel body
      stars,
    });//validation rater and rated mawjodien

    // Save the rating to the database
    await newRating.save();

    res
      .status(201)
      .json({ message: "Rating saved successfully", rating: newRating });
  } catch (error) {
    console.error("Error saving rating:", error);
    res.status(500).json({ error: "Failed to save rating" });
  }
});

// Route to calculate average rating for a specific party (driver or rider)
router.get("/average/:partyId", async (req, res) => {
  try {
    const partyId = req.params.partyId;

    // Query the database for ratings of the specified party
    const ratings = await Rating.find({ ratedId: partyId });

    // Calculate the average rating
    let totalStars = 0;
    for (const rating of ratings) {
      totalStars += rating.stars;
    }
    const averageRating = ratings.length > 0 ? totalStars / ratings.length : 0;

    res.json({ averageRating });
  } catch (error) {
    console.error("Error calculating average rating:", error);
    res.status(500).json({ error: "Failed to calculate average rating" });
  }
});

// Export router
module.exports = router;
