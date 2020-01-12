'use strict'

class Travail extends CommonElement {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
    Pour créer un nouveau travail
    +Params+::
      +data+::[Hash] Table contenant les données. Il faut au minimum :
                      jour      Le jour (instance Jour) du travail
                      ou njour  L'indice du jour affiché
                      heure     L'heure du travail dans le jour
  **/
  static createNewInJour(data, ev){
    if (data.jour) {
      Object.assign(data, {njour: data.jour.indice})
      delete data.jour
    }
    data.tache || (data.tache = Prefs.get('travailTacheDefaut'))
    data.duree || (data.duree = Prefs.get('travailDureeDefaut'))
    data.isNew = true
    // console.log("Données de création :", data)
    var new_travail = new Travail(data)
    new_travail.build()
    new_travail.edit(ev)
  }

  /**
    Retransforme le travail récurrent +rtravail+ [TravailRecurrent] en
    travail normal.
  **/
  static createFromTravailRecurrent(rtravail){
    console.error("Cette méthode doit être implémentée")
  }

  /**
    Méthode appelée quand on clique un bouton '-' qui permet
    de supprimer un élément de type Travail ou TravailRecurrent
    (méthode commune mais propre ici à Travail, car il doit traiter les
     deux classes)
  **/
  static async onClickMoinsButton(ev){
    if ( this.selected ) {
      this.remove(this.selected) // On ne demande pas
    } else if ( TravailRecurrent.selected ) {
      TravailRecurrent.remove(TravailRecurrent.selected)
    } else {
      return message(`Merci de sélectionner l'élément '${this.name}' à supprimer.`)
    }
    return stopEvent(ev)
  }

  /**
    Initialisation de la classe
    Surclasse la méthode abstraite (pour ne pas charger tout de suite
    les données, qui ont besoin de connaitre la semaine à afficher)
  **/
  static init(){
    this.lastId = 0
    this.items  = {}
  }

  static get humanData(){
    return this._humandata || (this._humandata = {
        name:       'Travail'
      , nameMin:    'travail' // ne pas confontre avec this.minName
      , plurial:    'Travaux'
      , plurialMin: 'travaux'
    })
  }

  /**
    Le travail (ou le travail récurrent) hérite d'un projet
  **/
  static get firstInheritedClass(){return 'projet'}

  // Le path des travaux, doit maintenant être défini par la semaine
  // courante
  static get path(){
    // console.log("Path = ", Semaine.current.path)
    return SemaineLogic.current.path
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(data){
    super(data)
  }

  /**
    Méthodes d'état
  **/

  afterSelect(){
    X(2,'-> Travail#afterSelect', this)
    this.forEachCard('select') }
  afterDeselect(){
    X(2,'-> Travail#afterDeselect', this)
    this.forEachCard('deselect')
  }

  /**
    Pour exécuter une boucle sur toutes les cartes (définies) du travail
    ou du travail courant.
    +Params+::
      +method+:: [String|Function] Méthode à jouer sur chaque carte définie.
  **/
  forEachCard(method){
    X(2,'-> Travail#forEachCard', this)
    const isFunction = method instanceof Function
    for(var card of this.cards) {
      // console.log("method: %s sur card = ", method, card)
      if ( !card ) continue ;
      const res = isFunction ? method(car) : card[method].call(card) ;
      if ( false === res ) break ;
    }
  }

  /**
   * Demande de construction du travail
   Construire un travail consiste à construire toutes ses cartes. Une seule
   si c'est un travail ponctuel, possiblement plusieurs si c'est un travail
   récurrent
   */
  build(){
    X(2,'-> Travail#build', this)
    this.isRecurrent && this.prepareCards()
    this.forEachCard('build')
  }
  // Reconstruction (après modification)
  rebuild(){
    X(2,'-> Travail#rebuild', this)
    this.isRecurrent && this.prepareCards()
    this.forEachCard('rebuild')
  }

  /**
    Méthode appelée avant le dispatch des nouvelles valeurs dans le
    travail.
  **/
  async beforeDispatch(newData){
    X(2,'-> Travail#beforeDispatch', this)
    return newData ;
  }

  /**
    Méthode appelée après la méthode de dispatch commune
    C'est cette méthode, pour Travail, qui va permettre de savoir
    s'il faut transformer le travail en travail récurrent
  **/
  afterDispatch(){
    X(2,'-> Travail#afterDispatch', this)
    if ( !this._recurrent ) return
    // La récurrence doit être prise en compte. Cela consiste à :
    //  - supprimer le travail de cette semaine
    //  - l'ajouter à la liste des travaux récurrents
    TravailRecurrent.createFromTravail(this)
    Travail.remove(this)
  }

  /**
   * Pour détruire le travail dans la semaine
   * (quand on le supprime, la méthode est appelée par smartRemove et doit
   * donc être conservée ici)
   */
  removeDisplay(){
    X(2,'-> Travail#removeDisplay', this)
    this.forEachCard('remove')
  }


  /**
    Toutes les cartes du travail ou du travail récurrent sur l'agenda
    Noter que Travail et TravailRecurrent ont tous les deux cette liste, même
    si le travail n'en a qu'une, au jour this.njour.
    Noter que this.cards contient toujours 7 éléments, le premier sera toujours
    null et les autres correspondent au 6 `njour` possible (lundi = cards[1],
    mardi = cards[2], etc.).
    Il faut en tenir compte pour les boucles. Pour ne pas avoir de problèmes,
    le mieux est d'utiliser this.forEachCard(method) qui n'appelle la méthode
    que sur des cartes existantes.
  **/
  get cards(){
    if ( undefined === this._cards ) {
      this._cards = []
      var c = undefined ;
      for(var i = 0 ; i < 7 ; ++i ) {
        c = undefined ;
        if ( !this.isRecurrent && this.njour == i) c = new TravailCard(this, {njour: this.njour})
        this._cards.push(c)
      }
    } return this._cards ;
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


  get isRecurrent(){ return false }

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

  /**
    La tâche à accomplir, formatée

    Pour le moment, on gère les variables dollar.
  **/
  get formated_tache(){
    let fstr = this.tache;
    if ( this.tache.match(/\$\{/) ){
      // console.log("'%s' est une tâche avec variable", this.tache)
      fstr = fstr.replace(/\$\{([a-zA-Z]+)\}/g, (corr, classe) => {
        classe = classe.toLowerCase()
        var prop = `${classe}Id`
        if ( this[prop] && this[classe]) {
          return this[classe].name
        } else {
          return `- ${classe.toTitle()} inconnu -`
        }
      })
    }
    return fstr
  }

  /**
    Retourne les informations de la tâche
  **/
  get formated_infos(){
    let fstr = ''
    if ( !this.tache.match('${projet}') && this.projet ) {
      fstr += `Projet “${this.projet.name}”`
    }
    return fstr
  }

  /**
    Tâche à accomplir
  **/
  get tache(){ return this._tache }

  /**
    Pour la cohérence avec les autres CommonElement(s)
  **/
  get name(){return this.tache}

  /**
    Heure
  **/
  get heure(){ return this._heure }

  /**
    Durée
  **/
  get duree(){ return this._duree }

  /**
    Jour du travail
    Noter que même les travaux récurrents définissent cette donnée, qui
    correspond alors au jour où le travail a été créé, mais n'est pas utilisé
    dans les méthodes.
  **/
  get njour(){ return this._njour }

  get jour(){
    return this._jour || ( this._jour = Jour.get(this.njour) )
  }

  /**
    Ne pas confondre cette propriété avec isRecurrent qui est toujours false
    pour une instance de ce type. Ici, la propriété peut être vraie quand on
    revient de l'édition.
  **/
  get recurrent(){ return this._recurrent }

  /**
    La référence à l'élément, pour Debug/X
    Permet d'écrire :
      X(4, "Le message de débug", this)
      où le `this` sera remplacé par cette référence précisant l'élément
  **/
  get refDebug(){
    return this._refdebug || (
      this._refdebug = `<Travail#${this.id} "${this.name}">`
    )
  }

}// /Travail
