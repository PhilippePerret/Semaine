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
        id:         {hname: 'ID',     type: 'number', hidden: true}
      , tache:      {hname: 'Tâche',  type: 'string'}
      , heure:      {hname: 'Heure',  type: 'float'}
      , duree:      {hname: 'Durée',  type: 'float'}
      , projetId:   {hname: 'Projet', type: 'Projet' /* donc un identifiant */}
      , categorieId:{hname: 'Catégorie', type: 'Category', /*idem*/}
      , domaineId:  {hname: 'Domaine', type: 'Domaine', /*idem*/}
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
      , DCreate('INPUT',{type:'text', id:this.idFor('heure'), placeholder: 'Heure'})
      , DCreate('INPUT',{type:'text', id:this.idFor('duree'), placeholder: 'Durée (en heure)'})
      , this.rowFormForType('Projet')
      ]
  }

  /**
    Observation du formulaire
  **/
  observe(){
    console.log("Je vais observer de façon particulière.")
  }

}
