'use strict'

const path = require('path')
const AWS = require('aws-sdk')

class Cloud {

  constructor(spec) {
    this._spec = spec
    this.load()
  }

  load () {
    // Make sure AWS is loaded
    AWS.config.loadFromPath(path.resolve(this.spec.settings.awsConfigFile))
  }

  sendEmail(subject, body) {
    const params = {
      Source: this.spec.email.from,
      Destination: {
        ToAddresses: this.spec.email.to
      },
      Message: {
        Body: {
          Text: {
            Data: body,
            Charset: 'utf8'
          }
        },
        Subject: {
          Data: subject,
          Charset: 'utf8'
        }
      },
      ReplyToAddresses: this.spec.email.replyTo,
    }

    const ses = new AWS.SES()
    return new Promise((resolve, reject) => {
      ses.sendEmail(params, (error, data) => {
        if (error) {
          reject(error)
          return
        }

        resolve(data)
      })
    })
  }

  get spec () {
    return this._spec
  }

}

module.exports = Cloud
