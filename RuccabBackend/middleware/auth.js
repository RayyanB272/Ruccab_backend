const jsonwebtoken = require("jsonwebtoken");
const { promisify } = require("util");
const Student = require("../models/students.models");

exports.auth = async (req, res, next) => {
  try {
    // check if student token exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Bearer ndnvoiuwejiosdjfoifp
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    // token verification
    let decoded;
    try {
      decoded = await promisify(jsonwebtoken.verify)(token, process.env.ACCESS_JWTOKEN);
    } catch (err) {
      if (err.name === "JsonWebTokenError") {
        console.log(err);
      
        return res
          .status(401)
          .json({ message: "Invalid authentication token" });
          
      } else if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Your session expired. Please login again" });
      }
      
    }

    if (!decoded) {
      return res.status(401).json({ message: "Invalid authentication token" });
      
    }

    // check if user still exists (incase el user 3emel delete la their account)
    const student = await Student.findById(decoded.id);

    if (student) {
      // Add the valid logged in user to other requests
      delete student.password;
      //check major years if expired when was it created + years

      req.student = student;
      return next();
    } else {
      return res.status(401).json({ message: "student account not found."});
    }
  } catch (error) {
    next(error);
  }
};
