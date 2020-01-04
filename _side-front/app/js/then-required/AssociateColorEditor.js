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

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  innerForm(){
    return [
        DCreate('INPUT',{type:'text', id:this.idFor('name'), inner:this.name})
      , this.rowForColor('ftcolor')
      , this.rowForColor('bgcolor')
    ]
  }
  rowForColor(propColor){
    return DCreate('DIV',{
      inner: [
          DCreate('INPUT',{type:'hidden', id:this.idFor(propColor)})
        , DCreate('SPAN', {class:'color-demo'})
        , DCreate('BUTTON', {type:'button', id: 'pick…'})

      ]
    })
  }
}
