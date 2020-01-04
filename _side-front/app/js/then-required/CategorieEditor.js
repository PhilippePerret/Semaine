'use strict'
/** ---------------------------------------------------------------------
  *   Classe CategorieEditor
  *   -------------------
  *   Éditeur de projet
  *
*** --------------------------------------------------------------------- */
class CategorieEditor extends CommonElementEditor {
  static get properties(){
    return {
        id:         {hname:'ID',      type:'number', hidden:true}
      , name:       {hname: 'Nom',    type:'string'}
      , domaine:    {hname:'Domaine', type:'Domaine' /* donc ID */}
      , acolor:     {hname:'Couleur', type:'AssociateColor' /* donc ID */}
    }
  }

}
