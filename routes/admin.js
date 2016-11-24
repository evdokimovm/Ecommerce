var router = require('express').Router()
var async = require('async')
var faker = require('faker')
var Category = require('../models/category')
var Product = require('../models/product')

router.get('/add-category', function(req, res, next) {
	if (req.user) {
		if (!req.user.isAdmin) {
			req.flash('error', 'For Access to Add Category Page You Need to have Admin Privileges')
			res.redirect('/edit-profile')
		} else {
			res.render('admin/add-category', {
				message: req.flash('success'),
				error: req.flash('error')
			})
		}
	} else {
		res.redirect('/login')
	}
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
	if (req.user) {
		if (!req.user.isAdmin) {
			req.flash('error', 'For Access to Add Product Page You Need to have Admin Privileges')
			res.redirect('/edit-profile')
		} else {
			res.render('admin/add-product', {
				message: req.flash('success')
			})
		}
	} else {
		res.redirect('/login')
	}
})

router.post('/add-product', function(req, res, next) {
	async.waterfall([
		function(callback) {
			Category.findOne({
				name: req.body.category_name
			}, function(err, category) {
				if (err) return next(err)

				if (!category || category === 'null' || category === 'undefined') {
					if (req.user.isAdmin) {
						req.flash('error', 'First You Need to Create this Category Here')
						res.redirect('/add-category')
					} else if (!req.user.isAdmin) {
						req.flash('error', 'For Access to Add Category You Need to have Admin Privileges')
						res.redirect('/edit-profile')
					}
				} else {
					if (req.user.isAdmin) {
						callback(null, category)
					} else if (!req.user.isAdmin) {
						req.flash('error', 'For Access to Add Products to Category You Need to have Admin Privileges')
						res.redirect('/edit-profile')
					}
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
