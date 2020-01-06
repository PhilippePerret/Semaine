'use strict'


class SemaineLogic {

  /**
    Méthodes jours
  **/
  /**
    Pour exécuter une méthode sur chaque jour de la semaine logique
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
    UI.content.append(DCreate('DIV',{id:'semaine-courante', class:'semaine'}))
    this.obj = DGet('div#semaine-courante')
    // Construire les 6 jours de la semaine courante
    Jour.build()
  } // build

  static get current()  { return this._current }
  static set current(v) {
    this._current = v
    this._current.writeInfos()
  }

  /**
    On commence par construire la semaine logique courante
  **/
  static buildCurrent(){

    this.current = new SemaineLogic(this.todaySemaine)
    this.build()

    // On doit instancier un nouveau curseur qui va :
    //  - afficher une ligne pour suivre le temps sur la semaine
    //  - déclencher les notifications des travaux quand il passera
    //    sur leur temps.
    new Cursor();

    console.log("-> showCurrent")
    this.showCurrent()

  }

  static showCurrent(){
    this.showWeek(this.todaySemaine)
  }

  static showPrevious(){
    var index = this.current.index - 1
    var annee = this.current.annee
    if ( index < 1 ) {annee -= 1; index = 52}
    this.showWeek({semaine:index, annee:annee})
  }
  static showNext(){
    var index = this.current.index + 1
    var annee = this.current.annee
    if ( index > 52 ) {index = 1; annee += 1}
    this.showWeek({semaine:index, annee:annee})
  }

  /**
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

    const couranteData = this.todaySemaine
    // Si c'est la semaine courante, on affiche le curseur, sinon,
    // on le détruit
    const isCourante =  this.current.annee == couranteData.annee &&
                        this.current.index == couranteData.semaine
    console.log("isCourante = %s", isCourante)
    console.log("avec this.current.annee:%d, couranteData.annee:%d", this.current.annee,couranteData.annee)
    console.log("avec this.current.index:%d, couranteData.semaine:%d", this.current.index, couranteData.semaine)

    if ( isCourante ) {
      // On peut construire le curseur
      new Cursor()
      Cursor.current.build()
      // On met en route le curseur.
      Cursor.current.startMoving()
    } else if ( Cursor.current ) {
      Cursor.current.obj.remove()
      delete Cursor.current
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
    Méthode qui calcule le numéro dans le mois du jour qui correspond
    à la semaine d'indice +nWeek+ et au jour +wDay+ de cette semaine
  **/
  static calcDayOfMonthFromJourAndSemaine(nWeek, wDay){
    // console.log("Semaine:%d, Jour semaine:%d", nWeek, wDay)
    var secondes = (((nWeek - 1) * 7) + (wDay - 1)) * 24 * 3600
    const year      = new Date().getFullYear()
    const wantedDay = new Date(year,0,1,0,0,secondes);
    // console.log("wantedDay = ", wantedDay)
    return wantedDay.getDate() // retourne le jour du mois…
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
    // Ici, un calcul plus fin est nécessaire : il faut afficher les jours
    // plutôt que le numéro de semaine qui est une information qui ne matche
    // pas avec les semaines affichées du lundi au samedi

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
  }

  get travaux(){
    // TODO Il faut ajouter les travaux récurrents
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
