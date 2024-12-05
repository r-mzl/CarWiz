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
    const itemId = req.params.id; // Item ID from the route
    const offerId = req.body.offerId; // Offer ID from the form body

    Offer.findById(offerId)
        .then(offer => {
            if (!offer) {
                req.flash('error', 'Offer not found');
                return res.redirect('back');
            }

            if (offer.status !== 'pending') {
                req.flash('error', 'This offer has already been processed.');
                return res.redirect('back');
            }

            return Item.findById(itemId).then(item => {
                if (!item) {
                    req.flash('error', 'Item not found');
                    return res.redirect('back');
                }

                offer.status = 'accepted'; 
                item.active = false; 

               
                return Promise.all([
                    offer.save(),
                    Item.updateOne({ _id: itemId }, { active: false }),
                    Offer.updateMany(
                        { item: itemId, _id: { $ne: offerId } },
                        { $set: { status: 'rejected' } }
                    )
                ]).then(() => {
                    req.flash('success', 'Offer accepted, item marked as inactive, and other offers rejected.');
                    res.redirect(`/items/${item._id}/offers`);
                });
            });
        })
        .catch(next);
};
