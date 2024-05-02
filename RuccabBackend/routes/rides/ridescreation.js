const express = require("express");
const router = express.Router();
const Ride = require("../../models/ride.models"); // Import Ride model
const Student = require("../../models/students.models");
const Car = require("../../models/car.models");
const { auth } = require("../../middleware/auth");
const rideController = require("../../controllers/students/ride");
const driverController = require("../../controllers/students/drivers");
const passengerController = require("../../controllers/students/passengers");
router.use(auth);

// Route to handle ride creation
router.post("/rides", async (req, res) => {
  try {
    const driverId = req.student.id;
    const student = await Student.findOne({ _id: driverId });
    if (student.createARideVerify == false) {

      return res.status(500).json({ error: "Please be sure you entered a car and your license information from the menu tab.Thank you." });

    }
    // Extract ride data from request body
    const {
      startPoint,
      destination,
      time,
      carId, // check if carId exists in database + tkun el car belongs lal driver
      preferences,
      profit,
    } = req.body;

    // Validate input (e.g., check if required fields are present)
    if (!startPoint || !destination || !time || !carId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the carId exists in the database and belongs to the driver
    const car = await Car.findOne({ _id: carId, owner_id: driverId });

    if (!car) {
      return res
        .status(404)
        .json({ error: "Car not found or does not belong to the driver" });
    }

    let date = new Date();

    date = date.toISOString().split("T")[0];
    // Create a new ride instance
    const newRide = new Ride({
      startPoint,
      destination,
      date : date,
      time,
      driverId : driverId, //student id from token const ownerId = req.student.id;
      carId,
      preferences,
      profit,
    });

    // Save the ride to the database
    await newRide.save();

    res
      .status(201)
      .json({ message: "Ride created successfully", ride: newRide });
  } catch (error) {
    console.error("Error creating ride:", error);
    res.status(500).json({ error: "Failed to create ride" });
  }
});

router.post("/completeRide", driverController.completeRide);
router.get("/getRideDetails", rideController.getRideDetails);
router.get("/showRide", rideController.getRides);
router.post("/AcceptOrRejectPassenger" , driverController.AcceptOrRejectPassenger);
router.get("/countRide" , rideController.countRide);
router.get("/getPendingPassengers" , driverController.getPendingPassengers);
router.post("/requestARide" , passengerController.requestARide);
router.delete("/rides/:rideId", rideController.deleteRide);


// Export router
module.exports = router;

