'use strict'
/** ---------------------------------------------------------------------
  *   Classe AssociatedColor
  *   ----------------------
  *   Gestoin des couleurs associées
  *
  De façon brève, une "couleur associée", c'est deux couleurs, une pour
  le fond et une pour le texte. Mais ça pourra être développé.
*** --------------------------------------------------------------------- */

class AssociateColor extends CommonElement {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */
  /**
    Retourne le path des données des projets courants
  **/
  static get path(){
    return this._path || (this._path = path.join(App.userDataFolder,'associate_colors.json'))
  }

  static get humanData(){return this._humandata || (this._humandata = {
      name:       'Couleur'
    , nameMin:    'couleur'
    , plurial:    'Couleurs'
    , plurialMin: 'couleurs'
  })}


  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(data){
    super(data)
  }

  get ftcolor(){return this._ftcolor}
  get bgcolor(){return this._bgcolor}
}
