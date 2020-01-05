'use strict'
Object.assign(App,{
  onInit(){

    /**
      Construction de l'interface
    **/
    UI.prepare()

    /**
      Initialisation de toutes les classes
    **/
    log('* Chargement des couleurs…')
    AssociateColor.init()
    log('OK, couleurs chargés')

    log('* Chargement des domaines…')
    Domaine.init()
    log('OK, domaines chargés')

    log('* Chargement des catégories…')
    Categorie.init()
    log('OK, catégories chargés')

    log('* Chargement des projets…')
    Projet.init()
    log('OK, projets chargés')

    log('* Chargement des travaux…')
    Travail.init()
    log('OK, travaux chargés')

    // Pour préparer la classe, mais rien ne sera chargé
    Jour.init()

    /*
      Mettre ici le code à exécuter à l'initialisation de l'application
      (après le chargement complet de la page)
    */
    Semaine.build_main_semaine()

  }
})
