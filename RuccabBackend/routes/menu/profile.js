const express = require("express");
const router = express.Router();
const { auth } = require("../../middleware/auth");
const profile = require("../../controllers/students/menu/profile");

//protected routes
router.use(auth);

router.post("/getInfo", profile.getStudentProfileInfo);
router.patch("/updateProfile", profile.updateSomeOfUserProfile);
router.put("/changePassword",  profile.changePassword);
router.delete("/deleteAccount" , profile.deleteAccount);


module.exports = router;
