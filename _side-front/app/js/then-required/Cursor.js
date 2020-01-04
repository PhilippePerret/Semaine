'use strict'
/**
 * Le curseur de temps qui suit l'avancée du jour
 */

class Cursor {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
    Curseur courant (qui, notamment, reçoit les triggers)
  **/
  static get current(){return this._current}
  static set current(v){this._current = v}


  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(){
    this.constructor.current = this
  }

  /**
   * Ajout d'un trigger
   * +travail+ Instance Travail
   */
  addTrigger(travail){
    if (undefined === this._triggers) {
      this._triggers = []
    }
    this._triggers.push(travail)
  }

  /**
   * Méthode qui regarde si un trigger ne doit pas être déclenché
   * Ce trigger est fait toutes les minutes
   */
  checkTrigger(){
    if (undefined === this._triggers) return ;//rien à faire
    if (this._triggers.length < 1) return ; // plus rien à faire
    // console.log("Check à : ", Horloge.currentHour)

    // On retire les triggers tant qu'ils sont dépassés
    while (this.triggers[0].heure < Horloge.currentHour){
      this._triggers.shift()
    }

    let nextTrigger = this.triggers[0] ;
    if ( Horloge.currentHour >= nextTrigger.heure && Horloge.currentHour < (nextTrigger.heure + 0.10) ){
      nextTrigger.notify()
      this._triggers.shift()
    }
    if ( this._triggers.length === 0 ) delete this._triggers ;
  }
  /**
   * Démarrage du déplacement du curseur
   */
  startMoving(){
    // TODO
    // Ici, on pourrait mettre une boucle d'attendre pour attendre vraiment
    // d'être sur une minute ronde.

    // On lance la boucle qui va déplacer le curseur
    this.timer = setInterval(this.move.bind(this), 60*1000)
    this.move.call(this)
  }
  /**
   * Déplacer le curseur de temps. La méthode est appelée en
   * boucle depuis l'instanciation.
   */
  move(){

    this.checkTrigger()

    var hrs = new Date().getHours();
    var mns = new Date().getMinutes();

    // // Pour les tests
    // hrs = 7; mns = 0;
    // hrs = 15 ; mns = 55;

    var nombre_minutes = (hrs - HEURE_START) * 60 + mns
    var top = parseInt((nombre_minutes * COEF_MINUTE) + TOP_START, 10)
    // var top =  ((hrs - HEURE_START) * HEURE_HEIGHT) + mns + TOP_START - 1
    // console.log("top = %d ((%d - %d) * 60 + %d - %d)", top, hrs, FIRST_DAY_HOUR, mns, TOP_HOURS);
    this.obj.style.top = `${top}px`;
    this.objHour.innerHTML = `${hrs}h${String(mns).padStart(2,'0')}`;

  }

  /**
   * Construction du curseur de temps
   */
  build(){
    DGet('#semaine-courante').append(DCreate('DIV',{id:'time-cursor', inner:[
      DCreate('SPAN',{class:'current_hour', inner:'---'})
    ]}))
    this.obj = DGet('div#time-cursor')
    this.objHour = DGet('div#time-cursor span.current_hour')
  }

  /**
   * Les triggers, c'est-à-dire la liste des travaux qui doivent être
   * fait aujourd'hui.
   */
  get triggers() { return this._triggers }
}
