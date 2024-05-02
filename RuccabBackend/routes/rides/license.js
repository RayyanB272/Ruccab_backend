const express = require("express");
const router = express.Router();
const { auth } = require("../../middleware/auth");
const driver = require("../../controllers/students/drivers");

//protected routes
router.use(auth);

router.get("/checkDriverVerified",driver.checkDriverIfVerified);
module.exports = router;
