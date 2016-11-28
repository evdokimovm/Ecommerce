var mongoose = require('mongoose')
var Schema = mongoose.Schema

var TokenSchema = new Schema({
	value: String,
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	expireAt: {
		type: Date,
		expires: 3600,
		default: Date.now
	}
})

module.exports = mongoose.model('Token', TokenSchema)
