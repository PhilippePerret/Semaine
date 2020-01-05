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

  static get humanName(){ return 'Couleur associée' }


  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(data){
    super(data)
  }


}
