const Item = require('../models/item');

//Check if user is a guest

exports.isGuest = (req, res, next) =>{
    if(!req.session.user){
        return next();
    }
    else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
    }
};

//Check if user is authenticated

exports.isLoggedIn = (req, res, next)=>{
    if(req.session.user){
        return next();
    }
    else {
        req.flash('error', 'You need to login first');
        return res.redirect('/users/login');
    }
};

//Check if the user is the seller of the listing

exports.isSeller = (req, res, next)=>{
    let id = req.params.id;
    
    Item.findById(id)
    .then(item=>{
        if(item)
        {
            if(item.seller == req.session.user){
                return next();
            } else {
                let err = new Error('Unauthorized to access this resource');
                err.status = 401;
                return next(err);
            }
        } else {
            let err = new Error('Cannot find a item with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};