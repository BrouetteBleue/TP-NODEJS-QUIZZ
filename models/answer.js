let db = require('../config/database');
let moment = require('moment');
moment.locale('fr'); // library moment.js pour les dates

class Answer {

    constructor(d) {
        if(d == null) {
            this._id = null
            this._question_id = null
            this._content = null
            this._correct = null
            this.created = null
            this._modified = null
        } else {
            this._id = d.id
            this._question_id = d.question_id
            this._content = d.content
            this._correct = d.correct
            this.created = d.created
            this._modified = d.modified
        }
    }
    get id() {
        return this._id
    }
    get question_id() {
        return this._question_id
    }
    get content() {
        return this._content
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
    set question_id(x) {
         this._question_id = x
    }
    set content(x) {
         this._content = x
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

  static AnswerQuestion(question_id,callback) {
    db.query('SELECT * FROM answers WHERE question_id = ? ORDER BY RAND()',[question_id],
    function(err,datas) {
        callback(datas.map( (d) => new Answer(d)) )
    })
  }
  static create(question_id, content, correct, callback) {
    db.query('insert into answers (question_id, content, correct) VALUES (?,?,?)', [question_id, content, correct], (err, res) => {
        callback(res)
    })
  }

  // check if the answer is correct
    static checkAnswer(answer_id, callback) {
        db.query('SELECT correct FROM answers WHERE id = ?', [answer_id], (err, res) => {
            callback(res[0].correct)
        })
    }

}
module.exports = Answer