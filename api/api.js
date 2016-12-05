var router = require('express').Router()
var Product = require('../models/product')
var Category = require('../models/category')
var User = require('../models/user')
var Token = require('../models/token')
var passport = require('passport')
var passportConfig = require('../config/passport')
var fs = require('fs')
var cors = require('cors')

router.use(function(req, res, next) {
	fs.appendFile('./logs/api-log.txt', req.path + ' token: ' + req.query.access_token + '\n', function(err) {
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
			res.redirect('/api-page')
		})
})

router.get('/updateToken', function(req, res) {
	Token.remove({
		user: req.user._id
	}, function(err) {
		User.update({
			_id: req.user._id
		}, {
			$set: {
				token: null
			}
		}, function(err) {
			User.findOne({
				_id: req.user._id
			})
			.populate('token')
			.exec(function(err, user) {
				user.generateToken()
				req.user = user
				res.redirect('/api-page')
			})
		})
	})
})

router.get('/getUsers', passport.authenticate('bearer', {session: false}), cors(), function(req, res) {
	User
		.find({})
		.populate('token')
		.populate('history.item')
		.populate('history.category')
		.exec(function(err, users) {
			res.json(users.map(function(user) {
				return {
					email: user.email,
					payment_history: user.history.map(function(data) {
						return {
							item: {
								image: data.item.image,
								price: data.item.price,
								name: data.item.name,
								category: {
									name: data.category.name
								},
								paid: data.paid,
								quantity: data.paid/data.item.price
							}
						}
					}),
					account: {
						isAdmin: user.isAdmin,
						verified: user.verified
					},
					profile: {
						name: user.profile.name,
						picture: user.profile.picture,
						address: user.address
					}
				}
			}))
		})
})

router.get('/getProducts', passport.authenticate('bearer', {session: false}), cors(), function(req, res) {
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

router.get('/getCategories', passport.authenticate('bearer', {session: false}), cors(), function(req, res) {
	Category
		.find({})
		.exec(function(err, categories) {
			res.json(categories.map(function(category) {
				return {
					category: category.name
				}
			}))
		})
})

router.get('/getAllProductsInCategory', passport.authenticate('bearer', {session: false}), cors(), function(req, res) {
	Category.findOne({
		name: req.query.category_name
	}, function(err, foundCategory) {
		if (!foundCategory) {
			res.json({
				error: 'Category Not Found'
			})
		} else {
			Product
				.find({
					category: foundCategory._id
				})
				.populate('category')
				.exec(function(err, products) {
					if (products[0] == null) {
						res.json({
							error: 'We Do Not Have Products In This Category'
						})
					} else {
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
					}
				})
		}
	})
})

router.get('/getProductsByName', passport.authenticate('bearer', {session: false}), cors(), function(req, res) {
	Product
		.find({
			name: {
				$regex: req.query.product_name,
				$options: 'i'
			}
		})
		.populate('category')
		.exec(function(err, products) {
			if (products[0] == null) {
				res.json({
					error: 'We Can Not Find the Products by Your Request'
				})
			} else {
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
			}
		})
})

module.exports = router
