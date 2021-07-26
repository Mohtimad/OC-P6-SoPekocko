const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');

const userCtrl = require('../controllers/user');

router.post('/signup', [
    body('email', 'Your email is not valid').not().isEmpty().isEmail().normalizeEmail(),
    body('password', 'Your password is not valid').not().isEmpty().isLength({min: 6}).matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/),
  ],
  function (req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
      next();
  });

router.post('/login',
  [body('email').not().isEmpty().isEmail().normalizeEmail()], (req, res, next) => next()
);

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;