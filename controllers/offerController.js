const Offer = require('../models/offer');
const Item = require('../models/item');
const mongoose = require('mongoose');

exports.createOffer = (req, res, next) => {
    let id = req.params.id;
    let amount = req.body.amount;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid item ID');
        return res.redirect('back');
    }

    Item.findById(id)
        .populate('seller')
        .then(item => {
            if (!item || !item.active) {
                req.flash('error', 'Item not found or inactive');
                return res.redirect('back');
            }

            if (item.seller._id.toString() === req.user._id.toString()) {
                req.flash('error', 'Cannot make an offer on your own item');
                return res.redirect('back');
            }

            const offer = new Offer({ amount });
            return offer.save().then(savedOffer => {
                item.offers = item.offers || [];
                item.offers.push(savedOffer._id);
                return item.save().then(() => {
                    req.flash('success', 'Offer made successfully');
                    res.redirect(`/items/${id}`);
                });
            });
        })
        .catch(err => next(err));
};


exports.getOffersForItem = (req, res, next) => {
    let id = req.params.id; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid item ID');
        return res.redirect('back');
    }

    Item.findById(id)
        .populate('offers')
        .then(item => {
            if (!item) {
                req.flash('error', 'Item not found');
                return res.redirect('back');
            }

            if (item.seller.toString() !== req.user._id.toString()) {
                req.flash('error', 'Access denied');
                return res.redirect('back');
            }

            res.render('offers/index', { item });
        })
        .catch(err => next(err));
};


exports.acceptOffer = (req, res, next) => {
    let id = req.params.id; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid offer ID');
        return res.redirect('back');
    }

    Offer.findById(id)
        .populate({
            path: 'item',
            populate: { path: 'seller' }
        })
        .then(offer => {
            if (!offer) {
                req.flash('error', 'Offer not found');
                return res.redirect('back');
            }

            return Item.findById(offer.item).then(item => {
                if (item.seller.toString() !== req.user._id.toString()) {
                    req.flash('error', 'Access denied');
                    return res.redirect('back');
                }

                offer.status = 'accepted';
                return offer.save().then(() => {
                    req.flash('success', 'Offer accepted');
                    res.redirect(`/items/${item._id}/offers`);
                });
            });
        })
        .catch(err => next(err));
};