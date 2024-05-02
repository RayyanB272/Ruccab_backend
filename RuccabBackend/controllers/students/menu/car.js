const Car = require("../../../models/car.models");
const Student = require("../../../models/students.models");
const License = require("../../../models/license.models");
const TinyColor = require("tinycolor2");
const cloudinary = require("../../../utils/cloudinary");
const upload = require("../../../middleware/multer");
const { auth } = require("../../../middleware/auth");
const express = require("express");
const router = express.Router();
router.use(auth);


exports.addCar = async (req, res) => {
  try {
    const { color, plate_number, capacity, model } = req.body;

    const ownerId = req.student.id;
    const student = await Student.findOne({ _id: ownerId });
    if(student.haveALicenseVerify == false){
      return res.status(400).send({ message: "You do not have a license.Please add your license from menu." });
    }

    const isColorValid = validateColor(color);

    console.log(isColorValid);

    if (isColorValid == false) return "Color is not valid";

    const car = new Car({
      owner_id: ownerId,
      color,
      plate_number,
      capacity,
      model
    });

    student.haveACar = true;
    if(student.haveALicenseVerify == true) student.createARideVerify = true;
    await student.save();

    const savedCar = await car.save();

    res.status(201).json(savedCar);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Controller for fetching all cars
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find({ owner_id: req.student._id });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.countCars = async (req, res) => {
  try {
    const carCount = await Car.countDocuments();
    res.json({ count: carCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for fetching a single car by ID
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      owner_id: req.student._id,
    });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const validateColor = (color) => {
  const colorInfo = TinyColor(color);
  return colorInfo.isValid();
};

// Controller for updating a car by ID
exports.updateCar = async (req, res) => {
  try {
    const { color, plate_number, capacity, model, image } = req.body;

    const isColorValid = validateColor(color);

    if (isColorValid == false)
      return res.status(400).json({ message: "Color not valid" });

    const car = await Car.findOne({
      _id: req.params.id,
      owner_id: req.student._id,
    });

    car.color = color;
    car.plate_number = plate_number;
    car.capacity = capacity;
    car.model = model;
    car.image = image;
    await car.save();

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for deleting a car by ID
exports.deleteCar = async (req, res) => {
  try {
    console.log(req.student._id);
    const car = await Car.findOne({
      _id: req.params.id,
      owner_id: req.student._id,
    });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    await car.deleteOne();

    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addLicenseInfo = async (req, res) => {
  try {
    const { dateCreated, expirationDate, vehicleClass } = req.body;
    const ownerId = req.student.id;
    const student = await Student.findOne({ _id: ownerId });

    // Create a new license document
    const license = new License({
      ownerId: ownerId,
      dateCreated,
      expirationDate,
      vehicleClass,
    });

    if (!req.file) {
      return res.status(400).json({ message: "License image is required." });
    }

    // Upload the license image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    const licenseImagePublicId = result.public_id;

    // Save the license image public ID in the license document
    license.licenseImage = licenseImagePublicId;

    // Save the license document
    student.haveALicenseVerify = true;
    if (student.haveACar == true) student.createARideVerify = true;
    await student.save();
    await license.save();

    return res
      .status(200)
      .json({ message: "License information added successfully." });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal server error." });
  }
};

exports.getLicenseInfo = async (req, res) => {
  try {
    const ownerId = req.student.id;
    const license = await License.findOne({ ownerId });

    if (!license) {
      return res.status(404).json({ message: "License information does not exist." });
    }

    return res.status(200).json({ license });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal server error." });
  }
};

exports.getAllLicenseInfo = async (req, res) => {
  try {
    const licenses = await License.find();

    return res.status(200).json({ licenses });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal server error." });
  }
};