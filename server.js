let express = require("express");
let session = require('express-session');
let Question = require('./models/question')
let Answer = require('./models/answer')
let User = require('./models/user')
let Result = require('./models/result')

let app = express();
app.set("view engine", "ejs");


// permet de 'décoder' les données de requêtes
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// rend le dossier styles public 
app.use('/assets', express.static('public'))

// pour la session
app.set('trust proxy', 1)
app.use(session({
  secret: '12345ihn45874kkkk6m', //clé unique
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false , expires: new Date("2023-12-31")}  // false si http , true si https
}))

///// middleware /////
app.use(require('./middlewares/user'))
app.use(require('./middlewares/flash'))
app.use(require('./middlewares/questions'))


//routes
app.get("/", (req, res) => { 

  Question.themes((retour) => {
  console.log(retour);
  res.render('pages/index', {themes : retour})
})
});


app.get('/create-question', (req, res) => {
  res.render('pages/question-form')
})

app.post('/create-question', (req, res) => {
  if(req.body.question === undefined || req.body.question === '') {
    console.log('question vide')
    req.flash('error', 'La question ne peut pas être vide')
    res.redirect('/create-question')

  } else {
    let p = null
    if(req.body.theme === undefined){
        req.flash('error', 'Vous devez choisir un theme')
        res.redirect('/create-question')
      }else {
          // Si l'utilisateur n'a pas donné de réponse a sa question


          ////////////// Traitement des réponses //////////////
                  const answers = [];
                    // Itérer sur tous les champs de réponse
                    for (const key in req.body) {
                      if (key.startsWith('answer[')) {
                        const match = key.match(/answer\[(\d+)\]\[(.+)\]/);
                        const answerIndex = parseInt(match[1]);
                        const answerKey = match[2];

                        // Si le tableau de réponse n'existe pas encore pour l'index courant, le créer
                        if (!answers[answerIndex]) {
                          answers[answerIndex] = {};
                        }

                        // Ajouter la réponse à l'objet du tableau de réponse
                        answers[answerIndex][answerKey] = req.body[key];
                      }
                    }

                    // Ajouter les réponses à la propriété "answer" de l'objet req.body
                    req.body.answer = answers;

            ///////////// Fin traitement des réponses /////////////

            // le tableau de réponses a un champ vide a chaque fois donc faire -1 pour avoir le nombre de réponses

          if(req.body.answer.length === 0){
            req.flash('error', 'Vous devez écrire au moins une réponse')
            res.redirect('/create-question')
          }else {
            // pour chaque réponse on vérifie si au moins une réponse a le champ 'correct' à 1
            let correct = false
            req.body.answer.forEach((answer) => {
              if(answer.correct === "on"){
                answer.correct = 1 // si oui on met 1
                correct = true
              }else{
                answer.correct = 0 // si non on crée le champ correct et on met 0
              }
            })
            // si correct est toujours à false c'est que l'utilisateur n'a pas donné au moins une réponse correcte
            if(correct === false){
              req.flash('error', 'Vous devez donner au moins une réponse correcte')
              res.redirect('/create-question')
            }else {
                if(Array.isArray(req.body.theme)){
                  p = req.body.theme.join(',')
                }else {
                  p = req.body.theme
                }
                Question.create(req.body.question, p,(result) => {
                   console.log(result.insertId) // on récupère l'id de la question créee

                  // on crée les réponses
                  for (let i = 1; i < req.body.answer.length; i++) {
                    Answer.create(result.insertId, req.body.answer[i].answer, req.body.answer[i].correct, () => {
                      console.log( req.body.answer[i])
                    })
                  }

                  req.flash('sucess', 'La question a bien été crée')
                  res.redirect('/create-question')
                }) 
            }
          }
      }
    }
})

app.get('/login', (req, res) => {
  res.render('pages/login')
})

app.post('/login', (req, res) => {
  if(req.body.username === undefined || req.body.username === '') {
    console.log('username vide')
    req.flash('error', 'Le nom d\'utilisateur ne peut pas être vide')
    res.redirect('/login')

  } else {
    User.login(req.body.username, req.body.password, (result) => {
      if(result === false){
        req.flash('error', 'Le nom d\'utilisateur ou le mot de passe est incorrect')
        res.redirect('/login')
      }else {
        req.session.username = req.body.username
        res.redirect('/')
      }
    })
  }
})

// singin page
app.get('/signin', (req, res) => {
  res.render('pages/signin')
})

// singin post
app.post('/signin', (req, res) => {
  if(req.body.username === undefined || req.body.username === '') {
    console.log('username vide')
    req.flash('error', 'Le nom d\'utilisateur ne peut pas être vide')
    res.redirect('/signin')

  } else {
    User.create(req.body.username, req.body.password, (result) => {
      if(result === false){
        req.flash('error', 'Le nom d\'utilisateur existe déjà')
        res.redirect('/signin')
      }else {
        req.session.username = req.body.username
        res.redirect('/')
      }
    })
  }
})

// logout
app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

app.get('/quizz/:theme', (req, res) => {
  Question.findByTheme(req.params.theme, req.session.questionSeen, (result) => {

    req.session.started = true

    if(result.length === 0 ){ // si le tableau est vide c'est que toutes les questions ont été posées
      console.log('fin du quizz');
      let score = req.session.score
      let session = req.session.started
      let nbquestion = req.session.questionIndex
      let username = req.session.username
      delete req.session.score // on vide les sessions
      delete req.session.started
      delete req.session.questionIndex
      delete req.session.questionSeen
      console.log(req.session.score);

      // create a new result
      Result.create(username, nbquestion, score, () => {
        console.log('result created')
      })





      // req.session.questionIndex.destroy()

      res.render('pages/SessionFinie', {
        questions : nbquestion,
        score :  score,
        theme : req.params.theme ,
        user : username
      })
    }else {


        Answer.AnswerQuestion(result[0].id, (resultAnswer) => {

        res.render('pages/quizz', {
          questionIndex : req.session.questionIndex,
          question : result[0].content, 
          theme : req.params.theme , 
          answers : resultAnswer,
          questionId : result[0].id
        })
        })


      }
    //console.log(result[0]._id);  

    // il faut garder en mémoire lid de la question pour ne pas la réafficher

  })
})

app.post('/quizzCheck', (req, res) => {
  req.session.questionSeen.push(req.body.questionID)

  req.session.questionIndex += 1
  if(!req.body.stop == 1){
    if(req.body.answer == 1){
    req.session.score += 1
    console.log(req.session.score);
    res.redirect('/quizz/' + req.body.theme)
  }else{
    res.redirect('/quizz/' + req.body.theme)
  }
  }else {
    console.log('fin du quizz');
      let score = req.session.score
      let session = req.session.started
      let nbquestion = req.session.questionIndex
      let username = req.session.username
      delete req.session.score // on vide les sessions
      delete req.session.started
      delete req.session.questionIndex
      delete req.session.questionSeen
      console.log(req.session.score);

      // create a new result
      Result.create(username, nbquestion, score, () => {
        console.log('result created')
      })

      res.render('pages/SessionFinie', {
        questions : nbquestion-1,
        score :  score,
        theme : req.params.theme ,
        user : username
      })
  }
  
  
  
})


app.get('/result', (req, res) => {
  Result.all((result) => {
    res.render('pages/results', {
      result : result
    })
  })
})

// app.get('/moderate-question', (req, res) => {
//   const questions = []
//   const reponses = []
//   Question.notValidated((result) => {

    
//     //for each question we need to get the answers
//     for (let i = 0; i < result.length; i++) {
//       Answer.AnswerQuestion(result[i].id, (resultAnswer) => {
//         result[i].answers = resultAnswer
//         console.log(resultAnswer);
        
//        reponses.push(resultAnswer)
     
//       }) 
//     }
      
//     questions.push(result)
//   }) ;res.render('pages/moderate-questions', {  
//           questions : questions,
//           answer : reponses
//         })
// })

app.get('/moderate-question', async (req, res) => {
  try {
    const questions = await new Promise((resolve, reject) => {
      Question.notValidated((result) => {
        resolve(result);
      });
    });
    const reponses = await Promise.all(
      questions.map((question) => {
        return new Promise((resolve, reject) => {
          Answer.AnswerQuestion(question.id, (result) => {
            question.answers = result;
            resolve(result);
          });
        });
      })
    );
    console.log(reponses);
    res.render('pages/moderate-questions', {  
      questions : questions,
      answers : reponses
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post('/moderate-question', (req, res) => {
  console.log(req.body);
  if(req.body.action == 1){
    Question.validate(req.body.id, () => {
      res.redirect('/moderate-question')
    })
  }else {
    Question.delete(req.body.id, () => {
      res.redirect('/moderate-question')
    })
  }
})

app.get("/*", (req, res) => {
  res.send("ceci est une route non déclarée");
});  

app.listen(3003); 