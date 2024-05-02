const mongoose = require("mongoose");
const crypto = require("crypto");

const studentSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "please provide first_name"],
      trim: true,
      minlength: 3,
      maxlength: 20,
    },

    last_name: {
      type: String,
      required: [true, "please provide last name"],
      trim: true,
      minlength: 3,
      maxlength: 20,
    },

    email: {
      type: String,
      validate: {
        validator: function (value) {
          // Custom email validation logic
          const emailRegex =
            /^[a-zA-Z0-9._%+-]+@student\.[a-zA-Z]{2,}\.edu\.lb$/;
          return emailRegex.test(value);
        },
        message:
          "Please provide a valid student email in the form 'examplename@student.collegenameabbreviation.edu.lb'",
      },

      required: [true, "Email is required"],
      unique: true,
      trim: true,
    },

    profilePicture: {
      type: String,
    },

    profilePictureLink: {
      type: String,
    },

    endOfFacultyYearsVerification: { // as long as faculty years did not end then it is true
      type: Boolean,
      default : true,

    },

    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
    },

    faculty: {
      type: String,
      required: [true, "Faculty is required"],
      trim: true,
    },
    facultyYears: { //extracted from college db where each faculty is saved with its years
      type: Number,
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      trim: true,
      enum: ["female", "male"],
      lowercase: true,
    },

    numberOfFailedLogins: {
      type: Number,
      default: 0,
    },

    university: {
      type: String,
    },

    uni_branch: {
      type: String,
    },

    phone_number: {
      type: Number,
      required: [true, "please provide phone_number"],
      trim: true,
      minlength: 3,
      maxlength: 20,
    },

    wallet: {
      type: Number,
      default: 50,
    },
    

    createARideVerify:{ //(boolean if and only if he has a car and a license then he can create a ride )
      type: Boolean,
      default: false,
    },

    haveACar:{ //(boolean if and only if he has a car )
      type: Boolean,
      default: false,
    },

    haveALicenseVerify:{ //(boolean if and only if he has license then he can add a car )
      type: Boolean,
      default: false,
    },

    verified: {
      type: Boolean,
      default: false,
    },
    verification_code: {
      type: String,
    },
    verification_validity: {
      type: Date,
    },

    forgetPasswordCode: String,
    forgetPasswordCodeExpiration: Date,
  },

  { timestamps: true }
);

//get Reset Password Code Function

studentSchema.methods.getResetPasswordCodeFunction = function () {
  const resetCode = Math.floor(Math.random() * 900000) + 100000;

  //hashed
  this.forgetPasswordCode = crypto
    .createHash("sha256")
    .update(resetCode.toString())
    .digest("hex");

  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + 20);
  this.forgetPasswordCodeExpiration = expirationDate;

  return resetCode;
};

//get verification code

studentSchema.methods.getVerificationCodeFunction = function () {
  const verificationCode = Math.floor(Math.random() * 900000) + 100000;

  //hashed
  this.verification_code = crypto
    .createHash("sha256")
    .update(verificationCode.toString())
    .digest("hex");

  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + 10);
  this.verification_validity = expirationDate;

  return verificationCode;
};

module.exports = mongoose.model("student", studentSchema);
