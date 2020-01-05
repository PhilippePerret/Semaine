'use strict'
/** ---------------------------------------------------------------------
  *   Classe TravailCurrentEditor
  *   ------------------
  *   Pour l'édition d'un travail récurrent
  *
*** --------------------------------------------------------------------- */
class TravailCurrentEditor extends CommonElementEditor {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */
  static get properties(){
    return {
        id:               {hname: 'ID',         type: 'number', hidden: true}
      , tache:            {hname: 'Tâche',      type: 'string'}
      , jours:            {hname: 'Jours',      type: 'string'}
      , recurrence:       {hname: 'Récurrence', type: 'string'}
      , startLe:          {hname: 'Commence le',type: 'string'}
      , heure:            {hname: 'Heure',      type: 'float'}
      , duree:            {hname: 'Durée',      type: 'float'}
      , projetId:         {hname: 'Projet',     type: 'Projet'}
      , categorieId:      {hname: 'Catégorie',  type: 'Categorie'}
      , domaineId:        {hname: 'Domaine',    type: 'Domaine'}
      , associatecolorId: {hname:'Couleur',     type: 'AssociateColor'}

    }
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  /**
    Retourne le contenu principal du formulaire d'édition
  **/
  DATA_RECURRENCES = {
      'jour':   {hname: 'tous les jours'}
    , 'hebdo':  {hname: 'un par semaine (~ briefing)'}
    , 'bihed':  {hname: 'un toutes les 2 semaines'}
    , 'mois':   {hname: 'un par mois (~ bilan)'}
    , 'bimen':  {hname: 'bimensuel'}
    , 'trim':   {hname: 'trimestriel (~ conseil)'}
    , 'annee':  {hname: 'un par an (~ anniversaire)'}
  }
  innerForm(){
    OptionsRecurrence = []
    for(var rec in DATA_RECURRENCES){
      var dataRec = DATA_RECURRENCES[rec]
      OptionsRecurrence.push(DCreate('OPTION', {inner:dataRec.hname, value:rec}))
    }

    return [
        DCreate('INPUT',{type:'text',   id:this.idFor('tache'), placeholder:"Tâche à exécuter"})
      , DCreate('INPUT',{type:'text',   id:this.idFor('jours'), placeholder:'all ou liste d’indices'})
      , DCreate('DIV', {class:'row select', inner:[
          DCreate('LABEL',{inner: "Récurrence"})
        , DCreate('SELECT', {id:this.idFor('recurrence'), inner:OptionsRecurrence, class:'auto'})
        , DCreate('INPUT',{type:'text', class:'hidden short', id:this.idFor('recurrence_value')})

        ]})
      , this.rowFormForHour('Heure', 'heure')
      , this.rowFormForDuree('Durée', 'duree')
      , this.rowFormForType('Projet')
      , this.rowFormForType('Categorie')
      , this.rowFormForType('Domaine')
      , this.rowFormForType('AssociateColor')
      ]
  }


  /**
    Observation du formulaire
  **/
  observe(){
    console.log('-> observe du formulaire de travail récurrent')
    DGet(`#${this.idFor('recurrence')}`).addEventListener('change', this.onChangeRecurrence.bind(this))
  }

  /**
    Méthode appelée quand on change la récurrence
  **/
  onChangeRecurrence(ev){
    console.log("Changement de la récurrence")
    return stopEvent(ev)
  }

}
