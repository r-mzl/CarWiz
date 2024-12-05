const {body, validationResult} = require('express-validator');

exports.validateId = (req, res, next)=>{
    const id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid item id');
        err.status = 400;
        return next(err);
    }
    next();
};

exports.validatorSignup = [body('firstName', 'First name cannot be empty').notEmpty().trim().escape(), 
    body('lastName', 'Last name cannot be empty').notEmpty().trim().escape(),
    body('email', 'Enter a valid email').isEmail().trim().escape().normalizeEmail(), body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min: 8, max:64})];

exports.validateLogin = [body('email', 'Enter a valid email').isEmail().trim().escape().normalizeEmail(), body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min: 8, max:64})];

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
};

