'use strict';
/** ---------------------------------------------------------------------
  *   Classe SmartDay
  *   ---------------
  *   Gestion intelligente des jours

  # version: 0.1.0

  NOTE
    Définition de TODAY en bas de ce module

  NOTE
    En bas de ce module, il y a la possibilité de changer le
    jour courant, pour des essais.
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

  // Reçoit '31 12 98' et retourne l'instance Date du 31 décembre 2098
  static parseDDMMYY(ddmmyy){
    var [j,m,a] = ddmmyy.split(' ')
    return new SmartDay(new Date(`${m}/${j}/20${a}`))
  }
  // Reçoit '31 12 2020' et retourne l'instance date du 31 décembre 2020
  static parseDDMMYYYY(ddmmyyyy){
    var [j,m,a] = ddmmyy.split(' ')
    return new SmartDay(new Date(`${m}/${j}/${a}`))
  }

  /**
    Retourne une instance du jour courant, avec son commencement
  **/
  static todayBeginning(){
    var d = new Date()
    return new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,0,0)
  }


  constructor(date){
    switch(typeof date){
      case 'string':
      case 'number':
        date = new Date(date)
        break;
    }
    this.initialDate = date || this.constructor.todayBeginning()
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
    Retourne le jour à +nombreJours+ du jour. Si +nombreJours+ est positif,
    on cherche +nombreJours+ après le jour courant, si +nombreJours+ est
    négatif, on cherche +nombreJours+ avant le jour courant. Si zéro, on
    retourne le jour courant
  **/
  from(nombreJours){
    if (nombreJours === 0) return this;
    return new SmartDay(new Date(this.time + (nombreJours * 3600 * 24 * 1000)))
  }

  /**
    Méthodes de formatage
  **/
  formate(format){
    return format
      .replace(/%d/g, this.number2)
      .replace(/%m/g, this.month2)
      .replace(/%M/g, this.humanMonth)
      .replace(/%y/g, this.smallYear)
      .replace(/%Y/g, this.year)
  }

  /**
    Retourne une valeur qui pourra être "parsé" par l'instanciation
    Permet par exemple d'enregistrer en JSON cette valeur pour pouvoir
    ensuite retrouve le SmartDay correspondant
  **/
  get asParsable(){
    return this.formate('%m/%d/%Y')
  }

  asJJMMAA(separator = '/'){
    return this.formate(`%d${separator}%m${separator}%y`)
  }
  get asDDMMYY(){
    return this._asddmmyy || (this._asddmmyy = this.formate('%d %m %y'))
  }

  get asDDMMYYYY(){
    return this._asddmmyy || (this._asddmmyy = this.formate('%d %m %Y'))
  }

  get asLong(){
    return this._aslong || (this._aslong = this.formate('%d %M %Y'))
  }

  /**
    Méthodes de données
  **/

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
  get smallYear(){
    return this._smallyear || (this._smallyear = String(this.year).substring(2,4))
  }

  get month(){
    return this._month || (this._month = 1 + this.month0start)
  }
  get month0start(){
    return this._month0start || (this._month0start = this.initialDate.getMonth())
  }
  get humanMonth(){
    return this._hmonth || (this._hmonth = MOIS[this.month0start].long)
  }
  get month2(){
    return String(this.month).padStart(2,'0')
  }
  // Le jour du mois (de 1 à 31). Alias : mDay
  get number(){
    return this._number || (this._number = this.initialDate.getDate())
  }
  get mDay(){return this.number}
  get number2(){
    return this._number2 || (this._number2 = String(this.number).padStart(2,'0'))
  }
  get mDay2(){return this.number2}

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

// Le jour courant
const TODAY = new SmartDay()

// var d = new Date()
// const TODAY = new SmartDay().from(4)
// console.log("TODAY faux : ", TODAY)
