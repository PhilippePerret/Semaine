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
      , name:             {hname: 'Nom',    type:'string'}
      , domaineId:        {hname:'Domaine', type:'Domaine' /* donc ID */}
      , associateColorId: {hname:'Couleur', type:'AssociateColor' /* donc ID */}
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
