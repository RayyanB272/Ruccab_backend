const express = require("express");
const router = express.Router();
const studentAuthController = require("../../controllers/students/studentAuth");
const { auth } = require("../../middleware/auth");
//const profile = require("../controllers/students/profile")

router.post("/signup", studentAuthController.studentAuth);

router.post("/login", studentAuthController.login);

router.post("/forgetPassword", studentAuthController.forgetPassword);

router.patch("/resetPassword", studentAuthController.resetPassword);

router.patch("/validateEmail", studentAuthController.validation);

router.post("/resendEmail", studentAuthController.resendEmail );

router.get("/countStudents" , studentAuthController.countStudent);

/*
//protected routes
router.use(auth);

router.get("/dashboard", userDashboard);
router.post("/menu/profile",profile.getStudentProfileInfo );
router.patch("/menu/updateProfile/:studentId",profile.updateSomeOfUserProfile);*/

module.exports = router;
