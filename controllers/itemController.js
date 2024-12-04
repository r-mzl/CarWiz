const ItemModel = require('../models/item');

exports.index = (req, res, next) => {
    const searchQuery = req.query.search;

    ItemModel.find({ active: true }) 
        .sort({ price: 1 })
        .then(items => {
            let filteredItems = items;

            if (searchQuery) {
                const keyword = searchQuery.toLowerCase();
                filteredItems = items.filter(item => {
                    return (
                        (item.make && item.make.toLowerCase().includes(keyword)) || 
                        (item.modelX && item.modelX.toLowerCase().includes(keyword)) ||
                        (item.details && item.details.toLowerCase().includes(keyword)) || 
                        (item.year && item.year.toString().includes(keyword))
                    );
                });
            }

            res.render('./marketplace/index', { items: filteredItems });
        })
        .catch(err => {
            console.error(err);
            next(err);
        });
};


exports.new = (req, res)=>{
    res.render('./marketplace/new');
};

exports.create = (req, res, next)=>{
    let item = new ItemModel(req.body);
    item.seller = req.session.user; //Store the author with current user in session

    if(req.file)
        {
            item.image = '/images/' + req.file.filename;
        }
    
    item.active = 'true';

    item.save()
    .then(item=>res.redirect('/items'))
    .catch(err=>{
        if(err.name === 'ValidationError')
        {
            err.status = 400;
        }
        next(err);
    });
    

    //console.log(req.body);
    
};

exports.show = (req, res, next)=>{
    let id = req.params.id;

    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error('Invalid item id');
        err.status = 400;
        return next(err);
    }

    ItemModel.findById(id).populate('seller', 'firstName lastName')
    .then(item=>{
        if(item){
            let totalOffers = 0;
            let highestOffer = 0;

            if (item.active && item.totalOffers > 0) {
                totalOffers = item.totalOffers;
                highestOffer = item.highestOffer;
            }
            res.render('./marketplace/item', { item });
        } else {
            let err = new Error('Cannot find an item with id ' +id);
            err.status = 400;
            next(err);
        }
    })
    .catch(err=>next(err));

};

exports.edit = (req, res, next)=>{
    let id = req.params.id;

    ItemModel.findById(id)
    .then(item=>{
        res.render('./marketplace/edit', { item });
    })
    .catch(err=>next(err));

};

exports.update = (req, res, next)=>{
    let item = req.body;
    let id = req.params.id;

    if(req.file)
        {
            item.image = '/images/' + req.file.filename;
        }

    ItemModel.findByIdAndUpdate(id, item, {useFindAndModify: false, runValidators: true})
    .then(item=>{
            res.redirect('/items/'+id);
    })
    .catch(err=>{
        if(err.name === 'ValidationError')
            err.status = 400;
        next(err);
    });

};

exports.delete = (req, res, next) => {
    let id = req.params.id;

    ItemModel.findByIdAndDelete(id)
    .then(item => {
        res.redirect('/items'); 
    })
    .catch(err => next(err));
};

