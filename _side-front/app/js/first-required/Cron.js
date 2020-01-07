'use strict'

class CRON {

  /**
    Reçoit une valeur cron ('* * * * *') et retourne sa signification, c'est
    à-dire une table qui contient :
    {
      minutes:  ... donnée pour les minutes...
      hours:    ... donnée pour les heures...
      monthday: ... donnée pour les jours du mois...
      month:    ... donnée pour les mois...
      weekday:  ... donnée pour les jours de la semaine...
    }
  **/
  static parse(cron) {
    var units = ['minutes','hours','monthday','month','weekday']
    var [mns, hrs, mjr, mon, wjr] = cron.split(' ').map(v => new CRONValue(v, units.shift()).realValue)

    console.log("mns:", mns)
    console.log("hrs:", hrs)
    console.log("mjr:", mjr)
    console.log("mon:", mon)
    console.log("wjr:", wjr)
  }

}
const HDAY2IDAY = {'sun':0,'mon':1,'tue':2,'wed':3,'thu':4,'fri':5,'sat':6}
const HMOIS2IMOIS = {'jan':1,'fev':2,'mar':3,'apr':4,'may':5,'jun':6,'jul':7,'aug':8,'sep':9,'oct':10,'nov':11,'dec':12}
class CRONValue {

  /**
    Instanciation d'une valeur cron (un des termes de * * * *)
    +term+::[String]  Peut être une valeur seule (12), une division (* / 12),
                      un tranche (12-15) ou plusieurs valeurs (12,24,23)
  **/
  constructor(term, unit){
    this.term = term
    this.unit = unit
  }

  get realValue(){
    return this._realvalue || (this._realvalue = this.decompose())
  }
  decompose(){
    if (this.term == '*') {
      return {value: '*', unit:this.unit}
    } else if(this.term.replace(/[0-9]/g,'') === ' '){
      // Un simple nombre
      return {value: Number(this.term), unit:this.unit}
    } else if ( this.term.replace(/[a-z]/g,'') == '') {
      // Une valeur pseudo-humaine ('mon', 'sat')
      return {value: this.integerize(this.term), unit:this.unit}
    } else if ( this.term.match(/\-/) ){
      // Une plage de valeurs
      var [s,e] = this.term.split('-')
      return {start:this.integerize(s), end:this.integerize(e), unit:this.unit}
    } else if ( this.term.match(',') ){
      // Une liste de valeurs
      return {list: this.term.split(/,/).map(v => this.integerize(v)), unit:this.unit}
    } else if ( this.term.match('/')){
      // Une division
      var [del,div] = this.term.split('/')
      del == '*' || raise("Expression Cron mal formatée. La division doit concerner l'étoile.")
      isNaN(div) && raise("Expression Cron mal formatée. Le diviseur d'une division doit être un nombre.")
      return {diviseur: Number(div), unit:this.unit}
    }
  }

  /**
    Reçoit 12 et retourne 12
    Reçoit jan et retourne 1, dec et retourne 12
    Reçoit sat et retourne 5, sun et retourne 0
  **/
  integerize(val){
    return HMOIS2IMOIS[val]||HDAY2IDAY[val]||val
  }
}
