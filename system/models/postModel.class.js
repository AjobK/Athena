const Connection = require('../connection.js')
const defaultModel = require('./defaultModel.class.js')

class PostModel extends defaultModel {
  selectName (title, callback) {
    let formatTitle = '%'

    formatTitle += title + '%'
    const sql = 'SELECT id, title, description FROM Post WHERE title LIKE ?'

    Connection.query(sql, formatTitle, (err, result) => {
      if (err) throw err
      callback(result)
    })
  }
}

module.exports = PostModel
