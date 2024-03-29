const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const HttpError = require('../models/http-error');

/*Sign Up*/
const signup = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    const error = new HttpError('Invalid inputs passed, please check your data', 422);
    return next(error);
  }

  const { name, email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('Signup up failed, try again later', 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('A user with is already registered with this email', 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = HttpError('Could not create user, please try again later', 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    followings: [],
    venue: null
  })

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      'supersecret_string',
      { expiresIn: '1h' }
    )
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again later', 500);
    return next(error);
  }

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again later', 500);
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
}

/*login*/
const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('Logging failed, please try again later', 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError('Invalid credentials, Could not log you in', 500);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError('Could not log you in, try again later', 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError('Invalid credintials, Could not log you in', 403);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      'supersecret_string',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again later', 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token
  })
}

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = HttpError('Fetching users failed, try again later', 500);
    return next(error);
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
}

exports.signup = signup;
exports.login = login;
exports.getUsers = getUsers;
