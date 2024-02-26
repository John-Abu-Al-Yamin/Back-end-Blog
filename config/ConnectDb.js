const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("connect to db ^_^");
  })
  .catch(() => {
    console.log("note connect fill felid ");
  });
