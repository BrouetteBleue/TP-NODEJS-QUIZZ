// le but est de s'assurer que l'on ai toujours un nom
// pour désigner l'utilisateur
// soit l'user a choisit son pseudo soit on lui fixe son pseudo

module.exports = (req, res, next) => {
    //si le username de la session est vide on le fixe
if (!req.session.username)
req.session.username = 'Anonyme';

    // on place le username de la sesion dans les variables locales(dispo sur la page)
res.locals.username = req.session.username
    //suite des execut
    next()
}