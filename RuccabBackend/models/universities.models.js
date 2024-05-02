const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  branches: {
    type: [String],
    required: [true, "Branches are required"],
  },
  
  emails: {
    
        type: [String],
        required: true,
        validate: {
          validator: function ([email]) {
            // Regular expression pattern to match the required email format
            const emailRegex = /^[\w-]+@student\.bau\.edu\.lb$/;

            return emailRegex.test(email);
          },
          message: "Email must be of the form johndoe@student.bau.edu.lb",
        },
  },

  faculty: [
    {
      faculty: { type: String },
      years: { type: Number },
      // Add more properties as needed
    },
  ],

  birthday: {
    type: Date,
  },

});

const University = mongoose.model("University", universitySchema);

module.exports = University;