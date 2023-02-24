let db = require('../config/database');
let moment = require('moment');
moment.locale('fr'); // library moment.js pour les dates

class Result {

    constructor(d) {
        if(d == null) {
            this._id = null
            this._user = null
            this._total = null
            this._correct = null
            this.created = null
            this._modified = null
        } else {
            this._id = d.id
            this._user = d.user
            this._total = d.total
            this._correct = d.correct
            this.created = d.created
            this._modified = d.modified
        }
    }
    get id() {
        return this._id
    }
    get user() {
        return this._user
    }
    get total() {
        return this._total
    }
    get correct() {
        return this._correct
    }
    get created() {
        return moment(this._created)
    }
    get modified() {
        return moment(this._modified)
    }

    set id(x) {
        this._id = x
    }
    set user(x) {
         this._user = x
    }
    set total(x) {
         this._total = x
    }
    set correct(x) {
        this._correct = x
    }
    set created(x) {
         this._created = x
    }
    set modified(x) {
        this._modified = x
    }

  static all(callback) {
    db.query('SELECT * FROM results ORDER BY id DESC',
    function(err,datas) {
        callback(datas.map( (d) => new Result(d)) )
    })
  }
  static create(user, total, correct, callback) {
    db.query('insert into results (user, total, correct) VALUES (?,?,?)', [user, total, correct], (err, res) => {
        callback(res)
    })
  }


    // static to get all questions by total
    static findByUser(total, questionSeen, callback) {
        db.query('SELECT * FROM questions WHERE user LIKE "%"?"%" ', [total, questionSeen], 

function(err,datas) {
        callback(datas.map( (d) => new Result(d)) )
    })
            // // put the question in an array
            // let questions = []
            // res.forEach(element => {
            //     questions.push(element)
            // });
            //  callback(questions)
 

    }
    

}
module.exports = Result