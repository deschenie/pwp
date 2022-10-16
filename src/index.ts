import {Application} from 'express'
import {Request, Response} from 'express'
import { check, validationResult } from 'express-validator'
const express = require('express')
const morgan = require('morgan')
const bodyParser = require("body-parser")
const Recaptcha = require('express-recaptcha').RecaptchaV2
const formData = require("form-data")
const Mailgun = require("mailgun.js")

//require('dotenv').config()

//start express app
const app: Application = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

const recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY)
const mailgun = new Mailgun(formData)
const mailgunClient = mailgun.client({username: "api", key: process.env.MAILGUN_API_KEY})
const handleGetRequest = ((request: Request, response: Response)=> {
  return response.json("this thing is on")
})

const validation = [
  check("contactName", "a valid name is required.").not().isEmpty().trim().escape(),
  check("contactEmail", "please provide a valid email address").isEmail(),
  check("contactSubject").optional().trim().escape(),
  check("contactMessage", "please include a message shorter than 2000 characters").trim().escape().isLength({min:1, max:2000})
]
function handlePostRequest(request: Request, response: Response) {
  response.append("Content-Type", "text/html")
  response.append("Access-Control-Allow-Origin", "*")
  const {contactName, contactEmail, contactSubject, contactMessage} = request.body

//@ts-ignore typescript does not know request.recaptcha was set by the express-recaptcha middleware
  if(request.recaptcha.error) {
    return response.send(`<div class='alert alert-danger' role='alert'><strong>Oh Snap!</strong> There was a Recaptcha error. Please try again.</div>`)
  }

  const errors = validationResult(request)
    if (errors.isEmpty() === false){
      const currentError = errors.array()[0]
      return response.send(`<div class="alert alert-danger" role="alert"><strong>Ruh Roh!</strong>${currentError.msg}</div>`)
  }

const mailgunMessage = {
      from:`${contactName} <postmaster@${process.env.MAILGUN_DOMAIN as string}>`,
      to: process.env.MAIL_RECIPIENT,
      subject: `${contactEmail}:${contactSubject}`,
      text:contactMessage
}
    console.log(mailgunMessage)
    mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, mailgunMessage).then((msg: any) => response.send(
      `<div class="alert alert-success" role="alert">Email sent successfully</div>`
    )).catch((error: any) => {
      console.error(error)
      return response.send(`  \`<div class='alert alert-danger' role='alert'><strong>Oh Snap!</strong> Email Failed. Please Try Again.</div>\`
  `)
    })
}

const indexRoute = express.Router()

indexRoute.route('/')
  .get(handleGetRequest).post(recaptcha.middleware.verify, validation, handlePostRequest)

app.use('/apis', indexRoute)


app.listen(4200, () => {
  console.log("express built successfully")
})