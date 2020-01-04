'use strict'

const HEURE_START   = 6 ;
const HEURE_END     = 18 ;
const HEURE_HEIGHT  = 50 ;
const COEF_MINUTE   = HEURE_HEIGHT / 60 ;
const TOP_START     = 30 ; // hauteur du nom du jour

class Travail {
  constructor(data){
    /**
     * Va définir:
     *    tache       La tâche à accomplir
     *    heure       L'heure à laquelle il faut l'accomplir
     *    njour       L'indice du jour de la semaine (de 0 à 6)
     *    duree       La durée du travail
     *    recurrence  La récurrence éventuelle
     */
    for(var k in data){this[k] = data[k]}
    // SI
    //    - le travail appartient au jour courant,
    //    - et son heure est inférieure au temps courant
    // ALORS il faut ajouter un trigger
    if ( this.njour == Jour.today_indice && this.heure > Horloge.currentHour) {
      Cursor.current.addTrigger(this)
    } else {
      // Pour être tranquille, mais il faut bien mesurer le fait que
      // si on change de jour, ça ne fonctionnera pas, les tâches du
      // jour suivant ne seront pas signalées.
      this.notified = true
    }
  }

  buildIn(container){
    this.obj = DCreate('DIV',{class:'travail',inner:[
      DCreate('SPAN', {class:'tache', inner:`${this.tache} à ${this.heure}` })
    ]})
    container.append(this.obj)
    this.obj.style.top = ((this.heure - HEURE_START) * HEURE_HEIGHT) +'px'
    if (this.duree){
      this.obj.style.height = (this.duree * HEURE_HEIGHT) + 'px'
    }
  }

  /**
   * Demande de construction du travail
   */
  build(){
    this.buildIn(JOURS[this.njour].objTravaux)
  }

  /**
   * Envoi la notification du travail
   */
  notify(){
    new Notification(this.tache, {body:`Commence à ${this.hstart} et finit à ${this.hend}.`, icon:ICON_PATH})
    this.notified = true
  }

  /**
   * States
   */
  get isRecurrent(){
    return !!this.recurrence
  }

  /**
   * Propriétés volatiles
   */
  get hstart(){
    if (undefined === this._hstart){
      this._hstart = Horloge.heure2horloge(this.heure)
    } return this._hstart
  }

  get hend(){
    if (undefined === this._hend){
      this._hend = Horloge.heure2horloge(this.heure + (this.duree || 1))
    } return this._hend
  }
  /**
   * Propriétés fixes
   */

  // Retourne la définition de la récurrence du travail
  get recurrence(){
    return this._recurrence
  }
}
