const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const univerityController = require("../controllers/universities/universitiesData"); 



router.post("/addUni", univerityController.addUniversity);
router.post("/addEmail", univerityController.addEmailToUniversity);


//router.use(auth);
router.post('/universityBranches', univerityController.getUniversityBranches);
router.post('/updateStudentBranch', univerityController.updateStudentUniversityBranch);
router.get("/countUniversity" , univerityController.countUniversity);

//router.post("/universityBranches", univerityController.getUniversityBranches);




module.exports = router;
