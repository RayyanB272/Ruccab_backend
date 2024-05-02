const University = require("../../models/universities.models");
const Student = require("../../models/students.models");
exports.addUniversity = async (req, res) => {

  try {
    const { name, branches, emails, faculty } = req.body;

    // Create a new university instance
    const university = new University({
      name: name,
      branches: branches,
      emails: emails,
      faculty: faculty,
    });

    // Save the university to the database
    const savedUniversity = await university.save();

    return res.status(201).json({ university: savedUniversity });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal server error." });
  }


}



exports.addEmailToUniversity = async (req, res) => {
  try {
    const { name, newEmails } = req.body;

    // Retrieve the existing university document
    const university = await University.findOne({ name: name });
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    // Validate the newEmails array
    const emailRegex = /^[\w-]+@student\.bau\.edu\.lb$/;
    const invalidEmails = newEmails.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Filter out existing emails from the newEmails array
    const uniqueNewEmails = newEmails.filter(
      (email) => !university.emails.includes(email)
    );

    // Add the unique new emails to the existing emails array
    university.emails.push(...uniqueNewEmails);

    // Save the updated document
    const updatedUniversity = await university.save();
    return res.json(updatedUniversity);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


exports.getUniversityBranches = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.body.email });
    if (!student) {
      return res
        .status(400)
        .send({ message: "Student does not exist" });
    }
    

    const university = await University.findOne({ name: student.university });

    if (!university) {
      return res.status(404).json({ message: 'University not found.' });
    }

    // Return the branches of the university
    const branches = university.branches;
    return res.status(200).json({ branches });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: 'Internal server error.' });
  }
};

exports.updateStudentUniversityBranch = async (req, res) => {
  try {
    const { email, uniBranch } = req.body;

    // Find the student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).send({ message: "Student does not exist" });
    }
    const university = await University.findOne({ name: student.university });

    if (!university) {
      return res.status(404).json({ message: 'University not found.' });
    }
    
    if (!university.branches.includes(uniBranch)) {
      return res.status(400).json({ message: "Branch does not exist!" });
    }

    // Update the uni_branch field of the student
    student.uni_branch = uniBranch;
    await student.save();

    return res.status(200).json({ message: "Student university branch updated successfully." });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal server error." });
  }
};



//count students
exports.countUniversity= async (req, res) => {
  try {
    const countUniversity = await University.countDocuments();
    res.json({ count: countUniversity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  