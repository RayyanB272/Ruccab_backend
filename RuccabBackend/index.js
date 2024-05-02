const express = require("express");
const dotenv = require("dotenv").config();
const cron = require('node-cron');
const database = require("./database").connectDB;

const app = express();

cron.schedule('*/1 * * * *', () => {
  // This code will run every time the app is opened
  //console.log('Cron job triggered');
  // You can perform additional tasks here
  // ...
}, { scheduled: false }); // Set scheduled option to false to prevent running on a schedule

// Manually trigger the cron job when the app is opened
cron.getTasks().forEach(task => task.start());


database();

//define routes
const studentAuthRoute = require("./routes/SignupLogin/studentAuthRoute");
const universityRoute = require("./routes/universityRoute");
const profileRoute = require("./routes/menu/profile");
const carRoute = require("./routes/menu/car");
const licenseRoute = require("./routes/rides/license");
const rideRoutes = require("./routes/rides/ridescreation");
const uploadRoute = require("./controllers/images/imageUpload");
const ratingRoutes = require("./routes/ratingRoute");

app.use(express.json());

app.use("/api/auth", studentAuthRoute);
app.use("/api/university", universityRoute);
app.use("/api/profile", profileRoute);
app.use("/api/car", carRoute);
app.use("/api/license", licenseRoute);
app.use("/api/ride", rideRoutes);
app.use("/api/users", uploadRoute);
app.use("/api/ratings", ratingRoutes);

app.listen(process.env.PORT, () => {
  console.log("Listening on " + process.env.PORT);
});
