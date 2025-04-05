const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
console.log(functions.config().sendgrid.key);  // This will log the SendGrid API key to  Firebase logs

sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendEmailOnBooking = functions
  .region("us-central1") // Your functions are in us-central1 ✅
  .firestore
  .document("emailConfirmations/{docId}")
  .onCreate((snap, context) => {
    const data = snap.data();

    const msg = {
      to: data.user_email,
      from: "sharonmctsai@gmail.com",
      subject: "CarEss Booking Confirmation 🚗",
      html: `
        <strong>Hi there!</strong><br>
        Your booking <strong>${data.service_type}</strong> is confirmed.<br>
        <strong>Date:</strong> ${data.date}<br>
        <strong>Time:</strong> ${data.time}<br>
        <strong>Car:</strong> ${data.car_model} (${data.license_plate})<br><br>
        Thank you for choosing CarEss!<br>
        <em>- CarEss Team</em>
      `,
    };

    return sgMail.send(msg)
      .then(() => {
        console.log("Email sent to", data.user_email);
      })
      .catch((err) => {
        console.error("SendGrid Error:", err.response.body);
      });
  });
