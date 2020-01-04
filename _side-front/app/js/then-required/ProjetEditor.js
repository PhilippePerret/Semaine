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
        id:             {hname:'ID',        type:'number', hidden:true}
      , name:           {hname: 'Titre',    type:'string'}
      , categorieId:    {hname:'Catégorie', type:'Categorie'}
      , associateColor: {hname:'Couleur associée', type: 'AsssociateColor'}
    }
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  innerForm(){
    return [
      DCreate('INPUT',{type:'text', id:this.idFor('name')})
    , this.rowFormForType('Categorie')
    , this.rowFormForType('AssociateColor')
    ]
  }
}
