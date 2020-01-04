'use strict'

const JOURS_SEMAINE = {} ;

const DATA_JOURS = {
    1: {index:1, hname: 'Lundi',    short_name: 'lun'}
  , 2: {index:2, hname: 'Mardi',    short_name: 'mar'}
  , 3: {index:3, hname: 'Mercredi', short_name: 'mer'}
  , 4: {index:4, hname: 'Jeudi',    short_name: 'jeu'}
  , 5: {index:5, hname: 'Vendredi', short_name: 'ven'}
  , 6: {index:6, hname: 'Samedi',   short_name: 'sam'}
  // , 7: {index:7, hname: "Dimanche", short_name: 'dim'}
}

class Jour extends CommonElement {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  // Indice du jour de la semaine courant, 1-start pour lundi
  static get todayIndice(){
    return this._todayindice || (this._todayindice = new Date().getUTCDay())
  }
  static get todayData(){
    return this._todaydata || (this._todaydata = DATA_JOURS[this.todayIndice])
  }
  static get todayName(){
    return this._todayname || (this._todayname = this.todayData.hname)
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  constructor(data){
    super(data)
  }

  get semaine(){return this._semaine}
  get njour(){return this._njour}

  /**
   * Construction du jour
   */
  build(){
    this.obj = DCreate('DIV',{id:`jour-${this.njour}`, class:'jour',inner:[
        DCreate('DIV',{class:'titre', inner:this.jname})
      , DCreate('DIV',{class:'travaux'})
    ]})
    this.semaine.obj.append(this.obj)
    this.observe()
  }

  /**
    Observateur du jour
  **/
  observe(){
    this.obj.addEventListener('dblclick', this.onDoubleClick.bind(this))
  }


  /**
    Méthodes d'évènement
  **/

  /**
    Double-click sur le jour => création d'un travail
  **/
  onDoubleClick(ev){
    // console.log("Double-click sur le jour")
    // console.log("ev = ", ev)

    // On arrondit toujours l'heure cliquée à la demi-heure
    var realHeure = HEURE_START + ((ev.clientY - TOP_START) / HEURE_HEIGHT)
    var heure = parseInt(HEURE_START + ((ev.clientY - TOP_START) / HEURE_HEIGHT),10)
    if ( realHeure > heure + 0.5 ) {
      heure += .5
    }
    // console.log("Heure = ", heure)
    Travail.createNewInJour({heure:heure, njour:this.njour}, ev)
    return stopEvent(ev)
  }

  get absData(){
    return this._absdata || (this._absdata = DATA_JOURS[this.njour])
  }
  get jname(){
    return this.absData.hname
  }

  get works(){
    return this._works
  }

  get objTravaux(){
    return this._objtravaux || (this._objtravaux = this.obj.querySelector('.travaux'))
  }
}
