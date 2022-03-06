import chai = require('chai')
import chaiHttp = require('chai-http')
import assert = require('assert')
import { v4 as uuidv4 } from 'uuid'
import { UserAgentStore, AdminAgentStore, ModAgentStore, GuestAgentStore } from './utils/agents'
import DatabaseConnector from './utils/databaseConnector'

require('dotenv').config()

const captcha = process.env.HCAPTCHA_TEST_TOKEN

chai.use(chaiHttp)

UserAgentStore.initAgent()
ModAgentStore.initAgent()
AdminAgentStore.initAgent()

describe('Ban functionality', () => {
  const shortBannedUser = uuidv4()
  const longBannedUser = uuidv4()

  before((done) => {
    GuestAgentStore.agent
      .post('/profile/register')
      .send({
        username: shortBannedUser,
        password: 'Qwerty123',
        email: `${shortBannedUser}@test.com`,
        captcha
      })
      .end(() => {
        GuestAgentStore.agent
          .post('/profile/register')
          .send({
            username: longBannedUser,
            password: 'Qwerty123',
            email: `${longBannedUser}@test.com`,
            captcha
          })
          .end(() => {
            GuestAgentStore.agent
              .get('/logout')
              .end(() => {
                done()
              })
          })
      })
  })

  describe('Testing banning a user as user', () => {
    it('Souldn\'t ban a user as a user', (done) => {
      UserAgentStore.agent
        .patch('/ban/short')
        .send({
          username: shortBannedUser,
          days: 10,
          reason: 'being offensive'
        })
        .end((err, res) => {
          assert.equal(res.status, 403)
          done()
        })
    })
  })

  describe('Testing banning a user as modarator', () => {
    it('Souldn\'t longterm ban a user as a moderator', (done) => {
      ModAgentStore.agent
        .patch('/ban')
        .send({
          username: longBannedUser,
          days: 35,
          reason: 'being offensive'
        })
        .end((err, res) => {
          assert.equal(res.status, 403)
          done()
        })
    })

    it('Should short ban a user', (done) => {
      ModAgentStore.agent
        .patch('/ban/short')
        .send({
          username: shortBannedUser,
          days: 10,
          reason: 'being offensive'
        })
        .end((err, res) => {
          assert.equal(res.status, 200)

          ModAgentStore.agent
            .get(`/profile/${shortBannedUser}`)
            .end((err, res) => {
              assert.equal(res.status, 403)
              done()
            })
        })
    })
  })

  describe('Testing banning a user as admin', () => {
    it('Should long term ban a user as admin', (done) => {
      AdminAgentStore.agent
        .patch('/ban')
        .send({
          username: longBannedUser,
          days: 35,
          reason: 'being offensive'
        })
        .end(() => {
          AdminAgentStore.agent
            .get(`/profile/'${ longBannedUser }`)
            .end((err, res) => {
              assert.equal(res.status, 404)
              done()
            })
        })
    })
  })

  after((done) => {
    DatabaseConnector.getRepository('Account').then((repo) => {
      repo.findOne({ where: { user_name: shortBannedUser } }).then((shortUser) => {
        repo.delete(shortUser).then(() => {
          DatabaseConnector.getRepository('Account').then((repo) => {
            repo.findOne({ where: { user_name: longBannedUser } }).then((longUser) => {
              repo.delete(longUser).then(() => {
                done()
              }).catch((err) => [
                console.log(err)
              ])
            })
          })
        }).catch((err) => [
          console.log(err)
        ])
      })
    })
  })
})
