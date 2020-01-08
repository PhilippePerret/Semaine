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
    Initialisation du curseur
    Note : pour chaque session, il y a un seul curseur (Cursor.current) qu'on
    affichage et qu'on masque à volonté suivant qu'il s'agit de la semaine
    courante ou non.
  **/
  static init(){
    // On doit instancier un nouveau curseur qui va :
    //  - afficher une ligne pour suivre le temps sur la semaine
    //  - déclencher les notifications des travaux quand il passera
    //    sur leur temps.
    new Cursor();
    Cursor.current.build()
  }
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
    Ajout d'un trigger
    ------------------
    C'est cet ajout qui va faire que le travail va provoquer une notification
    au moment de sa venue, pour le travail +travail+
    +Params+::
      +travail+::[Travail|TravailRecurrent] Instance de travail, fixe ou
                  récurrent

    Noter que maintenant l'ajout peut se faire dans n'importe quel ordre
    puisque tous les triggers du jour (qui ne seront jamais nombreux) seront
    toujours passés en revue intégralement
   */
  addTrigger(travail){
    if (undefined === this.triggers) {
      this.triggers = new Map()
    } else {
      // Si ce travail a déjà produit un trigger, on le supprime
      this.triggers.has(travail.id) && this.triggers.delete(travail.id)
    }
    this.triggers.set(travail.id, travail)
  }

  /**
   * Méthode qui regarde si un trigger ne doit pas être déclenché
   * Ce check est fait toutes les minutes
   */
  checkTrigger(){
    if (undefined === this.triggers) return ;//rien à faire
    if (this.triggers.size < 1) return ; // plus rien à faire
    // console.log("Check à : ", Horloge.currentHour)

    for( var trigWork of this.triggers.values() ){
      if ( trigWork.heure < Horloge.currentHour ) {
        // <= Le trigger est dépassé
        // => On le retire
        this.triggers.delete(trigWork.id)
      } else if ( Horloge.currentHour >= trigWork.heure && Horloge.currentHour < (trigWork.heure + 0.10)  ) {
        // <= Le trigger est tout proche
        // => On l'affiche et on le supprime des triggers
        trigWork.notify()
        this.triggers.delete(trigWork.id)
      }
    }

    // Pour simplifier le travail
    if ( this.triggers.size === 0 ) delete this.triggers ;
  }

  /**
   * Démarrage du déplacement du curseur
   */
  startMoving(){
    // On affiche le curseur
    this.obj.classList.remove('noDisplay')
    // TODO
    // Ici, on pourrait mettre une boucle d'attendre pour attendre vraiment
    // d'être sur une minute ronde.

    // On lance la boucle qui va déplacer le curseur
    this.timer = setInterval(this.move.bind(this), 60*1000)
    this.move.call(this)
  }

  /**
    Cache et arrête le curseur courant
    Utilisé lorsque la semaine courante n'est pas la semaine affichée.
  **/
  hideAndStop(){
    this.timer && clearInterval(this.timer)
    delete this.timer
    this.obj.classList.add('noDisplay')
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
    DGet('#semaine-logic').append(DCreate('DIV',{id:'time-cursor', inner:[
      DCreate('SPAN',{class:'current_hour', inner:'---'})
    ]}))
    this.obj = DGet('div#time-cursor')
    this.objHour = DGet('div#time-cursor span.current_hour')
  }

}
