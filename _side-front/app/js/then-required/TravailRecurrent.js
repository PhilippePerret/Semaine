'use strict'
/*
  Class TravailRecurrent
  ----------------------
  Gestion des travaux récurrents

  QUESTION
    Doit-il hériter de la classe Travail ? au lieu d'hériter seulement
    de CommonElement
    -> OUT
  QUESTION
    Quelles méthodes sont à revoir par rapport à la récurrence ?
    -> TODO
  QUESTION
    Quand faut-il l'enregistrer et le retirer des travaux normaux ?
    (car pour le moment, un travail récurrent est créé à partir de
    la création d'un travail normal dont on case la coche "récurrent")
    On gère ça après l'enregistrement de l'édition d'un travail. Si la
    case "travail récurrent" a été cochée, on doit le supprimer des
    travaux normaux (remove) et l'ajouter aux travaux récurrents.
    -> POURSUIVRE (TOTO)
  QUESTION
    Comment définir la propriété 'recurrence' qui définit (en string)
    la récurrence.
    Valeurs possibles :
      jour        Répétition tous les jours
      hebdo       Répétition toutes les semaines (défaut)
      cf. les valeurs dans TravailRecurrentEditor

*/
class TravailRecurrent extends Travail {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  // Le path des travaux, doit maintenant être défini par la semaine
  // courante
  static get path(){
    return this._path || (this._path = path.join(App.userDataFolder,'travaux_recurrents.json'))
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  /**
    Méthodes de construction
  **/

  // Construction du travail récurrent dans le container
  // +container+
  buildIn(container){
    var classCss = ['travail']
    this.selected && classCss.push('selected')
    var styles = []
    if ( this.f_color ) {
      styles.push(`background-color:${this.f_color.bgcolor}`)
      styles.push(`color:${this.f_color.ftcolor}`)
    }
    this.obj = DCreate('DIV',{
        class:classCss.join(' ')
      , inner:[
          DCreate('SPAN', {class:'tache', inner:`${this.formated_tache} à ${this.heure}` })
        ]
      , style:styles.join(';')
      })
    container.append(this.obj)
    this.obj.style.top = ((this.heure - HEURE_START) * HEURE_HEIGHT) +'px'
    if (this.duree){
      this.obj.style.height = (this.duree * HEURE_HEIGHT) + 'px'
    }
  }

  /**
   * Demande de construction du travail
   *
   * On doit créer toutes les occurences de la semaine, si c'est
   * un travail quotidien par exemple
   */
  build(){
    // TODO Récurrence supra hebdomadaire
    this.buildIn(JOURS_SEMAINE[this.njour].objTravaux)
    this.observe()
  }

  /**
   * Reconstruction du travail après modification
   */
  rebuild(){
    // TODO Récurrence supra hebdomadaire
    this.unobserve()
    this.obj.remove()
    this.build()
  }

  /**
   * Pour détruire le travail dans la semaine
   * (quand on le supprime)
   * noter que si la récurrence supra-hebdomadaire est gérée
   * plus haut, il est inutile de le faire ici puisque chaque
   * occurence passera par là.
   */
  removeDisplay(){
    this.obj && this.obj.remove()
  }

  unobserve(){
    const my = this
    this.obj.removeEventListener('dblclick', my.onDblClick.bind(my))
    this.obj.removeEventListener('click', my.onClick.bind(my))
  }

  /**
   * Envoi la notification du travail
   */
  notify(){
    new Notification(this.tache, {body:`Commence à ${this.hstart} et finit à ${this.hend}.`, icon:ICON_PATH})
    this.notified = true
  }

  /**
    Méthodes d'évènement
  **/

  /**
   * States
   */
  get isRecurrent(){ true }

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
  get recurrence(){ return this._recurrence }

  /**
    Jour du travail
  **/
  get jours(){ return this._jours }


}// /TravailRecurrent
