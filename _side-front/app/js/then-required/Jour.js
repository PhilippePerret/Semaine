'use strict'

class Jour /* extends CommonElement */ {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
    Retourne l'instance +n_jour+ des jours
    Noter que contrairement aux autres classes, ici, les items sont pris
    dans SemaineLogic, qu'on trouve dans la propriété `jours`.
    Contrairement aux autres classes, également, njour est 0-start (et
    commence à lundi)
  **/
  static get(njour){
    return SemaineLogic.jours[njour]
  }
  /**
    Pour la construction du gabarit de tous les jours
  **/
  static build(){

    // Créer tous les jours de la semaine, avec leur nom, leur date
    // courante, leur colonne, en d'autres termes
    SemaineLogic.forEachJour(jour => jour.build())

    // Tracer les lignes d'heures
    for(var h = HEURE_START; h <= HEURE_END; h += .5){
      var contenu = h == parseInt(h,10) ? Horloge.heure2horloge(h) : ''
      SemaineLogic.obj.append(DCreate('DIV',{class:'hourline', style:`top:${(h-HEURE_START)*HEURE_HEIGHT+TOP_START}px;`, inner:[
        DCreate('SPAN', {class:'hourspan', inner:contenu})
      ]}))
    }

  }

  // Actualise les jours, c'est-à-dire, principalement,
  // les nettoie en supprimant les travaux et ajuste la
  // date à la semaine affichée.
  static update(){
    SemaineLogic.forEachJour(jour => jour.update())
  }


  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  constructor(data){
    this.data   = data
    this._njour = data.njour // 0 pour lundi, 6 pour dimanche (si affiché)
  }

  get njour(){return this._njour}

  /**
   * Construction du jour
   */
  build(){
    this.obj = DCreate('DIV',{id:`jour-${this.njour}`, class:'jour',inner:[
        DCreate('DIV',{class:'titre', inner:this.f_jname})
      , DCreate('DIV',{class:'travaux'})
    ]})
    SemaineLogic.obj.append(this.obj)
    this.observe()
    this.setAsCourantOrNot()
  }

  /**
    Actualise le jour
      - le nettoie (le vide de ses travaux)
      - ajuste sa date en titre
  **/
  update(){
    delete this._smartDay
    this.nettoie()
    this.updateDateEntete()
    this.setAsCourantOrNot()
  }
  /**
    Nettoyer le jour
  **/
  nettoie(){
    this.objTravaux.replaceWith(DCreate('DIV',{class:'travaux'}))
    delete this._objtravaux
  }

  updateDateEntete(){
    this.titreObj.innerHTML = this.f_jname
  }

  setAsCourantOrNot(){
    this.obj.classList[this.isJourCourant ? 'add' : 'remove']('courant')
  }

  get titreObj(){
    return this._titreobj || (this._titreobj = DGet('.titre',this.obj))
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

  /**
    Méthodes d'état
  **/

  // Retourne true si le jour est le jour courant
  get isJourCourant(){
    return SemaineLogic.current.isSemaineCourante && this.njour == TODAY.wDay
  }

  /**
    Méthodes de données
  **/
  get absData(){
    return this._absdata || (this._absdata = SmartDay.DATA_JOURS[this.njour])
  }

  /**
    Retourne le nom du jour formaté, c'est-à-dire son nom de semaine
    avec sa date précise
  **/
  get f_jname(){
    return `${this.jname} ${this.smartDay.asLong}`
  }

  get jname(){
    return this.absData.hname
  }

  /**
    Retourne la date réelle de ce jour, en fonction de la semaine
    courante et de l'année.
    Instance SmartDay
  **/
  get smartDay(){
    if ( undefined === this._smartDay){
      // On connait njour avec 0 pour le lundi, 1 pour le mardi, etc.
      // On connait TODAY qui est la date d'aujourd'hui et notamment
      // TODAY.wDay qui retourne l'indice 0-start du jour de la semaine
      // à partir de lundi
      // Donc, on peut déduire la date du lundi de la semaine courante
      // Se rappeler qu'ici on parle des 7 jours de la semaine, donc
      // qu'on peut être mardi ou jeudi, ou autre
      // diff se comprendre comme "diff jour après le jour courant" si
      // positif ou "diff jour avant le jour courant" si négatif ou
      // "est le jour courant" si zéro
      var diff = this.njour - TODAY.wDay + (SemaineLogic.current.offset * 7)
      this._smartDay = TODAY.from(diff)
    }
    return this._smartDay
  }

  get works(){
    return this._works
  }

  get objTravaux(){
    return this._objtravaux || (this._objtravaux = this.obj.querySelector('.travaux'))
  }
}
