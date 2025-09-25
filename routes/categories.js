var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category');

// GET all categories
router.get('/', async function(req, res, next) {
  try {
    let categories = await categoryModel.find({ isDelete: false });
    res.send({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      data: error
    });
  }
});

// GET category by id
router.get('/:id', async function(req, res, next) {
  try {
    let item = await categoryModel.findById(req.params.id);
    if (!item || item.isDelete) {
      return res.status(404).send({
        success: false,
        data: { message: "Category not found" }
      });
    }
    res.send({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      data: error
    });
  }
});

// POST create new category
router.post('/', async function(req, res, next) {
  try {
    let newItem = new categoryModel({
      name: req.body.name
    });
    await newItem.save();
    res.send({
      success: true,
      data: newItem,
      message: "Category created successfully"
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      data: error
    });
  }
});

// PUT update category
router.put('/:id', async function(req, res, next) {
  try {
    let updatedItem = await categoryModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name
      },
      { new: true }
    );
    
    if (!updatedItem || updatedItem.isDelete) {
      return res.status(404).send({
        success: false,
        data: { message: "Category not found" }
      });
    }
    
    res.send({
      success: true,
      data: updatedItem,
      message: "Category updated successfully"
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      data: error
    });
  }
});

// DELETE category (soft delete)
router.delete('/:id', async function(req, res, next) {
  try {
    let deletedItem = await categoryModel.findByIdAndUpdate(
      req.params.id,
      { isDelete: true },
      { new: true }
    );
    
    if (!deletedItem) {
      return res.status(404).send({
        success: false,
        data: { message: "Category not found" }
      });
    }
    
    res.send({
      success: true,
      data: deletedItem,
      message: "Category marked as deleted successfully"
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      data: error
    });
  }
});

module.exports = router;