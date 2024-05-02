const Student = require("../../../models/students.models");
const bcrypt = require("bcrypt");
const University = require("../../../models/universities.models");
const License = require("../../../models/license.models");
const Car = require("../../../models/car.models");


exports.getStudentProfileInfo = async (req, res) => {
  //profile: username, email,university,branch, gender, birthday, faculty
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(400).send({ message: "Student does not exist" });
    }

    // Return the branches of the university
    const info = {
      fname: student.first_name,
      lname: student.last_name,

      university: student.university,
      branch: student.uni_branch,
      faculty: student.faculty,
      gender: student.gender,
      birthday: student.birthday,
    };

    return res.status(200).json({ info });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal server error." });
  }
};

exports.updateSomeOfUserProfile = async (req, res) => {
  try {
    const studentId = req.student.id;

    // Define an array of allowed fields that can be updated
    const allowedFields = [
      "first_name",
      "Last_name",
      "faculty",
      "phone_number",
      "birthday",
    ];

    const user = await Student.findById(req.student.id);

    if (user.faculty != req.body.faculty) {
      const foundUniversity = await University.findOne({
        name: user.university,
      });
      for (var i = 0; i < foundUniversity.faculty.length; i++) {
        if (foundUniversity.faculty[i].faculty === req.body.faculty) {
          req.body.facultyYears = foundUniversity.faculty[i].years + 2;
        }
      }
    }

    const updatedFields = req.body; // Assuming the updated fields are provided in the request body

    // Filter out any fields that are not present in the allowedFields array
    const filteredFields = Object.keys(updatedFields)
      .filter((field) => allowedFields.includes(field))
      .reduce((obj, field) => {
        obj[field] = updatedFields[field];
        return obj;
      }, {});

    // Check if any allowed fields are provided for update
    if (Object.keys(filteredFields).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    const student = await Student.findByIdAndUpdate(studentId, filteredFields, {
      new: true,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({ student });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const studentId = req.student.id;
    // Body contains current_password, new_password, confirm_new_password.
    const { current_password, new_password, confirm_new_password } = req.body;

    // Retrieve the student from the database
    const student = await Student.findById(studentId);

    const validatePassword = await bcrypt.compare(
      req.body.current_password,
      student.password
    );
    //const validatePassword = await Student.comparePasswords(req.body.password,Student.password);
    if (!validatePassword) {
      return res
        .status(400)
        .json({
          message:
            "Password is incorrect.Please make sure entered your old password correctly.",
        });
    }

    // Check if the new password and confirm new password match
    if (new_password !== confirm_new_password) {
      return res
        .status(400)
        .json({
          message: "New password and confirm new password do not match.",
        });
    }

    // Update the student's password
    const encryptPass = await bcrypt.genSalt(12);
    req.body.new_password = await bcrypt.hash(
      req.body.new_password,
      encryptPass
    );

    student.password = req.body.new_password;
    await student.save();

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal server error." });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const studentId = req.student.id;

    // Find the student by ID
    const deletedStudent = await Student.findById(studentId);

    if (!deletedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Delete the student's license, car, and profile picture
    if (deletedStudent.haveALicenseVerify) {
      // Delete the license here (assuming you have a separate License model)
      await License.findOneAndDelete({ student: studentId });
    }

    if (deletedStudent.haveACar) {
      // Delete the car here (assuming you have a separate Car model)
      await Car.findOneAndDelete({ student: studentId });
    }

    // Delete the student's profile picture
    if (deletedStudent.profilePicture) {
      const publicId = deletedStudent.profilePicture;

      // Delete profile picture from Cloudinary
      await cloudinary.uploader.destroy(publicId);

      deletedStudent.profilePicture = undefined;
      await deletedStudent.save();
    }

    // Delete the student account
    await Student.deleteOne({ _id: studentId });

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting Student:", error);
    res.status(500).json({ error: "Failed to delete Student" });
  }
};
