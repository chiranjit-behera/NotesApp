const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./routes/userRouter");
const noteRouter = require("./routes/noteRouter");
const path = require('path');
const job = require("./config/cron");
const ENV = require("./config/env");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

if (ENV.NODE_ENV === "production") job.start();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/users", userRouter);
app.use("/api/notes", noteRouter);
app.get("/", (req, res) => {
  res.send("OK");
});

mongoose
  .connect(ENV.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

const PORT = ENV.PORT || 8080;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
