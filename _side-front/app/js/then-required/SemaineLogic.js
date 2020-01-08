'use strict'


class SemaineLogic {

  /**
    Méthodes jours
  **/
  /**
    Pour exécuter une méthode sur chaque jour de la semaine logique

    Ce sont les instances qui gèrent les jours de l'agenda, à l'affichage
    principalement. Leur propriété `smartDay` retourne l'instance SmartDay
    du jour courant.
  **/
  static forEachJour(method){
    this.jours.forEach( jour => method(jour) )
  }

  /**
    Les 7 (6) jours logiques de la semaine logique, en commençant par
    le lundi. Chaque jour est une instance Jour
  **/
  static get jours(){
    if (undefined === this._jours ) {
      this._jours = []
      for(var i = 0; i < 6 ; ++i){ this._jours.push(new Jour({njour: i})) }
    }
    return this._jours
  }

  /**
    Méthodes semaine
  **/
  static build(){
    UI.content.append(DCreate('DIV',{id:'semaine-logic', class:'semaine'}))
    this.obj = DGet('div#semaine-logic')
    // Initialiser le curseur
    Cursor.init()
    // Construire les 6 jours de la semaine courante
    Jour.build()
  } // build

  /**
    Règle l'affichage pour indiquer que c'est la semaine courante
    Attention : ce "courante" n'a rien à voir avec "current" qui concerne
    l'instance courante.
    - La méthode applique ou retire la classe 'current' à div#semaine-logic
    - elle met une classe spéciale au jour courant
  **/
  static setAsCourante(){
    this.obj.classList[this.current.isSemaineCourante ? 'add' : 'remove']('courante')

  }

  static get current()  { return this._current }
  static set current(v) {
    this._current = v
    this._current.writeInfos()
  }

  /**
    Construction de la semaine courante
  **/
  static buildCurrent(){
    this.current = new SemaineLogic(this.todaySemaine)
    this.build()
    this.showCurrent()
  }

  /**
    Affichage de la semaine courante
  **/
  static showCurrent(){
    this.showWeek(this.todaySemaine)
  }

  /**
    Affichage de la semaine précédente
  **/
  static showPrevious(){
    var index = this.current.index - 1
    var annee = this.current.annee
    if ( index < 1 ) {annee -= 1; index = 52}
    this.showWeek({semaine:index, annee:annee})
  }

  /**
    Affichage de la semaine suivante
  **/
  static showNext(){
    var index = this.current.index + 1
    var annee = this.current.annee
    if ( index > 52 ) {index = 1; annee += 1}
    this.showWeek({semaine:index, annee:annee})
  }

  /**
    Affichage de la semaine définie par +data+
    ------------------------------------------
    Méthode générique qui affiche la semaine définie par les
    données +data+
    +Params+::
      +data+::[Hash]
        semaine [Number]  Indice de la semaine
        annee   [Number]  Année de la semaine
  **/
  static showWeek(data){
    // On définit la nouvelle semaine
    this.current = new SemaineLogic(data)

    // On purge éventuellement les travaux précédents
    // Noter qu'il faut le faire après l'instanciation de la nouvelle
    // semaine logique (pour connaitre le bon offset et pouvoir régler
    // correctement les valeurs de jours)
    Jour.update()

    // On construit les travaux de la semaine
    this.current.build()

    if ( this.current.isSemaineCourante ) {
      // On met en route le curseur.
      Cursor.current.startMoving()
    } else if ( Cursor.current ) {
      Cursor.current.hideAndStop()
    }
  }

  /**
    Retourne les informations sur la semaine courante
  **/
  static get todaySemaine(){
    return this.daySemaine(new Date())
  }

  /**
    Retourne les informations de semaine du jour donné
    +Params+::
      +jour+::  [Date] L'instance Date du jour voulu
                [Array] Une liste contenant [annee, mois, jour]
                        mois est 1-start
  **/
  static daySemaine(jour){
    if (undefined === jour) {
      jour = new Date()
    } else if (!(jour instanceof Date)) {
      jour[1] -= 1
      jour = new Date(...jour)
    }
    const smartDay = new SmartDay(jour)
    return {annee:smartDay.year, semaine:smartDay.nSemaineLogic, jour:jour}
  }

  /**
   * Path au dossier qui contient toutes les semaines définies
   */
  static get folderSemaines(){
    if ( undefined === this._foldersemaines) {
      this._foldersemaines = path.join(App.userDataFolder,'semaines')
      fs.existsSync(this._foldersemaines) || fs.mkdirSync(this._foldersemaines)
    }
    return this._foldersemaines
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  /**
   * INSTANCE
   */
  constructor({annee,semaine}){
    this.annee = annee
    this.index = semaine
  }

  /**
    Pour écrire les informations numériques de la
    semaine courante.
  **/
  writeInfos(){
    DGet('#annee-semaine').innerHTML = this.annee
    DGet('#index-semaine').innerHTML = this.index
  }

  /**
    Décalage de cette instance semaine logique avec la semaine
    du jour courant. Utile pour connaitre les jours à afficher
    L'offset est négatif s'il s'agit d'une semaine avant, il est positif
    dans le cas contraire.
  **/
  get offset(){
    if (undefined === this._offset) {
      this._offset = this.index - TODAY.nSemaineLogic
    }
    return this._offset
  }

  /**
   * Méthode principale de construction de la semaine
   */
  build(){
    // Construire les travaux
    this.travaux.forEach(w => w.build())
    // Construire les travaux récurrent
    TravailRecurrent.build()
    // Appliquer la classe en fonction du fait que c'est la semaine
    // courante ou non
    SemaineLogic.setAsCourante()
  }

  /**
    Méthodes d'état
  **/

  // Retourne true si cette semaine logique est la semaine courante
  get isSemaineCourante(){
    if (undefined === this._iscurrentweek) {
      const todaySem = this.constructor.todaySemaine
      this._iscurrentweek = this.annee == todaySem.annee &&
                            this.index == todaySem.semaine
    }
    return this._iscurrentweek
  }

  /**
    Méthodes de données
  **/

  get travaux(){
    return this.data
  }

  get data(){
    return this._data || this.loadData()
  }

  loadData(){
    Travail.load()
    return Object.values(Travail.items)
  }

  /**
    Path de la semaine courante
  **/
  get path(){
    return this._path||(this._path = path.join(this.constructor.folderSemaines,this.pathName))
  }

  /**
    Nom de la semaine courante utilisée pour le(s) path(s)
  **/
  get pathName(){
    return this._pathname || (this._pathname = `${this.affixeName}.json` )
  }

  get affixeName(){
    return this._affixename || (this._affixename = `semaine-${this.annee}-${this.index}`)
  }

}
