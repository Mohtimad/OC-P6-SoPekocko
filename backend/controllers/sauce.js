const fs = require('fs');
const Sauce = require('../models/sauce');

exports.getSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  sauceObject.likes = 0;
  sauceObject.dislikes = 0;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, () => {
      const sauceObject = req.file ?
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
    });
  })
  .catch(error => res.status(500).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.likeOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      switch(req.body.like) {
        case -1:
          sauce.usersDisliked.push(req.body.userId)
          sauce.dislikes++
          break;        
        case 1:
          sauce.usersLiked.push(req.body.userId)
          sauce.likes++
          break;
        default:
          for (let i = 0; i < sauce.usersDisliked.length; i++) {
            if (sauce.usersDisliked[i] === req.body.userId) {
              sauce.usersDisliked.splice(i, 1);
              sauce.dislikes--
            }
          }
          for (let i = 0; i < sauce.usersLiked.length; i++) {
            if (sauce.usersLiked[i] === req.body.userId) {
              sauce.usersLiked.splice(i, 1);
              sauce.likes--
            }
          }
        break;
      }
      Sauce.updateOne({ _id: req.params.id }, { likes: sauce.likes,
                                                  dislikes: sauce.dislikes,
                                                  usersDisliked: sauce.usersDisliked,
                                                  usersLiked: sauce.usersLiked,
                                                  _id: req.params.id})
        
        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({ error }));
      })
    .catch(error => res.status(404).json({ error }));
};