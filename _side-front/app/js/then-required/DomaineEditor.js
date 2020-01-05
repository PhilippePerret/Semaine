'use strict'
/** ---------------------------------------------------------------------
  *   Classe DomaineEditor
  *   -------------------
  *   Éditeur de projet
  *
*** --------------------------------------------------------------------- */
class DomaineEditor extends CommonElementEditor {
  static get properties(){
    return {
        id:         {hname:'ID',      type:'number', hidden:true}
      , name:       {hname: 'Nom',    type:'string'}
      , associatecolorId: {hname:'Couleur', type:'AssociateColor' /* donc ID */}
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
      , this.rowFormForType(AssociateColor)
    ]
  }


}
