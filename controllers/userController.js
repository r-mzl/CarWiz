const User = require('../models/user');
const Item = require('../models/item');

exports.new = (req, res)=>{
    return res.render('user/new');
};

exports.loginShow = (req, res, next)=>{
    return res.render('user/login');
    
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([User.findById(id), Item.find({seller: id})]) 
    .then(results=>{
        const [user, items] = results;
        res.render('./user/profile', {user, items});
    })
    .catch(err=>next(err));
};

exports.createUser = (req, res, next) => {
        let user = new User(req.body);
        user.save()
        .then(()=>{
            req.flash('success', 'You have successfully registered.');
            res.redirect('users/login');
        })
        .catch(err=>{
            req.flash('success', 'Registration failed, please try again.');
            res.redirect('users/new');
            next(err);
        });
};


exports.login = (req, res, next)=>{
    let email = req.body.email;
    let password = req.body.password;

    //Get the user that matches the email
    User.findOne({email: email})
    .then(user=>{
        if(user){
            //User found in db
            user.comparePassword(password)
            .then(result=>{
                if(result){
                    req.session.user = user._id; //Store user id in the session
                    req.flash('success', 'You have successfully logged in.');
                    res.redirect('/users/profile');
                } else {
                    //console.log('wrong password');
                    req.flash('error', 'Wrong Password');
                    res.redirect('/users/login');
                }
            })
            .catch(err=>next(err));
        } else {
            //console.log('wrong email address');
            req.flash('error', 'Wrong Email');
            res.redirect('/users/login');
        }
    })
    .catch(err=>next(err));
};

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err)
            return next(err);
        else
            res.redirect('/users/login');
    });
};