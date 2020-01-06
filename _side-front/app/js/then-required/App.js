'use strict'
Object.assign(App,{
  onInit(){

    Notification.requestPermission().then(function(result) {
      if (result != 'granted'){
        alert("Attention, pour une raison inconnue, je ne pourrai pas faire de notification.")
      }
    });

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

    log('* Chargement des travaux récurrents…')
    TravailRecurrent.init()
    log('OK, travaux chargés')

    /*
      On affiche toujours la semaine courante
    */
    SemaineLogic.buildCurrent()

  }
})
