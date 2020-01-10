'use strict'
/*
  Class TravailRecurrent
  ----------------------
  Gestion des travaux récurrents

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
    // console.log('-> TravailRecurrent::createFromTravail')
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

    console.log("Propriétés à conserver :", cwData)
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



  /**
   * Méthode appelée quand on sélectionne un travail récurrent
   *
   Les méthodes sont propres aux travaux récurrents qui peuvent posséder
   plusieurs objets dans la semaine affichée.
   */
  static select(item, njour){
    if ( isNaN(njour) ) return
    if ( this.selected ) {
      this.deselect()
    }
    this.selected = item
    this.selected.select(true, njour)
  }
  static deselect(item, njour){
    if ( isNaN(njour) ) return
    if (undefined === item) { // => c'est la sélection courante
      item = this.selected
      delete this.selected
    }
    item.select(false, njour)
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  /**
    Méthodes de construction
  **/

  /**
    Méthode qui regarde si le travail récurrent doit être construit
    et le construire le cas échéant.
    Pour ce faire, on étudie seulement les 7 jours affichés. Si un travail
    doit être actif le jour étudié, on le construit pour ce jour.
  **/
  buildIfNecessary(){
    SemaineLogic.forEachJour(jour => {
      if ( ! this.isActiveOn(jour) ) return ;
      this.build(jour.njour)
    })
  }


  /**
    Méthodes d'état
  **/
  // Sélection ou désélection de l'objet du travail récurrent
  get selected() { return this._selected}
  select(v, njour){
    this._selected = v
    this.objs[njour].classList[v?'add':'remove']('selected')
  }


  /**
    Retourne true si le travail courant est active le jour +jour+ {Jour}

    Note : c'est la propriété `recurrence` qui va déterminer en premier
    lieu si le travail doit être affiché.

    +Params+::
      +jour+:: [Jour]   Instance du jour à checker. Contient notamment la
                        propriété `smartDay` qui retourne le SmartDay du
                        jour en question.
  **/
  isActiveOn(jour){
    const jourDay   = jour.smartDay
    const recval    = this.recurrenceValue
    const startDay  = SmartDay.parseDDMMYY(this.startAt)
    const endDay    = this.endAt && SmartDay.parseDDMMYY(this.endAt)

    // Dans tous les cas, si on se trouve avant la date de départ,
    // on ne doit pas afficher le travail
    if ( jourDay.time < startDay.time ) return false ;
    // Dans tous les cas, si on se trouve après la date de fin, on
    // ne doit pas afficher le travail (et il pourra être détruit)
    if ( this.endAt && jourDay.time > endDay.time ) return false ;

    switch(this.recurrence){
      case 'none'   : return false ;
      case 'jour'   : return true  ; // tous les jours
      case 'jours'  : // seulement les jours voulus
        return recval.indexOf(String(jourDay.wDay)) > -1
      case 'xjour'  : // tous les x jours
        // Le principe à appliquer ici est que le jour courant soit à un
        // nombre de jours correspondant à la définition de la répétition.
        // Par exemple, si c'est "tous les 3 jours", il faut que le jour
        // courant soit à un nombre /
      case 'hebdo'  : // une fois par semaine, au jour et à l'heure dite
        return jourDay.wDay == this.njour
      case 'biheb'  :
        // Il faut que ce soit le même jour
        if ( jourDay.wDay != this.njour ) return false ;
        const is14joursAvant  = jourDay.mDay == startDay.mDay - 14
        const isSameJour      = jourDay.mDay == startDay.mDay
        const is14joursApres  = jourDay.mDay == startDay.mDay + 14
        return isSameJour || is14joursApres || is14joursAvant
      case 'month'  : // une fois par mois
        // Calcul encore plus compliqué : il faut connaitre le premier jour
        // Noter qu'on ne peut pas le connaitre d'après startAt puisque le
        // travail a pu être créé pour un autre jour. TODO Pour la simplicité du
        // calcul, il pourrait être préférable de calculer la valeur au moment
        // de l'enregistrement et de l'utiliser ici.
        return ( jourDay.mDay == Number(recval) )
      case 'months' : // seulement les mois choisis
        // Donc le jour testé doit correspondre à la valeur de récurrence
        // calculé et son mois doit être un de ceux retenu.
        // La date de départ a été mise au jour du mois voulu
        return ( jourDay.mDay == startDay.mDay && recval.split(' ').indexOf(startDay.month) > -1)
      case 'bimen' : // bimensuel => tous les deux mois
        // Est un mois sur deux ?
        // Ici, on se sert du jour du mois où ça doit être affiché et de
        // la date de démarrage
        if ( jourDay.mDay != Number(recval) ) return false ;
        // Ensuite, il faut que le mois courant du jour ait la même 'parité'
        // que le mois du travail
        return jourDay.month % 2 == startDay.month % 2
      case 'trim' : // trimestriel => tous les trois mois
        // Est-ce un mois sur trois ?
        if ( jourDay.mDay != Number(recval) ) return false ;
        return jourDay.month % 3 == startDay.month % 3
      case 'annee' : // annuel
        return `${jourDay.mDay2}/${jourDay.month2}` == String(recval)
      case 'cron' : // une récurrence CRON
        console.error("Le traitement par CRON doit être implémenté. Pour le moment, je ne construit pas le travail.")
        return false
        // TODO Le plus gros…
        var dataRec = CRON.parse(recval)

        /**
          Rappel :
            mns   minutes
            hrs   heures
            mjr   jour du mois
            mon   mois
            wjr   Jour de la semaine
        **/

      default:
        raise(`La valeur de récurrence ${this.recurrence} est inconnue…`)
    }
  }

  /**
    Méthode appelée avant de dispathcher les données. Elle permet
    notamment de définir la valeur `recurrenceValue` pour certaines
    récurrences afin de faciliter l'analyse au cours de la construction (cf.
    ci-dessus la méthode `isActiveOn`)

    On doit vérifier aussi la validité des données TODO Mais il
    faudrait plutôt que ce soit une méthode séparée.
  **/
  beforeDispatch(newData){
    // Faut-il retransformer le travail récurrent en travail normal ?
    if ( !newData.recurrent ) return newData ;
    return new Promise((ok,ko) => {
      const recval = newData.recurrenceValue
      let v = null, s = null
      // console.log("newData avant rectif pour travail récurrent:", newData)
      const newDataDay = SemaineLogic.jours[newData.njour].smartDay
      switch(newData.recurrence){
        case 'bimen':
        case 'trim':
          // La date de démarrage (startAt) déterminera ce qui sera le
          // premier mois.
          s = newDataDay.asDDMMYY
          // Pas de break
        case 'month':
          // On met en valeur de récurrence le numéro du jour du mois correspond
          // à l'indice de la semaine du jour choisi (on peut être mercredi et
          // avoir choisir un travail pour vendredi) et son mDay
          v = newDataDay.mDay
          break
        case 'months':
          // Comme la valeur de récurrence est déjà définie, ici,
          // on utilise plutôt le `startAt` pour définir le premier jour.
          s = newDataDay.asDDMMYY
          break
        case 'annee':
          // On met la valeur de récurrence à "DD/MM"
          v = `${newDataDay.mDay2}/${newDataDay.month2}`
          break
      }
      if ( v !== null ) {
        // console.log("recurrenceValue mis à ", v)
        newData.recurrenceValue = v
      }
      if ( s != null ) {
        // console.log("startAt mis à ", s)
        newData.startAt = s
      }
      // console.log("newData après rectification pour travail récurrent", newData)
      ok(newData)
    })
  }

  /**
    Méthode appelée après la méthode de dispatch commune
    C'est cette méthode, pour TravailRecurrent, qui va permettre de savoir
    s'il faut transformer le travailRecurrent en travail normal
  **/
  afterDispatch(){
    if ( this.isRecurrent ) return
    // La récurrence doit être prise en compte. Cela consiste à :
    //  - supprimer le travail récurrent de cette semaine
    //  - l'ajouter à la liste des travaux
    Travail.createFromTravailRecurrent(this)
    TravailRecurrent.remove(this)

  }

  // // Construction du travail récurrent dans le container
  // // +container+
  // // TODO Si la construction est la même que pour les travaux non récurrents,
  // // il faudra peut-être supprimer cette méthode propre. NOTE Seule la classe
  // // change ?
  // buildIn(container){
  //   var classCss = ['travail recurrent']
  //   this.selected && classCss.push('selected')
  //   var styles = []
  //   if ( this.f_color ) {
  //     styles.push(`background-color:${this.f_color.bgcolor}`)
  //     styles.push(`color:${this.f_color.ftcolor}`)
  //   }
  //   this.obj = DCreate('DIV',{
  //       class:classCss.join(' ')
  //     , inner:[
  //         DCreate('SPAN', {class:'tache', inner:`${this.formated_tache}` })
  //       ]
  //     , style:styles.join(';')
  //     })
  //   container.append(this.obj)
  //   this.obj.style.top = ((this.heure - HEURE_START) * HEURE_HEIGHT) +'px'
  //   if (this.duree){
  //     this.obj.style.height = (this.duree * HEURE_HEIGHT) + 'px'
  //   }
  // }

  /**
   * Demande de construction du travail
   *
   * On doit créer toutes les occurences de la semaine, si c'est
   * un travail quotidien par exemple
   */
  build(njour){
    njour = njour || this.njour
    const overlap = this.checkOverlap(njour)
    if (overlap < 3) {
      this.buildIn(SemaineLogic.jours[njour].objTravaux, overlap, njour)
      this.observe(njour)
    }
  }

  /**
   * Reconstruction du travail après modification
   */
  rebuild(njour){
    njour = njour || this.njour
    this.unobserve(njour)
    this.objs[njour].remove()
    this.build(njour)
  }

  markOverlaped(){
    console.error("Pour marquer un travail récurrent overlappé, il faut étudier mieux")
    // TODO Rappel : un travail récurrent ne possède pas de this.obj mais des this.objs
  }
  unmarkOverLaped(){
    console.error("Pour démarquer un travail récurrent overlappé, il faut étudier mieux")
  }

  /**
   * Pour détruire le travail dans la semaine
   * (quand on le supprime)
   * noter que si la récurrence supra-hebdomadaire est gérée
   * plus haut, il est inutile de le faire ici puisque chaque
   * occurence passera par là.
   */
  removeDisplay(){
    this.objs.forEach(obj => obj.remove())
  }

  unobserve(njour){
    const my = this
    this.objs[njour].removeEventListener('dblclick', my.onDblClick.bind(my))
    this.objs[njour].removeEventListener('click', my.onClick.bind(my))
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

  onClick(ev){
    // console.log("ev = ", ev)
    const obj = ev.target
    this.constructor.select(this, Number(obj.getAttribute('data-njour')))
    return stopEvent(ev)
  }

  /**
   * States
   */

  // Renvoie true si c'est un travail récurrent
  // Note : pour faire la différence avec les travaux normaux (les deux
  // instances partagent beaucoup de méthodes)
  get isRecurrent(){ return true }

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

  get f_startAt(){
    return SmartDay.parseDDMMYY(this.startAt).asLong
  }

  // Retourne la définition de la récurrence du travail
  get recurrence(){ return this._recurrence }

  // Retourne la valeur personnalisée pour la récurrence, si c'est
  // nécessaire
  get recurrenceValue(){return this._recurrenceValue}

  /**
    La propriété, dans la boite d'édition, permet de repasser en travail
    normal. Ne pas la confondre avec isRecurrent qui sera toujours vraie pour
    un travail récurrent et toujours false pour un travail ponctuel.
  **/
  get recurrent(){return !!this._recurrent}

  /**
    Jour du travail
  **/
  get jours(){ return this._jours }


}// /TravailRecurrent
