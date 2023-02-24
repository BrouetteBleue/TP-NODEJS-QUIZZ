module.exports = (req, res, next) => {
    //si le username de la session est vide on le fixe
if (!req.session.questionSeen)
req.session.questionSeen = [0];


// si une session de quizz est commencée
if (!req.session.started) 
    req.session.score = 0

    
if(!req.session.questionIndex)
    req.session.questionIndex = 0

    // on place le username de la sesion dans les variables locales(dispo sur la page)
res.locals.questionSeen = req.session.questionSeen
    //suite des execut
    next()
}