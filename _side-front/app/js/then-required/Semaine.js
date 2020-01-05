'use strict'

const YAML = require('js-yaml')

const ICON_PATH = '/Users/philippeperret/Programmation/Semaine/icons/app2.icns';

class Semaine {


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
    On commence par construire la semaine courante
  **/
  static build_current_semaine(){

    Notification.requestPermission().then(function(result) {
      if (result != 'granted'){
        alert("Attention, pour une raison inconnue, je ne pourrai pas faire de notification.")
      }
    });

    this.current = new Semaine(this.todaySemaine)
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
    // On purge éventuellement les travaux précédents
    Jour.nettoie()
    // On définit la nouvelle semaine
    this.current = new Semaine(data)
    // On construit les travaux de la semaine
    this.current.build()

    const couranteData = this.todaySemaine
    // Si c'est la semaine courante, on affiche le curseur, sinon,
    // on le détruit
    const isCourante =  this.current.annee == couranteData.annee &&
                        this.current.index == couranteData.semaine

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
    const year      = jour.getFullYear()
    const yearDay1  = new Date(year,0,1,0,0,0);
    const nowMilli  = jour.getTime();
    const yearMilli = yearDay1.getTime();
    // console.log("nowMilli: %d, yearMilli: %d", nowMilli, yearMilli)
    const diff    = parseInt((nowMilli - yearMilli) / 1000, 10)
    const nbDays  = Math.floor(diff / (3600 * 24), 10)
    const nWeek   = Math.ceil((nbDays + 1) / 7 );
    // console.log("diff:%d, nbDays:%d", diff, nbDays)
    return {annee:year, semaine:nWeek, jour:jour}
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
  constructor({annee, semaine}){
    this.annee  = annee
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
   * Méthode principale de construction de la semaine
   */
  build(){
    // Construire les travaux
    this.travaux.forEach(w => w.build())
  }

  get travaux(){
    return this.data
    // TODO Il faut ajouter les travaux récurrents
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
