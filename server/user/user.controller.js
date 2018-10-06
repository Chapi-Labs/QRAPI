const User = require('./user.model');

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
    email: req.body.email,
    first_name: req.body.first_name,
    last_name: req.body.last_name
  });
  const userValid = await User.getByEmail(req.body.email);
  if (userValid) {
      user.save()
      .then(savedUser => res.json(savedUser))
      .catch(e => next(e));
  } else {
    res
    .status(500)
    .json({
      message: `El usuario ${req.body.email} ya existe`
    });
  }

}

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

module.exports = { load, get, create, update, list, remove };