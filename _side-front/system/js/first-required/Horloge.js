'use strict'

const Horloge = {

  h2s(){

  }
  /**
   * Reçoit des secondes (et millisecondes) et
   * retourne une horloge, complète (0:00:12) ou partielle (0:12)
   */
, s2h(secs, options){

  }

  /**
   * reçoit un nombre d'heures +heure+ et retourne l'horloge correspondante
   * Par exemple : 8.5 => "8:30"
   */
, heure2horloge(heure, options){
    var [h, m] = String(heure).split('.').map(i => parseInt(i,10))
    if (m) {
      return `${h}:${String(parseInt(60 / (10 / m), 10)).padStart(2,'0')}`
    } else {
      return `${h}:00`
    }
  }
}

Object.defineProperties(Horloge,{
  currentHour:{get(){
    var hrs = new Date().getHours();
    var mns = new Date().getMinutes();
    if ( mns == 0 ) {
      return hrs
    } else {
      return hrs + (parseInt(( 1 / (60 / mns) ) * 100, 10) / 100) // 30 -> .5 =>  1 / (60 / 30)
    }
  }}
})
