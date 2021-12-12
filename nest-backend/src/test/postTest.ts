import chai = require('chai')
import chaiHttp = require('chai-http')
import assert = require('assert')
import { v4 as uuidv4 } from 'uuid'
import { Post } from '../entities/post.entity'

require('dotenv').config()

const captcha = process.env.HCAPTCHA_TEST_TOKEN

chai.use(chaiHttp)

describe('Post functionalities', () => {
  const agent = chai.request.agent('http://localhost:3000/api')
  let post: Post

  before((done) => {
    require('dotenv').config()

    agent
      .post('/login')
      .send({
        username: 'User',
        password: 'Qwerty123',
        captcha
      })
      .end(() => {
        agent
          .get('/post/owned-by/User')
          .end((err, res) => {
            post = res.body[0]
            done()
          })
      })
  })

  it('Should create a post', (done) => {
    const id = uuidv4()
    agent
      .post('/post')
      .send({
        title: id,
        description: 'This is a post to test if you can create a post',
        content: 'example text'
      })
      .end(() => {
        agent
          .get('/post/owned-by/User')
          .end((err, res) => {
            assert.equal(res.body[0].title, id)
            done()
          })
      })
  })

  it('Should update a post', (done) => {
    const id = uuidv4()
    agent
      .put('/post/' + post.path)
      .send({
        title: id,
        description: 'This is a post to test if you can create a post',
        content: 'example text'
      })
      .end(() => {
        agent
          .get('/post/' + post.path)
          .end((err, res) => {
            assert.equal(res.body.post.title, id)
            done()
          })
      })
  })

  it('Should archive post', (done) => {
    agent
      .put('/post/archive/' + post.path)
      .end(() => {
        agent
          .get('/post/owned-by/User')
          .end((err, res) => {
            assert.notEqual(res.body[0].title, true)
            done()
          })
      })
  })
})
