'use strict'
/** ---------------------------------------------------------------------
  *   Classe TravailEditor
  *   ------------------
  *   Pour l'édition d'un travail
  *
*** --------------------------------------------------------------------- */
class TravailEditor extends CommonElementEditor {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */
  static get properties(){
    return {
        id:           {hname: 'ID',         type: 'number', hidden: true}
      , tache:        {hname: 'Tâche',      type: 'string'}
      , njour:        {hname: 'Jour',       type: 'number'}
      , heure:        {hname: 'Heure',      type: 'float'}
      , duree:        {hname: 'Durée',      type: 'float'}
      , projetId:     {hname: 'Projet',     type: 'Projet'}
      , categorieId:  {hname: 'Catégorie',  type: 'Categorie'}
    }
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  /**
    Retourne le contenu principal du formulaire d'édition
  **/
  innerForm(){
    return [
        DCreate('INPUT',{type:'text',   id:this.idFor('tache'), placeholder:"Tâche à exécuter"})
      , this.rowFormForJour('Jour', 'njour')
      , this.rowFormForHour('Heure', 'heure')
      , this.rowFormForDuree('Durée', 'duree')
      , this.rowFormForType('Projet')
      , this.rowFormForType('Categorie')
      ]
  }


  /**
    Observation du formulaire
  **/
  observe(){
    console.log("Je vais observer de façon particulière.")
  }

}
