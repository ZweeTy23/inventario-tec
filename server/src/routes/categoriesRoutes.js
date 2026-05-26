const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoriesController');

router.post('/', ctrl.createCategory);
router.get('/', ctrl.listCategories);
router.get('/:id', ctrl.getCategory);
router.patch('/:id', ctrl.updateCategory);
router.delete('/:id', ctrl.deleteCategory);

module.exports = router;
