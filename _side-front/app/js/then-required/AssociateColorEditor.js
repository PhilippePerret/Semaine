'use strict'
/** ---------------------------------------------------------------------
  *   Classe AssociateColorEditor
  *   -------------------
  *   Éditeur de projet
  *
*** --------------------------------------------------------------------- */
class AssociateColorEditor extends CommonElementEditor {
  static get properties(){
    return {
        id:         {hname:'ID',            type:'number', hidden:true}
      , name:       {hname: 'Nom',          type:'string'}
      , ftcolor:    {hname:'Couleur texte', type:'string'}
      , bgcolor:    {hname:'Couleur fond',  type:'string'}
    }
  }

}
