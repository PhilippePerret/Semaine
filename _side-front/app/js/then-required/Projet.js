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
    return this.opener.markData
  }

  get opener(){
    if ( undefined === this._opener ) {
      this._opener = new ProjectOpener(this, null)
      this._opener.setData(JSON.parse(this.projectopener || "{}"))
    }
    return this._opener
  }

  /**
    Ajouter +time+ secondes au temps de travail
  **/
  addWorktime(time){
    this.setAndSave({worktime: this.worktime + time})
  }


  /**
    Temps de travail sur le travail (ou le travail récurrent)
  **/
  get worktime(){ return this._worktime || 0}

}
