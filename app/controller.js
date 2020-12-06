'use strict'

const knex = require('knex')({
	client: 'mysql',
	connection: {
		host : process.env.DB_HOST,
		user : process.env.DB_USERNAME,
		password : process.env.DB_PASSWORD,
		database : process.env.DB_DATABASE
	}
})
const moment = require('moment')
const helper = require('./helper')

class Controller {
	async index(req, res) {
		return res.render('index')
	}

	async getRoomList(req, res) {
		const { username } = req.body
		let data = await knex.table('rooms').where('username_1', username).orWhere('username_2', username).orderBy('updated_at', 'desc')
		return res.send(data)
	}

	async getMessageList(req, res) {
		const { room_code } = req.body
		let table = helper.tableName(room_code)
		let messages = await knex.table(table).where('room_code', room_code)
		return res.send(messages)
	}

	async generateCode(req, res) {
		const { username_1, username_2 } = req.body
		console.log(req.body)
		return res.send(helper.genCode(username_1, username_2))
	}

	async ioNewMessage({ from, room_code, message }) {
		let to = helper.getNotme(room_code, from)
		let table = helper.tableName(room_code)

		let room = await knex.table('rooms').where('code', room_code).first()
		let newRoom = false
		if (!room) {
			room = {
				username_1: from,
				username_2: to,
				code: room_code,
				table,
				updated_at: helper.dbNow()
			}
			await knex.table('rooms').insert(room)
			newRoom = true
		}

		let data = {
			room_code,
			from,
			to,
			message,
			created_at: moment().format('YYYY-MM-DD HH:mm:ss')
		}
		let store = await knex.table(table).insert(data)
		data.id = store[0]
		if (!newRoom) {
			await knex.table('rooms').where('id', room.id).update({
				updated_at: helper.dbNow()
			})
		}

		return data
	}

	async ioReadMessage({ room_code, to }) {
		let from = helper.getNotme(room_code, to)
		let table = helper.tableName(room_code)
		let now = moment().format('YYYY-MM-DD HH:mm:ss')
		await knex.table(table).where('from', from).where('to', to).update({
			readed_at: now
		})
		return {
			from, to, readed_at: now
		}
	}

}

module.exports = new Controller()