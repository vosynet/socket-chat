'use strict'

const controller = require('./controller')
const { checkToken } = require('./helper')

const Socket = async (server) => {
	const io = require('socket.io')(server, {
		cors: {
			origin: '*',
		}
	})
	io.on('connection', (socket) => {
		socket.on('listen', async (data) => {
			let check = checkToken(data.token, data.username)
			if (!check) {
				return false
			}
			
			console.log('Joining:', data.username)
			socket.join(data.username)
		})

		socket.on('new_message', async (data) => {
			let check = checkToken(data.token, data.from)
			if (!check) {
				return false
			}

			let store = await controller.ioNewMessage(data)
			if (!store) {
				return socket.emit('error', 'Message not sent!')
			}

			let feedback = JSON.parse(JSON.stringify(store))
			io.to(feedback.to).emit('new_message', feedback)
			io.to(feedback.from).emit('new_message', feedback)
		})

		socket.on('read_message', async (data) => {
			let check = checkToken(data.token, data.to)
			if (!check) {
				return false
			}

			let read = await controller.ioReadMessage(data)
			if (!read) {
				return socket.emit('error', 'Something wrong!')
			}

			io.to(read.to).emit('read_message', read)
			io.to(read.from).emit('read_message', read)
		})
	})
}

module.exports = Socket