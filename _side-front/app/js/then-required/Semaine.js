'use strict'
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
   * Path au dossier qui contient toutes les semaines définies
   */
  static get folderSemaines(){
    if ( undefined === this._foldersemaines) {
      this._foldersemaines = path.join(App.userDataFolder,'semaines')
      fs.existsSync(this._foldersemaines) || fs.mkdirSync(this._foldersemaines)
    }
    return this._foldersemaines
  }

}
