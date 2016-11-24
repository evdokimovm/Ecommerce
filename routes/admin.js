var router = require('express').Router()
var async = require('async')
var faker = require('faker')
var Category = require('../models/category')
var Product = require('../models/product')

router.get('/add-category', function(req, res, next) {
	res.render('admin/add-category', {
		message: req.flash('success'),
		error: req.flash('error')
	})
})

router.post('/add-category', function(req, res, next) {
	var category = new Category()

	category.name = req.body.name

	category.save(function(err) {
		if (err) return next(err)
		req.flash('success', 'Successfully Added Category')
		return res.redirect('/add-category')
	})
})

router.get('/add-product', function(req, res, next) {
	res.render('admin/add-product', {
		message: req.flash('success')
	})
})

router.post('/add-product', function(req, res, next) {
	async.waterfall([
		function(callback) {
			Category.findOne({
				name: req.body.category_name
			}, function(err, category) {
				if (err) return next(err)

				if (!category || category === 'null' || category === 'undefined') {
					req.flash('error', 'First, You Need to Create this Category Here')
					res.redirect('/add-category')
				} else {
					callback(null, category)
				}
			})
		},
		function(category) {
			var product = new Product()

			product.category = category._id
			product.name = req.body.product_name
			product.price = req.body.product_price
			product.image = faker.image.image()

			product.save()

			req.flash('success', 'Success Adding Product')
			res.redirect('/add-product')
		}
	])
})

module.exports = router
