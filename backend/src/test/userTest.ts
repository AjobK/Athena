import chai = require('chai')
import chaiHttp = require('chai-http')
import assert = require('assert')
import { v4 as uuidv4 } from 'uuid'

require('dotenv').config()

const captcha = process.env.HCAPTCHA_TEST_TOKEN

chai.use(chaiHttp)

describe('Testing the login/register', () => {
  const id = uuidv4()
  const agent = chai.request.agent(process.env.BACKEND_TEST_URL)

  describe('Register tests', () => {
    it('Shouldn\'t register user because no numbers are present in the password', (done) => {
      agent
        .post('/profile/register')
        .send({
          username: `test${ id }`,
          password: 'Qwerty',
          email: `${ id }@test.com`,
          captcha
        })
        .end((err, res) => {
          assert.equal(res.status, 400)
          done()
        })
    })

    it('Shouldn\'t register user because no upper case characters are present in the password', (done) => {
      agent
        .post('/profile/register')
        .send({
          username: `test${ id }`,
          password: 'qwerty123',
          email: `${ id }@test.com`,
          captcha
        })
        .end((err, res) => {
          assert.equal(res.status, 400)
          done()
        })
    })

    it('Shouldn\'t register user because the user already exists', (done) => {
      agent
        .post('/profile/register')
        .send({
          username: 'User',
          password: 'Qwerty123',
          email: `${ id }@test.com`,
          captcha
        })
        .end((err, res) => {
          assert.equal(res.status, 401)
          done()
        })
    })

    it('Should register a new user', (done) => {
      agent
        .post('/profile/register')
        .send({
          username: `test${ id }`,
          password: '123Qwerty',
          email: `${ id }@test.com`,
          captcha
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          done()
        })
    })
  })

  describe('Testing login functionalities', () => {
    it('Shouln\'t login with invalid username and password', (done) => {
      agent
        .post('/login')
        .send({
          username: 'user',
          password: 'qwerty123',
          captcha
        })
        .end((err, res) => {
          assert.equal(res.status, 403)
          done()
        })
    })

    it('Should login with correct username and password', (done) => {
      agent
        .post('/login')
        .send({
          username: 'User',
          password: 'Qwerty123',
          captcha
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          done()
        })
    })

    it('Should verify the user is logged in', (done) => {
      agent
        .get('/login-verify')
        .end((err, res) => {
          assert.equal(res.status, 200)
          done()
        })
    })

    it('Should logout user', (done) => {
      agent
        .get('/logout')
        .end((err, res) => {
          assert.equal(res.status, 200)

          agent
            .get('/login-verify')
            .end((err, res) => {
              assert.equal(res.status, 401)
              done()
            })
        })
    })
  })
})
