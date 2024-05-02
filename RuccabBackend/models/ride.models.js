// Import mongoose
const mongoose = require("mongoose");

// Define Ride schema
const rideSchema = new mongoose.Schema({
  startPoint: String, // which university gate
  destination: String, //which town eg mina abo samra...
  
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0], // Set the default value to the current date in "YYYY-MM-DD" format
  },

  profit: {
    type: Number,
    required: true,
  },

  time: {
    type: String,
    default: "", // Set the default value as an empty string
  },

  completed: {
    type: Boolean,
    default: false,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student", // Reference the student model
    required: true,
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car", // Reference the student model
    required: true,
  },
  preferences: {
    // required
    foodAllowed: Boolean,
    petAllowed: Boolean,
    capacity: Number,
    smokingAllowed: Boolean,
    riderGender: String
  },

  passengers: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    }],
    default: []
  },

  pendingPassengers: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    }],
    default: []
  },
  
});

// Create Ride model
const Ride = mongoose.model("Ride", rideSchema);

// Export Ride model
module.exports = Ride;