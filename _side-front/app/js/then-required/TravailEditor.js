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
      , tache:        {feminin:true, hname: 'Tâche',      type: 'string', validator:{required:true, minLength:3, maxLength:255}}
      , njour:        {hname: 'Jour',       type: 'number'}
      // Note : je ne préfère pas valider l'heure et la durée au niveau des
      // chevauchement maintenant car ce serait trop compliqué avec les travaux
      // récurrents. Les chevauchements sont checkés au moment de la construc-
      // tion.
      , heure:        {feminin:true, le:'l’', hname: 'Heure', type: 'float'}
      , duree:        {feminin:true, hname: 'Durée', type: 'float'}
      , recurrent:    {hname: 'Récurrent',        type: 'boolean'}
      , projetId:     {hname: 'Projet',           type: 'Projet'}
      , categorieId:  {hname: 'Catégorie',        type: 'Categorie'}
      , domaineId:    {hname: 'Domaine',          type: 'Domaine'}
      , associatecolorId: {hname:'Couleur',       type: 'AssociateColor'}
      , worktime:     {hname: 'Temps de travail', type:'number'}
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
      , this.rowFormForType('AssociateColor')
      , DCreate('DIV',{class:'row', inner:[
          DCreate('INPUT',{type:'checkbox', id:this.idFor('recurrent')})
        , DCreate('LABEL', {for:this.idFor('recurrent'), inner: 'Travail récurrent'})
      ]})
      ]
  }
}
