var router = require('express').Router()
var async = require('async')
var faker = require('faker')
var Category = require('../models/category')
var Product = require('../models/product')
var User = require('../models/user')

router.post('/search', function(req, res, next) {
	Product
		.find({
			name: {
				$regex: req.body.search_term,
				$options: 'i'
			}
		})
		.populate('category')
		.lean()
		.exec(function(err, results) {
			if (err) return next(err)
			res.json(results)
		})
})

router.post('/change-password', function(req, res, next) {
	User.findOne({
		_id: req.user._id
	}, function(err, user) {
		if (req.body.new_password && req.body.old_password) {
			if (user.comparePassword(req.body.old_password)) {
				user.password = req.body.new_password

				user.save(function(err) {
					if (err) return next(err)
					req.flash('success', 'Successfully Edited Your Password')
					return res.redirect('/edit-profile')
				})
			} else {
				req.flash('error', 'Old Password Not Correct')
				return res.redirect('/edit-profile')
			}
		} else {
			req.flash('error', 'You Need to Fill Old Password and New Password Fields to Change Password')
			return res.redirect('/edit-profile')
		}
	})
})

router.get('/:name', function(req, res, next) {
	async.waterfall([
		function(callback) {
			Category.findOne({
				name: req.params.name
			}, function(err, category) {
				if (err) return next(err)
				callback(null, category)
			})
		},
		function(category, callback) {
			for (var i = 0; i < 30; i++) {
				var product = new Product()

				product.category = category._id
				product.name = faker.commerce.productName()
				product.price = faker.commerce.price()
				product.image = faker.image.image()

				product.save()
			}
		}
	])
	res.json({
		message: 'Success'
	})
})

module.exports = router
