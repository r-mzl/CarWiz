const express = require('express');
const router = express.Router({mergeParams: true});
const {validateId} = require('../middleware/validator');
const {isLoggedIn, isSeller} = require('../middleware/auth');
const offerController = require('../controllers/offerController');

router.post('/offers', isLoggedIn, validateId, offerController.createOffer);
router.get('/offers', isLoggedIn, isSeller, validateId, offerController.getOffers);
router.post('/offers/:id/accept', isLoggedIn, isSeller, validateId, offerController.acceptOffer);

module.exports = router;

