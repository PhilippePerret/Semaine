'use strict'
/** ---------------------------------------------------------------------
  *   Classe Domaine
  *   --------------
  *   Gestion des "domaines", qui sont les grands thèmes
  *   comme l'écriture, la programmation, la pédagogie, etc.
  *
*** --------------------------------------------------------------------- */
class Domaine extends CommonElement{
  constructor(data){
    super(data)
  }

  /**
    Un domaine n'hérite de rien ni personne
  **/
  static get firstInheritedClass(){return undefined}

  /**
    Retourne le path des données des projets courants
  **/
  static get path(){
    return this._path || (this._path = path.join(App.userDataFolder,'domaines.json'))
  }

}
