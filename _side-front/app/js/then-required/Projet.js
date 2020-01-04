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

  // static buildDefaultValues(){
  //   new this({id:1, name:'Projet Tueuses vertes'})
  //   new this({id:2, name:'Programme Film Analyzor'})
  //   new this({id:3, name:'Commentaires Icare'})
  //   this.save()
  // }

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
