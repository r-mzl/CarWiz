const Offer = require('../models/offer');
const Item = require('../models/item');
const mongoose = require('mongoose');

exports.createOffer = (req, res, next) => {
    const id = req.params.id;
    const amount = req.body.amount;
    const user = req.session.user;

    Item.findById(id)
        .populate('seller') 
        .then(item => {
            if (!item || !item.active) {
                req.flash('error', 'Item not found or inactive');
                return res.redirect('back');
            }
            if (!item.seller) {
                req.flash('error', 'Seller information is missing');
                return res.redirect('back');
            }
            const offer = new Offer({
                amount,
                user: user,
                item: item._id,
                date: Date.now() 
            });
            return offer.save()
                .then(savedOffer => {
                    item.offers.push(savedOffer._id); 

                    return item.save() 
                        .then(() => {
                            return item.updateOne(
                                { 
                                    $inc: { totalOffers: 1 },       
                                    $max: { highestOffer: amount } 
                                }
                            );
                        })
                    .then(() => {
                        req.flash('success', 'Offer made successfully');
                        res.redirect(`/items/${id}`); 
                    });
                });
        })
        .catch(err => {
            console.error(err); 
            next(err);  
        });
};


exports.getOffers = (req, res, next) => {
    let id = req.params.id;

    Item.findById(id)
        .populate({
            path: 'offers',
            populate: {
                path: 'user', 
                select: 'firstName lastName' 
            }
        })
        .then(item => {
            console.log('Item:', item);
            
            if (!item) {
                req.flash('error', 'Item not found');
                return res.redirect('back');
            }
            console.log('Offers:', item.offers);

            res.render('offers/offers', { item });
        })
        .catch(err => {
            console.error('Error:', err);
            next(err);
        });
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