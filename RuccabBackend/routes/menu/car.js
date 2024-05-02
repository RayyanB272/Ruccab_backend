const express = require("express");
const router = express.Router();
const { auth } = require("../../middleware/auth");
const carController = require("../../controllers/students/menu/car");
const cloudinary = require("../../utils/cloudinary");
const upload = require("../../middleware/multer");
const Student = require("../../models/students.models");


// Protected routes (requires authentication)
router.use(auth);

// Create a new car
router.post("/cars", carController.addCar);

// Get all cars
router.get("/cars", carController.getAllCars);

// Route for counting cars
router.get('/count', carController.countCars);

// Get a single car by ID
router.get("/cars/:id", carController.getCarById);

// Update a car by ID
router.put("/cars/:id", carController.updateCar);

// Delete a car by ID
router.delete("/cars/:id", carController.deleteCar);



// Define the route for adding license information
router.post('/licenses',upload.single("image"), carController.addLicenseInfo); 

router.get("/getlicense", carController.getLicenseInfo);

router.get("/getAllLicenses", carController.getAllLicenseInfo);

module.exports = router;