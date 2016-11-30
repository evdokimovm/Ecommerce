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

	Category.findOne({
		name: req.body.name
	}, function(err, foundCategory) {
		if (!foundCategory) {
			category.name = req.body.name

			category.save(function(err) {
				if (err) return next(err)
				req.flash('success', 'Successfully Added Category')
				return res.redirect('/add-category')
			})
		} else {
			req.flash('error', 'Category Already Exist')
			return res.redirect('/add-category')
		}
	})
})

router.get('/add-product', function(req, res, next) {
	if (req.user) {
		if (!req.user.isAdmin) {
			req.flash('error', 'For Access to Add Product Page You Need to have Admin Privileges')
			res.redirect('/edit-profile')
		} else {
			res.render('admin/add-product', {
				message: req.flash('success'),
				error: req.flash('error')
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

router.get('/delete-category', function(req, res, next) {
	if (req.user) {
		if (!req.user.isAdmin) {
			req.flash('error', 'For Access to Delete Category Page You Need to have Admin Privileges')
			res.redirect('/edit-profile')
		} else {
			res.render('admin/delete-category', {
				message: req.flash('success'),
				error: req.flash('error')
			})
		}
	} else {
		res.redirect('/login')
	}
})

router.post('/delete-category', function(req, res, next) {
	async.waterfall([
		function(callback) {
			Category.findOne({
				name: req.body.name
			}, function(err, category) {
				if (err) {
					req.flash('error', 'Category Not Found')
					res.redirect('/add-category')
				} else {
					callback(null, category)
				}
			})
		},
		function(category, callback) {
			var id = category._id

			Product.remove({
				category: category._id
			}, function (err, offer) {
				if (!offer) {
					callback(null, id)
				} else {
					callback(null, id)
				}
			})
		}, function(id) {
			Category.remove({
				_id: id
			}, function(err, remove) {
				if (err) {
					req.flash('error', 'Category Not Found')
					res.redirect('/add-category')
				} else {
					req.flash('success', 'Category Removed')
					res.redirect('/add-category')
				}
			})
		}
	])
})

module.exports = router
