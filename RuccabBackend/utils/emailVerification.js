/*const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();

exports.emailVerification = async (options)=>{

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            username: process.env.EMAIL_USERNAME,
            password: process.env.EMAIL_PASSWORD,
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: options.email,
        subject: options.subject,
        text: options.text,
    }


    await transporter.sendMail(mailOptions);

};*/


const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();

exports.emailVerification = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: options.email,
      subject: options.subject,
      text: options.text,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    // Handle the error
    if (error.code === 'EAUTH') {
      // The error is related to authentication
      console.error('SMTP authentication error:', error);
    } else {
      // Other types of errors
      console.error('Email sending error:', error);
    }
  }
};