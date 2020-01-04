'use strict'

const JOURS = [] ;

const DATA_JOURS = {
    0: {index:0, hname: "Lundi", short_name: 'lun'}
  , 1: {index:1, hname: "Mardi", short_name: 'mar'}
  , 2: {index:2, hname: "Mercredi", short_name: 'mer'}
  , 3: {index:3, hname: "Jeudi", short_name: 'jeu'}
  , 4: {index:4, hname: "Vendredi", short_name: 'ven'}
  , 5: {index:5, hname: "Samedi", short_name: 'sam'}
  // , 1: {index:1, hname: "Dimanche", short_name: 'dim'}
}

class Jour {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  // Indice du jour de la semaine courant, 1-start pou lundi
  static get today_indice(){
    return this._todayindice || (this._todayindice = new Date().getUTCDay())
  }
  static get today_name(){
    return this._todayname || (this._todayname = DATA_JOURS[this.today_indice-1].hname)
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  constructor(semaine, ijour){
    this.semaine  = semaine
    this.njour    = ijour // indice a-start dans la fenêtre
  }


  /**
   * Construction du jour
   */
  build(){
    this.obj = DCreate('DIV',{id:`jour-${this.njour}`, class:'jour',inner:[
        DCreate('DIV',{class:'titre', inner:this.jname})
      , DCreate('DIV',{class:'travaux'})
    ]})
    this.semaine.obj.append(this.obj)
  }

  get jname(){
    return DATA_JOURS[this.njour].hname
  }

  get works(){
    return this._works
  }

  get objTravaux(){
    return this._objtravaux || (this._objtravaux = this.obj.querySelector('.travaux'))
  }
}
