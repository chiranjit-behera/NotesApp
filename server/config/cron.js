// server/config/cron.js
var CronJob = require("cron").CronJob;
var https = require("https");
const ENV = require("../config/env");
const noteCtrl = require("../controllers/noteCtrl"); // Import your note controller

var job = new CronJob(
  "*/14 * * * *", // This runs every 14 minutes.
  async function () { // Make the function async
    console.log("Running scheduled tasks...");

    // 1. Ping the API (your existing logic)
    https
      .get(ENV.API_URL, function (res) {
        if (res.statusCode === 200) {
          console.log("GET request sent successfully to API_URL");
        } else {
          console.log("GET request to API_URL failed", res.statusCode);
        }
      })
      .on("error", function (e) {
        console.error("Error while sending request to API_URL", e);
      });

    // 2. Run the trash auto-deletion logic
    try {
      await noteCtrl.autoDeleteTrashedNotes(); // Call the function from your note controller
    } catch (error) {
      console.error("Failed to run auto-delete trashed notes:", error);
    }
  },
  null, // onComplete callback (optional)
  true, // Start the job immediately (true) or later with job.start()
  'Asia/Kolkata' // Timezone: Crucial for accurate scheduling based on local time
);

module.exports = job;