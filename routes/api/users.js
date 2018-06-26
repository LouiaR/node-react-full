const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// load user model
const User = require('../../model/User');

router.get('/test', (req, res) => res.json({
  greet: 'Bonjour users'
}));

// @route for sign up 
//@access public

router.post('/register', (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        return res.status(400).json({email: 'Email already exists.'});
      } else {

        const avatar = gravatar.url(req.body.email, {
          s: '200', //size
          r: 'pg', //rating
          d: 'mm' // Default
        });

        const newUser = new User ({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password

        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
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

// router.post('./register', (req, res) => {

//   const newUser = {
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password

//   };
//   res.json(newUser);
    
// });



module.exports = router;