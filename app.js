const express = require("express");
const app = express();
const { errorHandler, notFound } = require("./middlewares/error");
const cors = require("cors");
require("dotenv").config();
const ConnectDb = require("./config/ConnectDb");

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// Routrs
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/usersRoute"));
app.use("/api/posts", require("./routes/postsRoute"));
app.use("/api/comments", require("./routes/commentRoute"));
app.use("/api/categories", require("./routes/categoriesRoute"));

// Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log("app ruinnig in port 5000");
});
