const express = require('express')
const router = express.Router()
const UserModel = require('../models/userModel.class.js')
const User = new UserModel()
const CheckClass = require('../globalFunctions/checkTemplate.class.js')

const template = {
  role: {
    type: 'int',
    required: true,
    foreign: {
      table: 'role',
      row: 'id'
    }
  },
  user_name: {
    type: 'string',
    required: true,
    unique: 'user'
  },
  display_name: {
    type: 'string',
    required: true
  },
  password: {
    type: 'hash',
    required: true
  },
  email: {
    type: 'email',
    required: true,
    unique: 'user'
  },
  level: {
    type: 'int',
    required: false
  }
}

const Check = new CheckClass()

router.get('/', (req, res) => {
  User.selectAll(result => {
    res.send(result)
  })
})

router.get('/:id', (req, res) => {
  User.selectOne(req.params.id, (result) => {
    if (isNaN(req.params.id)) {
      res.status(412).send( { 'msg': 'ID parameter must be an integer' } )
    } else {
      if (result.length === 0) {
        res.status(404).send( { 'msg': `User with id '${req.params.id}' can't be found` } )
      } else {
        res.send(result)
      }
    }
  })
})

router.post('/', async (req, res) => {
  const body = req.body

  const check = await Check.create(template, body)

  if (typeof check !== 'undefined') {
    return res.status(412).send(check)
  }

  User.create(body, () => {
    res.status(201).send( { 'msg': 'User has been created' } )
  })
})

router.post('/update', async (req, res) => {
  const body = req.body

  if (!body.id) {
    return res.status(412).send( { 'msg': 'ID has not been defined' } )
  }

  const check = await Check.update(template, body)

  if (typeof check !== 'undefined') {
    return res.status(412).send(check)
  }

  User.update(body, () => {
    res.send( { 'msg': `User with ID: ${body.id} has been updated` } )
  })
})

module.exports = router
