var router = require('express').Router()
var async = require('async')
var User = require('../models/user')
var Cart = require('../models/cart')
var passport = require('passport')
var passportConfig = require('../config/passport')

router.get('/login', function(req, res) {
	if(req.user) return res.redirect('/profile')
	res.render('accounts/login', {
		message: req.flash('loginMessage')
	})
})

router.post('/login', passport.authenticate('local-login', {
	successRedirect: '/profile',
	failureRedirect: '/login',
	failureFlash: true
}))

router.get('/profile', passportConfig.isAuthenticated, function(req, res, next) {
	User
		.findOne({ _id: req.user._id })
		.populate('history.item')
		.exec(function(err, foundUser) {
		res.render('accounts/profile', {
			user: foundUser
		})
	})
})

router.get('/signup', function(req, res, next) {
	if(req.user) return res.redirect('/profile')
	res.render('accounts/signup', {
		errors: req.flash('errors')
	})
})

router.post('/signup', function(req, res, next) {

	async.waterfall([
		function(callback) {
			var user = new User()

			user.profile.name = req.body.name
			user.password = req.body.password
			user.email = req.body.email
			user.profile.picture = user.gravatar()

			User.findOne({ email: req.body.email }, function(err, existingUser) {
				if (existingUser) {
					req.flash('errors', 'Account with that email address already exist')
					return res.redirect('/signup')
				} else {
					user.save(function(err, user) {
						if (err) return next(err)
						callback(null, user)
					})
				}
			})
		},
		function(user) {
			var cart = new Cart()

			cart.owner = user._id

			cart.save(function(err) {
				if(err) return next(err)
				req.logIn(user, function(err) {
					if (err) return next(err)
					res.redirect('/profile')
				})
			})
		}
	])
})

router.get('/auth/facebook', passport.authenticate('facebook', {
	scope: 'email'
}))

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
	successRedirect: '/profile',
	failureRedirect: '/login'
}))

router.get('/edit-profile', function(req, res, next) {
	if (!req.user) {
		res.redirect('/login')
	} else {
		User
			.findOne({ _id: req.user._id })
			.populate('token')
			.exec(function(err, foundUser) {
			res.render('accounts/edit-profile', {
				message: req.flash('success'),
				error: req.flash('error'),
				user: foundUser
			})
		})
	}
})

router.get('/admin-page', function(req, res, next) {
	if (!req.user) {
		res.redirect('/login')
	} else {
		if (req.user.isAdmin) {
			res.render('admin/admin-page')
		} else {
			req.flash('error', 'You Need Admin Account for Access to Admin Page')
			res.redirect('/edit-profile')
		}
	}
})

router.get('/logout', function(req, res, next) {
	req.logout()
	res.redirect('/')
})

module.exports = router
