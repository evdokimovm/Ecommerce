var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')
var crypto = require('crypto')
var randToken = require('rand-token')
var Schema = mongoose.Schema

// The user schema attributes / characteristics / fields
var UserSchema = new Schema({
	email: {
		type: String,
		unique: true,
		lowercase: true
	},
	password: String,

	facebook: String,
	tokens: Array,

	profile: {
		name: {
			type: String,
			default: ''
		},
		picture: {
			type: String,
			default: ''
		}
	},

	isAdmin: {
		type: Boolean,
		default: false
	},

	api_token: {
		type: String,
		default: null
	},

	verify_token: {
		type: String,
		default: ''
	},

	verified: {
		type: Boolean,
		default: false
	},

	address: String,
	history: [{
		paid: {
			type: Number,
			default: 0
		},
		item: {
			type: Schema.Types.ObjectId,
			ref: 'Product'
		},
		category: {
			type: Schema.Types.ObjectId,
			ref: 'Category'
		}
	}]
})

// Hash the password before we even save it to the database
UserSchema.pre('save', function(next) {
	var user = this
	if (!user.isModified('password')) {
		return next()
	}
	bcrypt.genSalt(10, function(err, salt) {
		if (err) {
			return next(err)
		}
		bcrypt.hash(user.password, salt, null, function(err, hash) {
			if (err) {
				return next(err)
			}
			user.password = hash
			next()
		})
	})
})

UserSchema.methods.generateToken = function() {
	var user = this
	user.api_token = randToken.generate(32)
	user.save(function(err) {
		if (err) throw err
	})
}

// Compare password in the database and the one that the user type in
UserSchema.methods.comparePassword = function(password) {
	return bcrypt.compareSync(password, this.password)
}

UserSchema.methods.gravatar = function(size) {
	if (!this.size) size = 200
	var md5 = crypto.createHash('md5').update(this.email).digest('hex')
	return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro'
}

module.exports = mongoose.model('User', UserSchema)
