const express = require('express');
const controller = require('../controllers/itemController');
const {fileUpload} = require('../middleware/upload');
const {isLoggedIn, isSeller} = require('../middleware/auth');
const {validateId} = require('../middleware/validator');

const router = express.Router();


//GET /items: Send all user-posted items
router.get('/', controller.index);

//GET /items/new: Send HTML form to create a new story
router.get('/new', isLoggedIn, controller.new);

//POST /items: Create a new item listing
router.post('/', isLoggedIn, fileUpload, controller.create);

//GET /items/:id: send details of story identified by id
router.get('/:id', validateId, controller.show);

//GET /items/:id/edit: send html form for editing an exisiting story
router.get('/:id/edit', isLoggedIn, isSeller, validateId, controller.edit);

//PUT /items/:id: update the story identified by id
router.put('/:id', isLoggedIn, isSeller, fileUpload, validateId, controller.update);

//DELETE /items/:id: delete the story identified by id
router.delete('/:id', isLoggedIn, isSeller, validateId, controller.delete);

module.exports = router;