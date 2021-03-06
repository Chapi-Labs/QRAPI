const User = require('./user.model');
const EmailValidation = require('../email/email_validation.model');
const httpStatus = require('http-status');
const config = require('../../config/config');
const jwt = require('jsonwebtoken');

const errorMessage = {
  message: 'El usuario no se ha encontrado, debe crear una cuenta.',
  errmsg: 'El usuario o la contraseña no coinciden'
};

/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  User.get(id)
    .then((user) => {
      req.user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  return res.json(req.user);
}

/**
 * Create new user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
async function create(req, res, next) {
  const user = new User({
    email: req.body.email.trim().toLowerCase(),
    first_name: req.body.first_name,
    last_name: req.body.last_name,
  });
  if (req.body.token.trim().toLowerCase() === 'cumbre') {
    user.save()
    .then(savedUser => res.json(savedUser))
    .catch(e => next(e));
  } else {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR)
    .json({
      message: `El usuario ${req.body.email} no ha sido validado`
    });
  }
}

const login = async (req, res) => {
  // fetch user from db
  try {
    const user = await User.findOne({
      email: req.body.email.toLowerCase()
    });
    if (user != null) {
      // create a signed token
      const token = jwt.sign(
        {
          email: user.email,
          id: user.id
        },
        config.jwtSecret,
        {
          expiresIn: '30 days'
        }
      );
      return res.json({ token, username: `${user.first_name} ${user.last_name}P`, id: user.id });
    }
    // password not valid
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(errorMessage);
  } catch (e) {
    // check if user was found by username
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(errorMessage);
  }
};

/**
 * Update existing user
 * @property {string} req.body.email - The email of user.
 * @property {string} req.body.first_name - The first_name of user.
 * @returns {User}
 */
function update(req, res, next) {
  const user = req.user;
  user.email = req.body.email;
  user.first_name = req.body.first_name;
  user.last_name = req.body.last_name;

  user.save()
    .then(savedUser => res.json(savedUser))
    .catch(e => next(e));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  User.list({ limit, skip })
    .then(users => res.json(users))
    .catch(e => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
  const user = req.user;
  user.remove()
    .then(deletedUser => res.json(deletedUser))
    .catch(e => next(e));
}

module.exports = { load, get, create, update, list, remove, login };
