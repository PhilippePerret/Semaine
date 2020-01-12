'use strict'
/** ---------------------------------------------------------------------
  *   Class Categorie
  *   ---------------
  *   Gestion des catégories, qu'on peut voir comme des sous-domaines
  *   Un projet appartient à une catégorie, un travail aussi.
  *
*** --------------------------------------------------------------------- */
class Categorie extends CommonElement {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
    Retourne le path des données des projets courants
  **/
  static get path(){
    return this._path || (this._path = path.join(App.userDataFolder,'categories.json'))
  }

  static get humanData(){return this._humandata || (this._humandata = {
      name:       'Catégorie'
    , nameMin:    'catégorie'
    , plurial:    'Catégories'
    , plurialMin: 'catégories'
  })}

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  constructor(data){
    super(data)
  }

}
