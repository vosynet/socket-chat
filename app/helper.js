'use strict'

const crypto = require('crypto')
const moment = require('moment')
const encryptionKey = process.env.ENC_KEY

class Helper {
    dbNow() {
        return moment().format('YYYY-MM-DD HH:mm:ss')
    }
    tableName(code) {
        let char = code[Math.round(code.length/2)-1]
		let buf = (Buffer.from(char)[0] % 32)
		let num = ('0' + buf).slice(-2)
		return 'chats_' + num
	}

	getNotme(code, u) {
		let us = code.split('|')
		return us[0] === u ? us[1] : us[0]
    }
    
    genCode(u1, u2) {
        let str = u1.substr(0,4) + u2 + u1 + u2.substr(0, 4)
        let hash = crypto.createHash('md5').update(str).digest("hex")
        return u1 + '|' + u2 + '|' + hash.substr(0, 16)
    }

    decrypt(text) {
		try {
			const appKey = encryptionKey
			let encryptedText = Buffer.from(text, 'hex');
			let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(appKey), appKey.slice(0, 16))
			let decrypted = decipher.update(encryptedText)
			decrypted = Buffer.concat([decrypted, decipher.final()])
			let result = decrypted.toString()
			result = JSON.parse(result)
			return result
		} catch(err) {
			return null
		}
	}

    checkToken(str, username) {
        let decrypted = module.exports.decrypt(str)
        if (!decrypted) {
            return false
        }
        if (decrypted.username !== username) {
            return false
        }
        return true
    }
}

module.exports = new Helper()