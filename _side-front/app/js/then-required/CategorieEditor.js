'use strict'
/** ---------------------------------------------------------------------
  *   Classe CategorieEditor
  *   -------------------
  *   Éditeur de projet
  *
*** --------------------------------------------------------------------- */
class CategorieEditor extends CommonElementEditor {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  static get properties(){
    return {
        id:               {hname:'ID',      type:'number', hidden:true}
      , name:             {hname: 'Nom',    type:'string', validator:{required:true, uniq:true, minLength:3, maxLength:50}}
      , domaineId:        {hname:'Domaine', type:'Domaine'}
      , associatecolorId: {hname:'Couleur', type:'AssociateColor'}
    }
  }


  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  innerForm(){
    return [
        DCreate('INPUT', {type:'text', id:this.idFor('name')})
      , DCreate('TEXTAREA',{id:this.idFor('description')})
      , this.rowFormForType(Domaine)
      , this.rowFormForType(AssociateColor)
    ]
  }

}
