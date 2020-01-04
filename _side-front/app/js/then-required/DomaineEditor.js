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
      , acolor:     {hname:'Couleur', type:'AssociateColor' /* donc ID */}
    }
  }

}
