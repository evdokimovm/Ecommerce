var router = require('express').Router()
var Product = require('../models/product')
var User = require('../models/user')
var passport = require('passport')
var passportConfig = require('../config/passport')
var fs = require('fs')

router.use(function(req, res, next) {
	fs.appendFile('log.txt', req.path + ' token: ' + req.query.access_token + '\n', function(err) {
		next()
	})
})

router.get('/getToken', function(req, res) {
	User
		.findOne({
			_id: req.user._id
		})
		.populate('token')
		.exec(function(err, user) {
			if (user.token == null) user.generateToken()
			req.user = user
			res.redirect('/edit-profile')
		})
})

router.get('/getUsers', passport.authenticate('bearer', {session: false}), function(req, res) {
	User
		.find({})
		.populate('token')
		.exec(function(err, users) {
			res.json(users.map(function(user) {
				return {
					email: user.email,
					history: user.history,
					isAdmin: user.isAdmin,
					profile: user.profile
				}
			}))
		})
})

router.get('/getProducts', passport.authenticate('bearer', {session: false}), function(req, res) {
	Product
		.find({})
		.populate('category')
		.exec(function(err, products) {
			res.json(products.map(function(product) {
				return {
					image: product.image,
					price: product.price,
					name: product.name,
					category: {
						name: product.category.name
					}
				}
			}))
		})
})

module.exports = router
