var CronJob = require("cron").CronJob;
var https = require("https");

var job = new CronJob("*/14 * * * *", function () {
  https
    .get(process.env.API_URL, function (res) {
      if (res.statusCode === 200) {
        console.log("GET request sent successfully");
      } else {
        console.log("GET request failed", res.statusCode);
      }
    })
    .on("error", function (e) {
      console.error("Error while sending request", e);
    });
});

module.exports = job;
