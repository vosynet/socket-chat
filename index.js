'use strict'

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const controller = require('./app/controller')
const app = express()
const port = process.env.PORT || 3010

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.get('/', controller.index)
app.post('/room', controller.getRoomList)
app.post('/generate-code', controller.generateCode)
app.post('/message', controller.getMessageList)

const server = app.listen(port, () =>{
	console.log('Listening on http://localhost:' + port)
})

require('./app/socket')(server)
