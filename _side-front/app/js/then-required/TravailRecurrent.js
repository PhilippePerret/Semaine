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

  /**
    Construction des travaux récurrents
    Si un fichier de travaux récurrents existe, on prend ses données pour
    afficher les travaux récurrents.
  **/
  static build(){
    // console.log("items de TravailRecurrent : ", this.items)
    Object.values(this.items).forEach(item => item.buildIfNecessary())
  }

  // Le nom humain propre à cette classe
  static get humanName(){
    return 'Travail récurrent'
  }

  // Nom minuscule obligatoire, sinon il est calculé d'après Travail
  static get minName(){return 'travailrecurrent'}


  /**
    Créer un nouveau travail récurrent à partir du travail +travail+ (instance
    Travail)
  **/
  static createFromTravail(travail){
    // On commence par prendre les valeurs de toutes les propriétés que
    // les deux classes partagent.
    var cwData = {isNew: true}
    for(var prop in TravailEditor.properties){
      if ( TravailRecurrentEditor.properties[prop] ) {
        // <= Cette propriété existe pour le travail récurrent
        // => On prend la valeur
        Object.assign(cwData, {[prop]: travail[prop]})
      }
    }
    // Pour forcer un nouvel ID propre aux travaux propres
    delete cwData.id

    // Pour forcer l'ajout des nouvelles propriétés propres aux
    // travaux récurrents
    for (var prop in TravailRecurrentEditor.properties){
      // Si la propriété n'est pas connue des travaux, il faut ajouter
      // la valeur par défaut
      if ( undefined === TravailEditor.properties[prop]){
        Object.assign(cwData, {[prop]: TravailRecurrentEditor.properties[prop].default})
      }
    }

    // console.log("Propriétés à conserver :", cwData)
    let recWork = new this(cwData)
    recWork.build()
    recWork.edit()
  }

  /**
    Initialisation de la classe
    Surclasse la méthode abstraite (pour ne pas charger tout de suite
    les données, qui ont besoin de connaitre la semaine à afficher)
  **/
  static init(){
    this.lastId = 0
    this.items  = {}
    this.path && fs.existsSync(this.path) && this.load.call(this)
  }

  // Le path des travaux, doit maintenant être défini par la semaine
  // courante
  static get path(){
    return this._path || (this._path = path.join(App.userDataFolder,'travaux_recurrents.json'))
  }

  // Il faut forcer ces valeurs, sinon, ce sont celles de Travail
  // qui sont utilisées
  static get editorClass(){return TravailRecurrentEditor}
  static get listingClass(){return TravailRecurrentListing}

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  /**
    Méthodes de construction
  **/

  /**
    Méthode qui regarde si le travail récurrent doit être construit
    et le construit le cas échéant.
  **/
  buildIfNecessary(){
    console.log("Est-ce que ce travail doit être construit ?", this)
  }

  // Construction du travail récurrent dans le container
  // +container+
  buildIn(container){
    var classCss = ['travail recurrent']
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
    this.buildIn(SemaineLogic.jours[this.njour].objTravaux)
    this.observe()
  }

  /**
   * Reconstruction du travail après modification
   */
  rebuild(){
    // TODO Récurrence supra hebdomadaire => plusieurs occurences
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

  // Date de début
  get startAt(){return this._startAt}
  get endAt(){return this._endAt}

  // Retourne la définition de la récurrence du travail
  get recurrence(){ return this._recurrence }

  // Retourne la valeur personnalisée pour la récurrence, si c'est
  // nécessaire
  get recurrence_value(){return this._recurrence_value}

  /**
    Jour du travail
  **/
  get jours(){ return this._jours }


}// /TravailRecurrent
