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
    AssociateColor.init()
    Domaine.init()
    Categorie.init()
    Projet.init()
    Travail.init()
    TravailRecurrent.init()

    /*
      On affiche toujours la semaine courante
    */
    SemaineLogic.buildCurrent()

  }
})
