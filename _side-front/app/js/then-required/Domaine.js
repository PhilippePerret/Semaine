'use strict'
/** ---------------------------------------------------------------------
  *   Classe Domaine
  *   --------------
  *   Gestion des "domaines", qui sont les grands thèmes
  *   comme l'écriture, la programmation, la pédagogie, etc.
  *
*** --------------------------------------------------------------------- */
class Domaine extends CommonElement{

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
    Retourne le path des données des projets courants
  **/
  static get path(){
    return this._path || (this._path = path.join(App.userDataFolder,'domaines.json'))
  }


  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(data){
    super(data)
  }

}
