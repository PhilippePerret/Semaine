'use strict'
Object.assign(App,{
  onInit(){

    // Projet.buildDefaultValues() // ATTENTION ! RÉINITIALISE TOUS LES PROJETS
    // Projet.load()

    /*
      Mettre ici le code à exécuter à l'initialisation de l'application
      (après le chargement complet de la page)
    */
    Semaine.build_main_semaine()

    ProjetEditor.chooseFor()
  }
})
