var express = require('express')
var morgan = require('morgan')
var mongoose = require('mongoose')

var app = express()

mongoose.connect('mongodb://localhost:27017/ecommerce')

app.use(morgan('dev'))

var port = process.env.PORT || 8080
app.listen(port, function() {
	console.log('Node.js listening on port ' + port)
})
