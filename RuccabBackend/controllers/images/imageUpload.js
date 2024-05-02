const cloudinary = require("../../utils/cloudinary");
const upload = require("../../middleware/multer");
const express = require("express");
const Student = require("../../models/students.models");
const { auth } = require("../../middleware/auth");
const router = express.Router();
router.use(auth);

router.post("/upload", upload.single("image"), async function (req, res) {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const userId = req.student.id;

    const updatedUser = await Student.findByIdAndUpdate(
      userId,
      { profilePicture: result.public_id ,
        profilePictureLink: result.secure_url},
      
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in uploading user profile picture",
    });
  }
});

router.get("/profile-picture", async function (req, res) {
  const userId = req.student.id;

  try {
    // Retrieve the user's profile picture public ID from the database
    const user = await Student.findById(userId);

    if (!user || !user.profilePictureLink) {
      return res.status(404).json({
        success: false,
        message: "User profile picture not found",
      });
    }

    const profilePictureLink = user.profilePictureLink;

    res.status(200).json({
      success: true,
      message: "User profile picture retrieved successfully",
      data: {
        profilePictureLink: profilePictureLink,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in retrieving user profile picture",
    });
  }
});

// Delete profile picture
router.delete("/delete", async function (req, res) {
  try {
    const userId = req.student.id;
    const user = await Student.findById(userId);

    if (!user || !user.profilePicture) {
      return res.status(404).json({
        success: false,
        message: "User profile picture not found",
      });
    }

    const publicId = user.profilePicture;

    // Delete profile picture from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Update user's profilePicture field in the database
    user.profilePicture = "";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in deleting profile picture",
    });
  }
});

// Edit profile picture
router.put("/edit", upload.single("image"), async function (req, res) {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const userId = req.student.id;

    const user = await Student.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete current profile picture from Cloudinary
    if (user.profilePicture) {
      await cloudinary.uploader.destroy(user.profilePicture);
    }

    // Update user's profilePicture field in the database
    user.profilePicture = result.public_id;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in updating profile picture",
    });
  }
});

module.exports = router;
