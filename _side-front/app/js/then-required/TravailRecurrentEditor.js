'use strict'
/** ---------------------------------------------------------------------
  *   Classe TravailCurrentEditor
  *   ------------------
  *   Pour l'édition d'un travail récurrent
  *
*** --------------------------------------------------------------------- */
class TravailRecurrentEditor extends CommonElementEditor {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */
  static get properties(){
    return {
        id:               {hname: 'ID',         type: 'number', hidden: true}
      , tache:            {hname: 'Tâche',      type: 'string'}
      , njour:            {hname: 'Jour',       type: 'number'}
      , recurrence:       {hname: 'Récurrence', type: 'string', default: 'none'}
      , recurrenceValue: {hname: 'Valeur de récurrence', type:'string', default:''}
      , startAt:          {hname: 'Commence le',type: 'string', default: TODAY.asJJMMAA(' ')}
      , endAt:            {hname: 'Fini le',    type: 'string', default: ''}
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
  innerForm(){
    var OptionsRecurrence = []
    for(var rec in DATA_RECURRENCES){
      var dataRec = DATA_RECURRENCES[rec]
      OptionsRecurrence.push(DCreate('OPTION', {inner:dataRec.hname, value:rec}))
    }

    return [
        DCreate('INPUT',{type:'text',   id:this.idFor('tache'), placeholder:"Tâche à exécuter"})
      , DCreate('DIV', {class:'row select', inner:[
          DCreate('LABEL',{inner: "Récurrence : "})
        , DCreate('SELECT', {id:this.idFor('recurrence'), inner:OptionsRecurrence, class:'auto'})
        , DCreate('INPUT',{type:'text', class:'noDisplay short', id:this.idFor('recurrenceValue')})
        , DCreate('DIV', {class:'rec-expli', id:this.idFor('recurrence_explication')})
        ]})
      , DCreate('DIV', {class:'row', inner:[
            DCreate('LABEL', {inner:'Commence le : '})
          , DCreate('INPUT',{type:'text', class:'medium', id:this.idFor('startAt'), placeholder:"JJ MM AA"})
        ]})
      , DCreate('DIV', {class:'row', inner:[
            DCreate('LABEL', {inner:'Fini le : '})
          , DCreate('INPUT',{type:'text', class:'medium', id:this.idFor('endAt'), placeholder:"JJ MM AA ou rien"})
        ]})
      , this.rowFormForJour('Jour', 'njour')
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
    DGet(`#${this.idFor('recurrence')}`).addEventListener('change', this.onChangeRecurrence.bind(this))
  }

  /**
    Méthode appelée quand on change la récurrence
  **/
  onChangeRecurrence(ev){
    // console.log("Changement de la récurrence")
    const recMenu = DGet(`#${this.idFor('recurrence')}`)
    const recExpli = DGet(`#${this.idFor('recurrence_explication')}`)
    const recSupValeu = DGet(`#${this.idFor('recurrenceValue')}`)
    const recValue = recMenu.value
    console.log("Valeur de récurrence :", recValue)
    const recData = DATA_RECURRENCES[recValue]
    recSupValeu.classList[recData.definable?'remove':'add']('noDisplay')
    recExpli.innerHTML = recData.explication.replace(/\$\{([a-zA-Z]+)\}/g, (tout,prop) => {return this.owner[`f_${prop}`]})
    return stopEvent(ev)
  }

}
