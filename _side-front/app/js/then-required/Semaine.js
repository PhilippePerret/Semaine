'use strict'

const YAML = require('js-yaml')

const ICON_PATH = '/Users/philippeperret/Programmation/Semaine/icons/app2.icns';

class Semaine {

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
  constructor({annee, semaine}){
    this.annee  = annee
    this.index  = semaine
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
