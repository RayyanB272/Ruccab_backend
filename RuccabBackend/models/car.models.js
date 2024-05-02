const mongoose = require("mongoose");
const TinyColor = require("tinycolor2");
const Student = require("./students.models");

const carSchema = new mongoose.Schema({

  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student", // Reference the student model
    required: [true, "Please provide an owner"],
  },

  color: {
    type: String,
    validate: {
      validator: function (color) {
        const colorInfo = TinyColor(color);
        return colorInfo.isValid();
      },
      message: "Please provide a valid color",
    },
    required: [true, "Please provide the color"],
  },

  plate_number: {
    type: String,
    required: [true, "Please provide plate number"],
    trim: true,
    minlength: 4,
    maxlength: 9,
    validate: {
      validator: function (plateNumber) {
        const pattern = /^[A-Z] \d{6}$/;
        return pattern.test(plateNumber);
      },
      message: "Please provide a valid plate number in the format 'X 999999'",
    },
  },

  capacity: {
    type: Number, // changes every ride
    min: 1,
    max: 5,
  },

  model: {
    // or brand
    type: String,
    required: [true, "Please provide your car model"],
  },

  

  
});

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
