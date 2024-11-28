const express = require('express');
const router = express.Router({mergeParams: true});

router.post('/items/:id/offers', offerController.createOffer);
router.get('/items/:id/offers', offerController.getOffersForItem);
router.post('/offers/:id/accept', offerController.acceptOffer);

module.exports = router;

