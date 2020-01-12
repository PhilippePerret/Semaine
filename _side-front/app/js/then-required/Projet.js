'use strict'
/** ---------------------------------------------------------------------
  *   Class Projet
  *   ------------
  *   La classe d'un projet
  *
*** --------------------------------------------------------------------- */
class Projet extends CommonElement {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */


  /**
    Retourne le path des données des projets courants
  **/
  static get path(){
    return this._path || (this._path = path.join(App.userDataFolder,'projets.json'))
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  constructor(data){
    super(data)
  }


}
