const Ride = require("../../models/ride.models");
const Student = require("../../models/students.models");

exports.getRides = async (req, res) => {
  try {
    const now = new Date(Date.now());
    const date = now.toISOString().split("T")[0];
    const { destination } = req.body; // Get the destination from the request body
    
    // Pagination
    const page = req.query.page || 1;
    const ridesPerPage = req.query.limit || 10;

    // Count the total number of rides matching the date and destination
    let totalRides = await Ride.countDocuments({ date, destination });

    let totalPages = Math.ceil(totalRides / ridesPerPage);

    // Find rides matching the date and destination, with pagination
    let rides = await Ride.find({ date, destination })
      .skip((page - 1) * ridesPerPage)
      .limit(ridesPerPage);

    return res.status(200).json({ data: rides, totalRides, totalPages });
  } catch (error) {
    console.error("Error getting rides:", error);
    res.status(500).json({ error: "Failed to get rides" });
  }
};

exports.getRideDetails = async (req, res) => {
  try {
    // Retrieve the ride ID from the request body
    const rideId = req.body.rideId;

    // Fetch the ride details from the database based on the ride ID
    const ride = await Ride.findOne({ _id: rideId });

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Return the ride details
    return res.status(200).json({ ride });
  } catch (error) {
    console.error("Error getting ride:", error);
    return res.status(500).json({ error: "Failed to get ride details" });
  }
};

exports.bookARide = async (req, res) => {
  try {
    const { rideId } = req.body;
    const studentId = req.student.id; 

    // Fetch the ride details from the database based on the ride ID
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Check if the ride is already at full capacity
    if (ride.passengers.length >= ride.preferences.capacity) {
      return res.status(400).json({ error: "Ride is already at full capacity" });
    }

    // Add the student to the passengers list
    ride.passengers.push(studentId);

    // Save the updated ride with the added passenger
    const updatedRide = await ride.save();

    res.status(200).json({ message: "Ride booked successfully", ride: updatedRide });
  } catch (error) {
    console.error("Error booking ride:", error);
    res.status(500).json({ error: "Failed to book ride" });
  }
};

exports.countRide = async (req, res) => {
  try {
    const countRide = await Ride.countDocuments();
    res.json({ count: countRide });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a ride
exports.deleteRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    // Find the ride by its ID and delete it
    const deletedRide = await Ride.findByIdAndDelete(rideId);

    if (!deletedRide) {
      return res.status(404).json({ error: "Ride not found" });
    }

    res.status(200).json({ message: "Ride deleted successfully" });
  } catch (error) {
    console.error("Error deleting ride:", error);
    res.status(500).json({ error: "Failed to delete ride" });
  }
};
