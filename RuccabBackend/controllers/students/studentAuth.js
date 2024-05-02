const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Student = require("../../models/students.models");
const University = require("../../models/universities.models");
const emailService = require("../../utils/emailVerification");
const crypto = require("crypto");
const getCollegeFromEmail = require("../../utils/extractCollegeFromEmail");
const dotenv = require("dotenv").config();

exports.studentAuth = async (req, res, next) => {
  try {
    const { email } = req.body;

    //check if email already exists
    const student = await Student.findOne({ email: req.body.email });
    if (student) {
      return res.status(400).json({ message: "User already exists!" });
    }
    const college = getCollegeFromEmail(req.body.email);

    const foundUniversity = await University.findOne({ name: college });
    if (!foundUniversity) {
      return res.status(400).json({ message: "University not found" });
    }


    if (!foundUniversity.emails.includes(email)) {
      return res.status(400).json({ message: "Email not found in university" });
    }

    //faculty years code to be <3

    for (var i = 0; i < foundUniversity.faculty.length; i++) {
      if (foundUniversity.faculty[i].faculty === req.body.faculty) {
        req.body.facultyYears =  foundUniversity.faculty[i].years +2;
      }
    }
    //check if password and confirm password same or not

    if (req.body.password !== req.body.confirmPassword) {
      return res
        .status(400)
        .json({ message: "password and confirm password are not identical" });
    }

    // Check if password length is greater than or equal to 8
    if (req.body.password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    //encrypt password

    const encryptPass = await bcrypt.genSalt(12);
    req.body.password = await bcrypt.hash(req.body.password, encryptPass);

    //create student

    const newStudent = await Student.create(req.body);
    newStudent.university = college;

    //verification email
    const validationCode = newStudent.getVerificationCodeFunction();
    await newStudent.save({});
    const text = `Your validation code is \n validation code: ${validationCode}`;

    try {
      await emailService.emailVerification({
        email: newStudent.email,
        subject: "Email validation code.(valid for 10 minutes)",
        text: text,
      });

      return res
        .status(200)
        .json({ message: "Validation code sent successfully." });
    } catch (err) {
      console.log(err);

      newStudent.verification_code = undefined;
      newStudent.verification_validity = undefined;
      return res.status(500).send({
        success: false,
        message: "Verification failed.",
      });
    }

    //end of faculty year verfication
    

  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err.message });
  }
}; //end of signup

exports.login = async (req, res, next) => {
  try {
    // user exist or no
    const student = await Student.findOne({ email: req.body.email });
    if (!student) {
      return res.status(400).send({
        message: "User does not exist please sign up before logging in",
      });
    }

    //should be vaidated(send email)

    if (!student.verified) {
      const validationCode = student.getVerificationCodeFunction();
      await student.save({});
      const text = `Your validation code is \n validation code: ${validationCode}`;

      try {
        await emailService.emailVerification({
          email: student.email,
          subject: "Email validation code.(valid for 10 minutes)",
          text: text,
        });

        

        return res.status(409).json({
          message: "User not verified.Validation code sent successfully.",
        });


      } catch (err) {
        console.log(err);

        student.verification_code = undefined;
        student.verification_validity = undefined;
        return res.status(500).send({
          success: false,
          message:
            "User not verified, a validation email was unsuccessful please try again later",
        });
      }
    }

    if (student.numberOfFailedLogins >= 3) {
      return res.status(403).json({
        success: false,
        message: "Account locked. Please go to forgot password.", //forget password
      });
    }

    // validate lal password
    const validatePassword = await bcrypt.compare(
      req.body.password,
      student.password
    );
    //const validatePassword = await Student.comparePasswords(req.body.password,Student.password);
    if (!validatePassword) {
      student.numberOfFailedLogins += 1;
      await student.save();
      return res
        .status(400)
        .json({ message: "email or password is incorrect" });
    }

    //Access Token
    const accessToken =  jwt.sign(
      {
        id: student._id,
        
      },
      process.env.ACCESS_JWTOKEN,
      {
        expiresIn: process.env.EXPIRY_TIME_JWT
      },

    );

    return res.status(200).json({
      message: "login successful",
      accessToken: accessToken,
    });
    
    return res.status(200).send({
      success: true,
      message: "User is now verified.",
    });

  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "internal server error" });
  }
}; //end of login

//forgot password
exports.forgetPassword = async (req, res) => {
  try {
    // user exist or no
    const student = await Student.findOne({ email: req.body.email });
    if (!student) {
      return res
        .status(400)
        .send({ message: "User does not exist please sign up first" });
    }

    const resetCode = student.getResetPasswordCodeFunction();
    await student.save({});
    const text = `Your reset password code is \n reset code: ${resetCode}`;

    try {
      await emailService.emailVerification({
        email: student.email,
        subject: "Password reset code.(valid for 20 minutes)",
        text: text,
      });

      return res
        .status(200)
        .json({ message: "Reset password code sent successfully." });
    } catch (err) {
      console.log(err);

      student.forgetPasswordCode = undefined;
      student.forgetPasswordCodeExpiration = undefined;
      return res.status(500).send({
        success: false,
        message: "Reset password code failed.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "internal server error" });
  }
}; // end of forget password

exports.resetPassword = async (req, res) => {
  try {
    //student exists or no
    const student = await Student.findOne({ email: req.body.email });

    if (!student) {
      return res.status(400).send({
        success: false,
        message: "Student not found.",
      });
    }

    req.body.resetCode = crypto
      .createHash("sha256")
      .update(req.body.resetCode)
      .digest("hex");

    if (student.forgetPasswordCode !== req.body.resetCode) {
      return res.status(400).send({
        success: false,
        message: "Reset code does not match!",
      });
    }

    if (student.forgetPasswordCodeExpiration < Date.now()) {
      return res.status(400).send({
        success: false,
        message: "Reset password code expired.",
      });
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).send({
        success: false,
        message: "Password and confirm password does not match!",
      });
    }

    //hash the password
    const encryptPass = await bcrypt.genSalt(12);
    req.body.password = await bcrypt.hash(req.body.password, encryptPass);

    student.password = req.body.password;

    student.forgetPasswordCode = undefined;
    student.forgetPasswordCodeExpiration = undefined;

    if (student.numberOfFailedLogins == 3) {
      student.numberOfFailedLogins = 0;
    }
    await student.save();

    return res.status(200).send({
      success: true,
      message: "Password reset : successful.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "internal server error" });
  }
};

exports.validation = async (req, res) => {
  try {
    //student exists or no
    const student = await Student.findOne({ email: req.body.email });

    if (!student) {
      return res.status(400).send({
        success: false,
        message: "Student not found.",
      });
    }

    req.body.verification_code = crypto
      .createHash(process.env.HASH)
      .update(req.body.verification_code)
      .digest("hex");

    if (student.verification_validity < Date.now()) {
      return res.status(400).send({
        success: false,
        message: "Validation code expired.",
      });
    }

    if (student.verification_code !== req.body.verification_code) {
      return res.status(400).send({
        success: false,
        message: "Verification code does not match!",
      });
    }

    student.verified = true;

    student.verification_code = undefined;
    student.verification_validity = undefined;

    await student.save();

    
    //Access Token
    const accessToken =  jwt.sign(
      {
        id: student._id,
        
      },
      process.env.ACCESS_JWTOKEN,
      {
        expiresIn: process.env.EXPIRY_TIME_JWT
      },

    );

    return res.status(200).json({
      message: "login successful",
      accessToken: accessToken,
    });
    
    return res.status(200).send({
      success: true,
      message: "User is now verified.",
    });
    
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "internal server error" });
  }
};

exports.resendEmail = async (req, res) => {
  try {
    //body bte5od email and type 7asab iza reset password 2aw verification lal emaillllll
    const { email, type } = req.body;

    // user exist or no
    const student = await Student.findOne({ email: req.body.email });
    if (!student) {
      return res.status(400).send({ message: "User does not exist." });
    }

    //if email validation code is requested from bofy
    if (type == "email") {
      const validationCode = student.getVerificationCodeFunction();
      await student.save({});
      const text = `Your email validation code is \n validation code: ${validationCode}`;

      try {
        await emailService.emailVerification({
          email: student.email,
          subject: "Email validation code.(valid for 10 minutes)",
          text: text,
        });

        return res
          .status(200)
          .json({ message: "Validation code sent successfully." });
      } catch (err) {
        console.log(err);

        student.verification_code = undefined;
        student.verification_validity = undefined;
        return res.status(500).send({
          success: false,
          message: "Verification failed.",
        });
      }

      //if reset passsword email is requested to be resent
    } else if (type == "reset-password") {
      const resetCode = student.getResetPasswordCodeFunction();
      await student.save({});
      const text = `Your reset password code is \n reset code: ${resetCode}`;

      try {
        await emailService.emailVerification({
          email: student.email,
          subject: "Password reset code.(valid for 20 minutes)",
          text: text,
        });

        return res
          .status(200)
          .json({ message: "Reset password code sent successfully." });
      } catch (err) {
        console.log(err);

        student.forgetPasswordCode = undefined;
        student.forgetPasswordCodeExpiration = undefined;
        return res.status(500).send({
          success: false,
          message: "Reset password code failed.",
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "internal server error" });
  }
};

//count students
exports.countStudent= async (req, res) => {
  try {
    const countStudent = await Student.countDocuments();
    res.json({ count: countStudent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


