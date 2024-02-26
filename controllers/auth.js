const asyncHandler = require("express-async-handler");
const { User, validateRegister, validateLogin } = require("../models/User");
const bcrypt = require("bcryptjs");
const { model } = require("mongoose");

// Register new user
// Route /api/auth/register
// method POST

module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  // validation
  const { error } = validateRegister(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // is user exixts
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ message: "user already exixts" });
  }

  // hash password
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password, 10);

  // new user and save it to db
  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });
  await user.save();

  // send a response to client
  res
    .status(201)
    .json({ message: "You Registered Successfully, please log in" });
});

/////////////////////////////////////////////////////////////////////////////////
// login user
// Route /api/auth/login
// method POST
/////////////////////////////////////////////////////////////////////////////////

module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  // validation
  const { error } = validateLogin(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // user exist
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ message: "invalid email or password" });
  }

  // check the password
  const ispassword = await bcrypt.compare(req.body.password, user.password);
  if (!ispassword) {
    return res.status(400).json({ message: "invalid email or password" });
  }

  // JTW
  const token = user.generateAuthToken();

  // response to client
  res.status(200).json({
    _id: user._id,
    isAdmin: user.isAdmin,
    token,
    username: user.username,
  });
});
