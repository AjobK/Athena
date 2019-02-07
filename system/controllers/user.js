const express = require('express')
const router = express.Router()
const UserModel = require('../models/userModel.class.js')
const User = new UserModel()
const CheckClass = require('../checkTemplate.class.js')

const template = {
  id: {
    type: 'string',
    required: true
  },
  role: {
    type: 'int',
    required: true
  },
  username: {
    type: 'string',
    required: true
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
    required: true
  },
  level: {
    type: 'int',
    required: false
  },
  rows_scrolled: {
    type: 'int',
    required: true
  },
  created_at: {
    type: 'date',
    required: false
  },
  updated_at: {
    type: 'date',
    required: false
  },
  archived_at: {
    type: 'date',
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

router.post('/', (req, res) => {
  const body = req.body
  const check = Check.check(template, body)

  if (typeof check !== 'undefined') {
    res.status(412).send(check)

    return
  }
  User.create(body, () => {
    res.status(201).send( { 'msg': 'User has been created' } )
  })
})

module.exports = router
