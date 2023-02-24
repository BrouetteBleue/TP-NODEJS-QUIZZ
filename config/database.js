let mysql = require('mysql');

let db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password:'',
  database: 'tp_quizz'  
})

db.connect()

module.exports = db