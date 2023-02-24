let db = require('../config/database');
let moment = require('moment');
moment.locale('fr'); // library moment.js pour les dates

class Question {

    constructor(d) {
        if(d == null) {
            this._id = null
            this._content = null
            this._theme = null
            this._validation = null
            this.created = null
            this._modified = null
        } else {
            this._id = d.id
            this._content = d.content
            this._theme = d.theme
            this._validation = d.validation
            this.created = d.created
            this._modified = d.modified
        }
    }
    get id() {
        return this._id
    }
    get content() {
        return this._content
    }
    get theme() {
        return this._theme
    }
    get validation() {
        return this._validation
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
    set content(x) {
         this._content = x
    }
    set theme(x) {
         this._theme = x
    }
    set validation(x) {
        this._validation = x
    }
    set created(x) {
         this._created = x
    }
    set modified(x) {
        this._modified = x
    }

  static all(callback) {
    db.query('SELECT * FROM questions ORDER BY content',
    function(err,datas) {
        callback(datas.map( (d) => new Game(d)) )
    })
  }
  static create(content, theme, callback) {
    db.query('insert into questions (content, theme) VALUES (?,?)', [content, theme], (err, res) => {
        callback(res)
    })
  }

    static validate(id, callback) {
        db.query('UPDATE questions SET validation = 1 WHERE id = ?', [id], (err, res) => {
            callback(res)
        })
    }
    
    static delete(id, callback) {
        db.query('DELETE FROM questions WHERE id = ?', [id], (err, res) => {
            callback(res)
        })
    }

    static themes(callback) {
        db.query('SELECT DISTINCT theme FROM questions', (err, res) => {
            
             let themes = []
             res.forEach(element => {
                // si le theme de la question contient une virgule (donc plusieurs themes) on les split 
                if(element.theme.includes(',')) {
                    // on check si le theme n'est pas déjà dans le tableau                 

                    let split = element.theme.split(',')
                    split.forEach(element => {                       
                        if(!themes.includes(element)) {
                            themes.push(element)
                        }
                    });

                } else{
                    themes.push(element.theme)
                }
                
             });
             callback(themes)

        })
    }

    static findByTheme(theme, questionSeen, callback) {
        db.query('SELECT * FROM questions WHERE theme LIKE "%"?"%" AND validation = 1 AND id NOT IN (?) ORDER BY RAND() LIMIT 0,1', [theme, questionSeen], 

        function(err,datas) {
            callback(datas.map( (d) => new Question(d)) )
        })
    }

    static notValidated(callback) {
        db.query('SELECT * FROM questions WHERE validation = 0', (err, res) => {
            callback(res.map( (d) => new Question(d)) )
        })
    }
}
module.exports = Question