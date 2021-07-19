const bcrypt = require('bcrypt');
var crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const tokenConfig = require('../token-config')

function encryptMail(email) {
  let shaSum = crypto.createHash('sha256');
  let encyptedEmail = shaSum.update(email).digest('hex');
  return encyptedEmail;
}

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const encyptedEmail = encryptMail(req.body.email);
        const user = new User({
          email: encyptedEmail,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'User created !' }))
          .catch(() => res.status(400).json({ error: 'Email already used!' }));
      })
      .catch(error => res.status(500).json({ error }));
  };

  exports.login = (req, res, next) => {
    const encyptedEmail = encryptMail(req.body.email);
    User.findOne({ email: encyptedEmail })
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'User not found!' });
        }
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ error: 'Incorrect password !' });
            }
            res.status(200).json({
              userId: user._id,
              token: jwt.sign(
                { userId: user._id},
                `${tokenConfig.secretTokenKey}`,
                { expiresIn: '15m' }
              )
            });
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };