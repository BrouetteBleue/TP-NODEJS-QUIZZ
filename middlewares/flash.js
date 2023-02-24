caca = (req, res, next) => {
    

    if(req.session.flash) {
        // transfert du flash de la session vers les variables locales (dans la vue)
        res.locals.flash = req.session.flash
        // vider la session
        req.session.flash = []
    }

    
    req.flash = (type, content) => {

        if (req.session.flash === undefined) {
            req.session.flash = []
        }

        req.session.flash.push([type, content])
    }


    next()
}

module.exports = caca 