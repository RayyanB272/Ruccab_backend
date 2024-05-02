const mongoose = require('mongoose');
const Student = require("./students.models");

const licenseSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student", // Reference the student model
    required: true
  },
  
  dateCreated: {
    type: Date,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  vehicleClass: {
    type: String,
    required: true
  },
  licenseImage: {
    type: String,
  },

});

const License = mongoose.model('License', licenseSchema);

module.exports = License;