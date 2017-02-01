'use strict'

const nodemailer = require('nodemailer')
const ses = require('nodemailer-ses-transport')

class Notifier {

  constructor(spec) {
    this._spec = spec
    this.configure()
  }

  get spec() {
    return this._spec
  }

  get mailer() {
    return this._mailer
  }

  configure() {
    this._mailer = nodemailer.createTransport(ses({
      accessKeyId: this.spec.secret.aws.key,
      secretAccessKey: this.spec.secret.aws.secret
    }))
  }

  sendEmail() {
    this.mailer.sendMail({
       to: 'idancalinescu@gmail.com',
       from: this.spec.email.from,
       subject: 'greetings',
       text: 'your <b>message</b> goes here'
     }, (err, data) => {
       console.log(err, data)
     })
  }
}

module.exports = Notifier
