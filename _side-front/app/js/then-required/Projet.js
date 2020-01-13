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

  get projectopener(){ return this._projectopener }

  get f_projectopener(){
    let openingData = JSON.parse(this.projectopener || "{}")
    let str = []
    openingData.fichier && str.push('fichier')
    openingData.dossier && str.push('dossier')
    openingData.code    && str.push('code')
    return str.join(' + ')
  }
}
