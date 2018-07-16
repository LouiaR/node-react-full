const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// load user model
const User = require('../../model/User');

router.get('/test', (req, res) => res.json({
  greet: 'Bonjour users'
}));

// @route for sign up 
//@access public

router.post('/register', (req, res) => {
  // Check validation 
  const { errors, isValid } = validateRegisterInput(req.body);
  if(!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({
      email: req.body.email
    })
    .then(user => {
      if (user) {
        errors.email = 'Email already exists.';
        return res.status(400).json({
          errors
        });
      } else {

        const avatar = gravatar.url(req.body.email, {
          s: '200', //size
          r: 'pg', //rating
          d: 'mm' // Default
        });

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password

        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log('err'));
          });
        });
      }
    });
});

// @validation of user login
// login user / return JWT token 
router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const { errors, isValid } = validateLoginInput(req.body);
  if(!isValid) {
    return res.status(400).json(errors);
  }

  //find user by email
  User.findOne({
      email
    })
    .then(user => {
      //check for user
      if (!user) {
        return res.status(404).json({
          email: 'User not found'
        });
      }
      // check password 
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            //user match

            const payload = { id: user.id, name: user.name, avatar: user.avatar }; // create jwt payload

            //sign token
            jwt.sign(payload, keys.secretOrkey, { expiresIn: 3600 }, (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token
              });
            });
           
          } else {
            errors.password = 'Incorrect password';
            return res.status(400).json({
              errors
            });
          }
        });
    });
});

// @route get api/users/current
//@descrip return current user
// @access private 

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json(req.user);
});


module.exports = router;