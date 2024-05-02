function getCollegeFromEmail(email) {
    const domain = email.split('@')[1].toLowerCase();
  
    if (domain === 'student.bau.edu.lb') {
      return 'Beirut Arab University';
    } else if (domain === 'student.liu.edu.lb') {
      return 'Lebanese International University';
    }
  
    // If the email domain doesn't match any known colleges, you can return a default value or handle it as needed.
    return 'Unknown College';
  }

  module.exports = getCollegeFromEmail;