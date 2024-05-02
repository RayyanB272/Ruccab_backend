const License = require("../../models/license.models");
const Car = require("../../models/car.models");
const Student = require("../../models/students.models");
const Ride = require("../../models/ride.models");

exports.requestARide = async (req, res) => {
  try {
    const { rideId } = req.body;
    const studentId = req.student.id;

    // Fetch the ride details from the database based on the ride ID
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    if (ride.passengers.includes(studentId)) {
      return res
        .status(400)
        .json({ error: "Student is already booked for this ride" });
    }

    // Check if the ride is already at full capacity
    if (ride.passengers.length >= ride.preferences.capacity) {
      return res
        .status(400)
        .json({ error: "Ride is already at full capacity" });
    }

    // Add the student to the passengers list temporarily
    ride.pendingPassengers.push(studentId);

    // Save the updated ride with the added passenger temporarily
    const updatedRide = await ride.save();

    // Fetch the driver details
    const driver = await Student.findById(ride.driverId).select(
      "-password -numberOfFailedLogins -_id -endOfFacultyYearsVerification -facultyYears -createARideVerify -haveACar -haveALicenseVerify -verified -createdAt -university -updatedAt"
    );

    res.status(200).json({
      message: "Ride request sent to driver",
      ride: updatedRide,
      driver,
    });
  } catch (error) {
    console.error("Error requesting ride:", error);
    res.status(500).json({ error: "Failed to request ride" });
  }
};
