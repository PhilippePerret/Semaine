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
    /**
      Méthode : faut-il passer en revue chaque jour (les 7) et voir
      s'il faut ajouter ce travail à ce jour ?
      Par exemple, on teste le 7 janvier 2020
        - si récurrence tous les jours (jour) => oui
        - si récurrence seulement les jours (jours) et que ce jour est du
          même nombre (wDay) => oui
        - si une fois par semaine
    **/
    SemaineLogic.forEachJour(jour => {
      // console.log("jour = ", jour)
      if ( ! this.isActiveOn(jour) ) return ;
      this.build(jour.njour)
    })
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
    Retourne true si le travail récurrent est actif
    Rappel : normalement, il suffit de vérifier la date de démarrage, car
    si un travail récurrent est "dépassé", il n'est plus enregistré
  **/
  get isActive(){
    return this.realStartAt < TODAY.time
  }
  get realStartAt(){
    return ((this.startAt && SmartDay.parseDDMMYY(this.startAt))||TODAY.from(-7)).time
  }

  // Construction du travail récurrent dans le container
  // +container+
  // TODO Si la construction est la même que pour les travaux non récurrents,
  // il faudra peut-être supprimer cette méthode propre.
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
          DCreate('SPAN', {class:'tache', inner:`${this.formated_tache}` })
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
  build(njour){
    njour = njour || this.njour
    this.buildIn(SemaineLogic.jours[njour].objTravaux)
    this.observe()
  }

  /**
   * Reconstruction du travail après modification
   */
  rebuild(){
    // TODO Récurrence supra hebdomadaire => plusieurs occurences
    raise("TravailRecurrent#rebuild doit être ré-implémenté")
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
    raise("TravailRecurrent#removeDisplay doit être implémenté")
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
  get recurrenceValue(){return this._recurrenceValue}

  /**
    Jour du travail
  **/
  get jours(){ return this._jours }


}// /TravailRecurrent
