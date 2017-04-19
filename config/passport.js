var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var FacebookStrategy = require('passport-facebook').Strategy
var BearerStrategy = require('passport-http-bearer').Strategy
var secret = require('./secret')
var async = require('async')
var User = require('../models/user')
var Cart = require('../models/cart')
var randToken = require('rand-token')
var sendMailHelper = require('../helpers/send')

// serialize and deserialize
passport.serializeUser(function(user, done) {
	done(null, user._id)
})

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user)
	})
})

// middleware
passport.use('local-login', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
}, function(req, email, password, done) {
	User.findOne({ email: email }, function(err, user) {
		if(err) return done(err)

		if(!user) {
			return done(null, false, req.flash('error', 'No user has been found'))
		}

		if(!user.comparePassword(password)) {
			return done(null, false, req.flash('error', 'Oops! Wrong Password'))
		}

		return done(null, user)
	})
}))

passport.use(new FacebookStrategy(secret.facebook,
	function(req, accessToken, refreshToken, profile, done) {
		User.findOne({
			facebook: profile.id
		}, function (err, user) {
			if (err) return done(err)

			if (user) {
				return done(null, user)
			} else {
				async.waterfall([
					function(callback) {
						var newUser = new User()
						newUser.email = profile._json.email
						newUser.facebook = profile.id
						newUser.tokens.push({
							kind: 'facebook',
							token: accessToken
						})
						newUser.profile.name = profile.displayName
						newUser.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large'

						var verification_token = randToken.generate(32)
						newUser.verify_token = verification_token

						newUser.save(function(err) {
							if (err) {
								throw err
							} else {	
								sendMailHelper(newUser.email, verification_token)

								callback(null, newUser)
							}
						})
					},
					function(newUser) {
						var cart = new Cart()

						cart.owner = newUser._id

						cart.save(function(err) {
							if (err) return next(err)

							return done(err, newUser, req.flash('success', 'Confirm Your Account. To your email sent a confirmation link'))
						})
					}
				])
			}
		})
	}
))

passport.use(new BearerStrategy({}, function(token, done) {
	User.findOne({
		api_token: token
	}).exec(function(err, user) {
		if (!user) return done(null, false)
		return done(null, user)
	})
}))

// custom function to validate
exports.isAuthenticated = function(req, res, next) {
	if(req.isAuthenticated()) {
		return next()
	}
	res.redirect('/login')
}
