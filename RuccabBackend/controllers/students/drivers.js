const License = require("../../models/license.models");
const Car = require("../../models/car.models");
const Student = require("../../models/students.models");
const Ride = require("../../models/ride.models");

exports.completeRide = async (req, res) => {
  try {
    const { rideId} = req.body;
    const driverId = req.student.id;
    const driver = await Student.findById(driverId);

    // Fetch the ride details from the database based on the ride ID
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    if(ride.completed == true){
      return res.status(404).json({ error: "Ride already completed" });
    }
    
    // Set the ride as completed
    ride.completed = true;

    const rideCost = ride.profit;
    driver.wallet += rideCost;

    await driver.save();


    // Save the updated ride
    const updatedRide = await ride.save();

    res.status(200).json({ message: "Ride completed successfully", ride: updatedRide });
  } catch (error) {
    console.error("Error completing ride:", error);
    res.status(500).json({ error: "Failed to complete ride" });
  }
};

exports.checkDriverIfVerified = async (req, res) => {
  try {
    const license = await License.findOne({ ownerId: req.student.id });
    const car = await Car.findOne({ owner_id: req.student.id });

    if (!license) {
      return res
        .status(400)
        .json({
          message:
            "License is required. Please add your license information in the menu page.",
        });
    }

    /*if (!license.verified) {
        return res.status(400).json({ message: "License is not verified." });
      }*/

    if (!car) {
      return res
        .status(400)
        .json({
          message:
            "You do not have a car. Please add your car in the menu page",
        });
    }

    // All validations passed
    await Student.updateOne(
      { _id: req.student.id },
      { createARideVerify: true }
    );

    return res
      .status(200)
      .json({
        message:
          "All validations passed. Driver can continue creating his/her ride.",
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.AcceptOrRejectPassenger = async (req, res) => {
  try {
    const { rideId, passengerId, decision } = req.body;

    // Fetch the ride details from the database based on the ride ID
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Check if the passenger exists in the ride's passengers list
    const passengerIndex = ride.passengers.findIndex(
      (passenger) => passenger.toString() === passengerId
    );

    if (passengerIndex !=-1) {
      return res.status(400).json({ error: "Passenger already in the ride" });
    }

    const passenger = await Student.findById(passengerId);
    // Perform the driver's decision logic
    if (decision === "accept") {
      
        // Deduct the profit from the passenger's wallet
        
        const rideCost = ride.profit;
        passenger.wallet -= rideCost;

        // Add the passenger to the passengers list permanently
        ride.passengers.push(passengerId);
        ride.pendingPassengers.splice(passengerIndex, 1);
      
    } else if (decision === "reject") {

      // Remove the passenger from the passengers list
      ride.pendingPassengers.splice(passengerIndex, 1);
    } else {
      return res.status(400).json({ error: "Invalid decision" });
    }

    // Save the updated ride and passenger
    await Promise.all([ride.save(), passenger.save()]);

    res.status(200).json({ message: "Passenger updated successfully" });
  } catch (error) {
    console.error("Error accepting/rejecting passenger:", error);
    res.status(500).json({ error: "Failed to update passenger" });
  }
};

exports.getPendingPassengers = async (req, res) => {
  try {
    const { rideId } = req.body;

    // Fetch the ride details from the database based on the ride ID
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Fetch the pending passengers' details with profile picture link
    const pendingPassengers = await Student.find({
      _id: { $in: ride.pendingPassengers },
    }).select("-_id first_name last_name email phone_number university profilePictureLink");

    res.status(200).json({ pendingPassengers });
  } catch (error) {
    console.error("Error getting pending passengers:", error);
    res.status(500).json({ error: "Failed to get pending passengers" });
  }
};

exports.AcceptOrRejectPassenger = async (req, res) => {
  try {
    

  } catch (error) {
    
  }
};
