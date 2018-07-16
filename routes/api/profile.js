const express =require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Profile Model
const Profile = require('../../model/Profile');
// Load User Model
const User = require('../../model/User');

// Load validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');


router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.user.id})
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      errors.noProfile = 'There is no profile for this user';
      if(!profile) res.status(404).json(errors);
      res.status(200).json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route GET api/profile/handle/:handle
// @desc Create profile by handle
// @access Public

router.get('/handle/:handle', (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle})
    .populate('user',['name', 'avatar'])
    .then(profile => {
      if(!profile){
        errors.noProfile = 'There is no profile for this handle';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json({profile: 'There is no profile for this user'}));
});

// @route GET api/profile/user/:user_id
// @desc Create profile by user ID
// @access Public

router.get('/user/:user_id', (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id})
    .populate('user',['name', 'avatar'])
    .then(profile => {
      if(!profile){
        errors.noProfile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json({profile: 'There is no profile for this user'}));
});

// @route GET api/profile/user/:user_id
// @desc Get all profiles
// @access Public
router.get('/all', (req, res) => {
  const errors = {};

  Profile.find()
  .populate('user', ['name', 'avatar'])
  .then(profile => {
    if(!profile){
      errors.profile = 'There are no profiles';
      res.status(404).json(errors);
    }
    res.json(profile);
  });
});


// @route POST api/profile
// @desc Create user profile
// @access private

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateProfileInput(req.body);
  // Check Validation 
  if (!isValid){
    return res.status(400).json(errors);
  }
  // Get fields
  const profileFields = {};
  profileFields.user = req.user.id;
  if(req.body.handle) profileFields.handle = req.body.handle;
  if(req.body.company) profileFields.company = req.body.company;
  if(req.body.website) profileFields.website = req.body.website;
  if(req.body.location) profileFields.location = req.body.location;
  if(req.body.bio) profileFields.bio = req.body.bio;
  if(req.body.status) profileFields.status = req.body.status;
  if(req.body.githubUsername) profileFields.githubUsername = req.body.githubUsername;
  // Skills 
  if(typeof req.body.skills !== 'undefined'){
    profileFields.skills = req.body.skills.split(', ');
  }

  // Social 
  profileFields.social = {};
  if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if(req.body.instagram) profileFields.social.instagram = req.body.instagram;
  if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
  
  // Load Profile
  Profile.findOne( {user: req.user.id })
  .then(profile => {
    if(profile) {
      // Update 
      Profile.findOneAndUpdate({user: req.user.id }, { $set: profileFields }, { new: true })
      .then(profile => res.status(200).json(profile));
    } else {
      // Create Profile
      // Check if handle exists
      Profile.findOne({ handle: profileFields.handle })
      .then(profile => {
        if(profile) {
          errors.handle = 'That handle is already use';
          res.status(400).json(errors);
        } else {
        new Profile(profileFields)
        .save()
        .then(profile => res.json(profile));
        }
      });
    }
  });
});

// @route POST api/profile/experience
// @desc Add experience to profile
// @access private

router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateExperienceInput(req.body);
  if(!isValid){
    res.status(400).json(errors)
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newExperience = {};
      newExperience.title = req.body.title;
      newExperience.company = req.body.company;
      newExperience.location = req.body.location;
      newExperience.to = req.body.to;
      newExperience.from = req.body.from;
      newExperience.current = req.body.current;
      newExperience.description = req.body.description;

      // Add to experience array
      profile.experience.unshift(newExperience);
      profile.save()
      .then(profile => res.json(profile));
    });
});

// @route POST api/profile/education
// @desc Add education to profile
// @access private

router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateEducationInput(req.body);
  if(!isValid){
    res.status(400).json(errors)
  }
  
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const education = {};
      education.school = req.body.school;
      education.degree = req.body.degree;
      education.fieldofstudy = req.body.fieldofstudy;
      education.to = req.body.to;
      education.from = req.body.from;
      education.current = req.body.current;
      education.description = req.body.description;

      // Add to experience array
      profile.education.unshift(education);
      profile.save()
      .then(profile => res.json(profile));
    });
});

// @route Delete api/profile/experience/:exp_id
// @desc Delet experience from profile
// @access private

router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // Get remove index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

        // splice out of array
        profile.experience.splice(removeIndex, 1);
        console.log(profile.experience);
        // Save
        profile.save()
          .then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

// @route Delete api/profile/education/:edu_id
// @desc Delet education from profile
// @access private

router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // Get remove index
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

        // splice out of array
        profile.education.splice(removeIndex, 1);
        console.log(profile.education);
        // Save
        profile.save()
          .then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

// @route Delete api/profile
// @desc Delete User and profile
// @access private

router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOneAndRemove({ user: req.user.id })
    .then( () => {
      User.findOneAndRemove( { _id: req.user.id})
        .then(() => {
         res.json({ msg: true });
        });
    })
    .catch(err => res.status(404).json(err));
});
module.exports = router;