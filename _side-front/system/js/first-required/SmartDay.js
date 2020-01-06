'use strict';
/** ---------------------------------------------------------------------
  *   Classe SmartDay
  *   ---------------
  *   Gestion intelligente des jours
  *
*** --------------------------------------------------------------------- */
class SmartDay {
  static get DATA_JOURS(){return{
      0:{index:0, hname: 'Lundi',    shorthname:'lun'}
    , 1:{index:1, hname: 'Mardi',    shorthname:'mar'}
    , 2:{index:2, hname: 'Mercredi', shorthname:'mer'}
    , 3:{index:3, hname: 'Jeudi',    shorthname:'jeu'}
    , 4:{index:4, hname: 'Vendredi', shorthname:'ven'}
    , 5:{index:5, hname: 'Samedi',   shorthname:'sam'}
    , 6:{index:6, hname: 'Dimanche', shorthname:'dim'}
  }}

  constructor(date){
    this.initialDate = date || (new Date())
  }

  /**
    Retourne la date du début de ce smart-day
  **/
  get beginning(){
    if (undefined === this._beginning){
      this._beginning = new Date(this.year, this.month - 1, this.number,0,0,0)
    }
    return this._beginning
  }

  /**
    L'indice 0-start du jour de la semaine, mais commence à lundi contrairement
    à la valeur owDay original qui commence à dimanche
  **/
  get wDay(){
    return this._wday || (this._wday = (this.owDay ? this.owDay : 7) - 1)
  }
  get human_wday(){
    return this._human_wday || (
      this._human_wday = this.constructor.DATA_JOURS[this.wDay].hname
    )
  }
  get owDay(){
    return this._owDay || (this._owDay = this.initialDate.getDay())
  }

  get time(){
    return this._time || (this._time = this.initialDate.getTime())
  }
  get year(){
    return this._year || (this._year = this.initialDate.getFullYear())
  }
  get month(){
    return this._month || (this._month = this.initialDate.getMonth() + 1)
  }
  // Le jour du mois (de 1 à 31)
  get number(){
    return this._number || (this._number = this.initialDate.getDate())
  }

  /**
    Retourne l'index de la semaine du lundi au dimanche pour le jour
    Cet index diverge de l'index de la "vraie" semaine-année qui part
    du premier (qui n'est pas forcément un lundi) de l'année.
    Par exemple, si la semaine réelle commence le mercredi et que le
    jour est inférieur (lundi ou mardi), alors l'index semaine sera
    incrémenté d'1
  **/
  get nSemaineLogic(){
    if ( undefined === this._nSemaineLogic ) {
      this._nSemaineLogic = Number(this.nSemaine)
      if ( this.firstDayOfYear.wDay > this.wDay ) { ++ this._nSemaineLogic }
    }
    return this._nSemaineLogic
  }

  /**
    Retourne le numéro de la semaine auquel appartient cette date
  **/
  get nSemaine(){
    if (undefined === this._nSemaine){
      const diff    = parseInt((this.time - this.firstDayOfYear.time) / 1000, 10)
      const nbDays  = Math.floor(diff / (3600 * 24), 10)
      this._nSemaine = Math.ceil((nbDays + 1) / 7 );
    }
    return this._nSemaine
  }

  /**
    Retourne l'instance SmartDay du premier jour de l'année
    de la date courante.
  **/
  get firstDayOfYear(){
    return this._day1year || (this._day1year = new SmartDay(new Date(this.year,0,1,0,0,0)))
  }

}
