'use strict'
/** ---------------------------------------------------------------------
  *   Classe ProjetEditor
  *   -------------------
  *   Éditeur de projet
  *
*** --------------------------------------------------------------------- */
class ProjetEditor extends CommonElementEditor {
  static get properties(){
    return {
        id:               {hname:'ID',        type:'number',  hidden:true}
      , name:             {hname: 'Titre',    type:'string',  validator:{required:true, minLength:3, maxLength:0, uniq:true}}
      , categorieId:      {feminin:true, hname:'Catégorie', type:'Categorie'}
      , associatecolorId: {feminin:true, hname:'Couleur',   type:'AssociateColor'}
      , projectopener:    {hname: 'Ouverture', type:'string'}
      , worktime:         {hname: 'Temps de travail', type:'number'}
    }
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  innerForm(){
    return [
      DCreate('INPUT',{type:'text', id:this.idFor('name')})
    , this.rowFormForType(Categorie)
    , this.rowFormForType(AssociateColor)
    , this.rowFormForClass(ProjectOpener)
    ]
  }
}
