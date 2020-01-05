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

class Jour /* extends CommonElement */ {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
    Pour la construction du gabarit de tous les jours
  **/
  static build(){

    // On crée des instances de jours qu'on va mettre dans JOURS_SEMAINE
    for(var i=1; i<7; ++i){
      Object.assign(JOURS_SEMAINE, {[i]: new Jour({njour:i})})
    }

    // Créer tous les jours de la semaine, avec leur nom, leur date
    // courante, leur colonne, en d'autres termes
    for(var ijour in JOURS_SEMAINE){
      JOURS_SEMAINE[ijour].build()
    }

    // Tracer les lignes d'heures
    for(var h = HEURE_START; h <= HEURE_END; h += .5){
      var contenu = h == parseInt(h,10) ? Horloge.heure2horloge(h) : ''
      Semaine.obj.append(DCreate('DIV',{class:'hourline', style:`top:${(h-HEURE_START)*HEURE_HEIGHT+TOP_START}px;`, inner:[
        DCreate('SPAN', {class:'hourspan', inner:contenu})
      ]}))
    }

  }

  static nettoie(){
    for(var ijour in JOURS_SEMAINE){
      JOURS_SEMAINE[ijour].nettoie()
    }
  }

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
    this.data = data
    this._njour = data.njour
  }

  get njour(){return this._njour}

  /**
   * Construction du jour
   */
  build(){
    this.obj = DCreate('DIV',{id:`jour-${this.njour}`, class:'jour',inner:[
        DCreate('DIV',{class:'titre', inner:this.jname})
      , DCreate('DIV',{class:'travaux'})
    ]})
    Semaine.obj.append(this.obj)
    this.observe()
  }

  /**
    Nettoyer le jour
  **/
  nettoie(){
    this.objTravaux.replaceWith(DCreate('DIV',{class:'travaux'}))
    delete this._objtravaux
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
