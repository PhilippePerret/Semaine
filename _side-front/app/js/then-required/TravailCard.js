'use strict';
/** ---------------------------------------------------------------------
  Class TravailCard
  ----------------------
  Gestion des travaux affichés

  Cette classe gère chaque fiche travail affichée dans le semainier.
*** --------------------------------------------------------------------- */
class TravailCard {

  /**
    Instanciation
    +Params+::
      +owner+:: [Travail|TravailRecurrent]  L'instance travail ou travail récurrent
      +data+::  [Object] Les données propres qui permettent de construire le
                travail, à commencer par son njour, son indice de jour de la
                semaine.
          njour     Indice du jour de la semaine
  **/
  constructor(owner, data){
    this.owner = owner
    this.data  = data
    this.njour = data.njour
  }

  /**
    Méthode pour construire la carte du travail
  **/
  build(){
    X(4,'-> TravailCard#build', {travail:this.owner, njour:this.njour})
    const overlap = this.checkOverlap()
    // console.log("overlap dans build=",overlap)
    if ( overlap < 3 ) {
      this.buildInJour(overlap)
      this.observe()
    }
  }

  /**
   * Reconstruction du travail après modification
  Les travaux récurrents ont leur propre méthode
   */
  rebuild(){
    X(4,'-> TravailCard#rebuild', {travail:this.owner, njour:this.njour})
    this.reset()
    this.unobserve()
    this.remove()
    this.build()
  }

  /**
    Remise à zéro des valeurs consignées pour pouvoir les recalculer ou
    les ré-initialiser.
  **/
  reset(){
    for(var prop of ['top','height']){ delete this[`_${prop}`]}
  }

  /**
    Méthode qui détruit l'élément graphique
    + le retire de la liste des plages du jour
  **/
  remove(){
    if (this.obj) {
      this.obj.remove()
      this.removeFromPlage()
    }
  }

  /**
    Supprimer cette carte de travail de la liste des plages du jour,
    pour signaler qu'elle est libre.
  **/
  removeFromPlage(){
    var newPlages = []
    for (var plage of SemaineLogic.jours[this.njour].plages ) {
      if ( this.owner.id === plage.travail.id ) continue ;
      newPlages.push(plage)
    }
    SemaineLogic.jours[this.njour].plages = newPlages ;
  }

  /**
    Méthode pour observer cette carte
  **/
  observe(){
    const my = this
    this.obj.addEventListener('dblclick', my.onDblClick.bind(my))
    this.obj.addEventListener('click', my.onClick.bind(my))

    // Si le propriétaire de la carte (Travail ou TravailRecurrent) possède un
    // projet, on peut peut-être trouver les boutons outils pour ouvrir le
    // dossier, le fichier ou jouer le code.
    if ( this.owner.projet ) {
      // Observation des trois outils (3 ou moins) qui permettent d'ouvrir le
      // fichier, le dossier ou le code d'ouverture
      let openFichierTools = DGet('.tools-open-fichier',this.obj)
      openFichierTools && openFichierTools.addEventListener('click', my.openFichier.bind(my))
      let openDossierTools = DGet('.tools-open-dossier',this.obj)
      openDossierTools && openDossierTools.addEventListener('click', my.openDossier.bind(my))
      let openCodeTools = DGet('.tools-open-code',this.obj)
      openCodeTools && openCodeTools.addEventListener('click', my.openCode.bind(my))
    }

    let toggleTimeTools = DGet('.tools-toggle-time', this.obj)
    toggleTimeTools.addEventListener('click',my.onToggleTime.bind(my, toggleTimeTools))


    /**
      SI
        - le travail appartient au jour courant
        - et son heure est inférieure au temps courant
      ALORS
        - il faut ajouter un trigger pour avertir
    **/
    if ( this.njour == TODAY.wDay && this.owner.heure > Horloge.currentHour) {
      Cursor.current.addTrigger(this)
    } else {
      this.owner.notified = true; // to be quiet, but problem after minuit.
    }
  }

  /**
    Méthode pour désobserver la carte
  **/
  unobserve(){
    const my = this ;
    if (this.obj) {
      this.obj.removeEventListener('dblclick', my.onDblClick.bind(my))
      this.obj.removeEventListener('click', my.onClick.bind(my))
    }
  }

  /**
   * Méthodes de construction
   */
  buildInJour(overlap){
    const container = this.jour.objTravaux;
    var classCss = ['travail'] ;
    var dataNjour = this.njour
    this.isRecurrent  && classCss.push('recurrent')
    overlap > 0       && classCss.push('overlap')
    this.isSelected   && classCss.push('selected')
    var styles = []
    if ( this.owner.f_color ) {
      styles.push(`background-color:${this.owner.f_color.bgcolor}`)
      styles.push(`color:${this.owner.f_color.ftcolor}`)
    }

    // Le div contenant les outils (ouverture, mise en route du temps, arrêt)
    let toolsContent = []
    if ( this.owner.projet ) {
      toolsContent.push(...this.owner.projet.opener.cardMenus)
      toolsContent.push(DCreate('DIV', {class: 'separator'}))
    }
    toolsContent.push(...[
      DCreate('A', {inner: "Démarrer le temps", class:'tools-toggle-time'})
    ])
    let innerTools = [
        DCreate('SPAN', {class:'tools-collapse-button', inner:'⚙️'})
      , DCreate('DIV', {class:'content', inner:toolsContent})
    ]

    // L'objet de la carte
    // -------------------
    // Rappel = un travail, s'il est récurrent, en a plusieurs.
    const objAttrs = {
        class:classCss.join(' ')
      , inner:[
          DCreate('DIV',  {class:'tools', inner:innerTools})
        , DCreate('SPAN', {class:'tache', inner:this.owner.formated_tache })
        , DCreate('SPAN', {class:'infos', inner:this.owner.formated_infos })
        ]
      , style:styles.join(';')
      , 'data-travail-id': this.owner.id
      , 'data-travail-type': this.isRecurrent?'recurrent':'ponctuel'
      , 'data-njour':this.njour
      }
    this.obj = DCreate('DIV', objAttrs)

    container.append(this.obj)
    // On place correctement l'objet (noter que top et height ont pu être
    // rectifiés par l'étude des chevauchements)
    this.obj.style.top    = `${this.top}px`
    this.obj.style.height = `${this.height}px`

  }

  /**
    Pour sélectionner ou désélectionner la carte
  **/
  select(){this.obj.classList.add('selected')}
  deselect(){this.obj.classList.remove('selected')}


  /*
    Méthodes d'évènement
  */

  /**
   * Un double-clic sur un travail le met en édition
   */
  onDblClick(ev){
    // console.log("Double clic sur le travail")
    this.owner.edit(ev)
    return stopEvent(ev) // pour ne pas déclencher le jour
  }

  /**
   * CLic sur un travail => le sélectionner

   Les travaux récurrents possèdent leur propre méthode
   */
  onClick(ev){
    this.owner.constructor.select(this.owner)
    return stopEvent(ev)
  }

  /**
    3 méthodes répondant aux menus outils pour ouvrir le fichier, le dossier
    ou le code dans le cas où le propriétaire (Travail ou TravailRecurrent) de
    cette carte appartient à (définit) un projet.
  **/
  openFichier(ev){
    stopEvent(ev)
    this.owner.projet.opener.openFichier()
    return false
  }
  openDossier(ev){
    stopEvent(ev)
    this.owner.projet.opener.openDossier()
    return false
  }
  openCode(ev){
    stopEvent(ev)
    this.owner.projet.opener.openCode()
    return false
  }

  /**
    Pour mettre en route ou arrêter le chronomètre
  **/
  onToggleTime(tool, ev){
    stopEvent(ev)
    if ( this.timeRunning ) {
      this.stopHorloge(tool)
    } else {
      this.startHorloge()
    }
    this.timeRunning = !this.timeRunning
    return false
  }

  /**
    Appelée pour mettre en route le temps, c'est-à-dire jouer l'horloge
    et l'inscrire dans la carte
  **/
  startHorloge(){
    const my = this
    this.startTime = new Date().getTime()
    this.objHorloge = DGet('.tools-toggle-time', this.obj)
    my.setHorlogeTime.call(my)
    this.horlogeTimer = setInterval(my.setHorlogeTime.bind(my), 1000)
  }
  setHorlogeTime(){
    var now = new Date().getTime()
    this.workingTime = parseInt((now - this.startTime)/1000,10)
    this.objHorloge.innerHTML = Horloge.s2h(this.workingTime)
  }

  async stopHorloge(tool){
    tool.innerHTML = "Démarrer le temps" // TODO Localisé
    clearInterval(this.horlogeTimer)
    delete this.horlogeTimer
    if ( this.workingTime > 30) {
      const saveTime = await confirmer(loc('travail.ask-save-time'))
      if (saveTime) {
        this.owner.addWorktime(this.workingTime)
        this.owner.projet && this.owner.projet.addWorktime(this.workingTime)
      }
    }
  }

  /**
   * Propriétés
   */

  /**
    Retourne un identifiant unique pour un élément de la carte
  **/
  idFor(prop){ return `${this.domId}-${prop}`}

  /**
   * Propriétés volatiles
   */

  /**
    Instance {Jour} du jour de la carte
  **/
  get jour(){
    return this._jour || ( this._jour = Jour.get(this.njour) )
  }
  /**
    Identifiant absolu de la carte
  **/
  get domId(){
    if (undefined === this._domid){
      this._domid = `${this.owner.ref}-jour-${this.njour}`
    } return this._domid ;
  }

  /**
   * Raccourcis
   */
  get isRecurrent(){return this.owner.isRecurrent}
  get isSelected(){return this.owner.selected}

  /**
   * Méthodes fonctionnelles
  **/

  /**
    Méthode qui check les éventuels chevauchement avec un autre travail déjà
    inscrit dans l'agenda.

    La méthode retourne
      3   En cas d'erreur fatale => le travail ne sera pas écrit
      1   En cas d'erreur non fatale => le travail sera écrit mais marqué
      0   Aucun problème de chevauchement
  **/
  checkOverlap(){
    const njour   = this.njour
    const top     = this.top ;
    const bottom  = Number(this.top + this.height) ;
    // var plages = SemaineLogic.jours[this.njour]
    var err = null
    var fatalError = false
    const jour = SemaineLogic.jours[njour]
    var plages = jour.plages.slice()
    var newPlages = []
    for(var plage of plages){
      // Si le travail qu'on étudie est celui qu'on checke, on passe (cela
      // arrive lorsque l'on reconstruit un travail)
      if (plage.travail.id == this.id){
        continue ; // donc on ne le prend pas
      } else {
        newPlages.push(plage)
      }
      if ( plage.start == top ){
        // => IMPOSSIBLE (les deux travaux commencent en même temps)
        err = `le travail “${this.owner.name}” et le travail “${plage.travail.name}” ne peuvent pas commencer en même temps !`
        fatalError = true
      } else if ( plage.start < top && plage.end > top) {
        err = `le travail “${this.owner.name}” est chevauché par le travail “${plage.travail.name}”`
        this._top = plage.end // on repousse la hauteur
        this._height = bottom - this.top
        plage.travail.markOverlaped()
      } else if ( plage.start > top && plage.end < bottom) {
        err = `le travail “${this.owner.name}” chevauche le travail “${plage.travail.name}”`
        this._height = plage.end - top // on réduit la hauteur du travail courant
      } else {
        // <= Aucun chevauchement
      }
    }
    if ( fatalError ) {
      return 3
    } else {
      newPlages.push({start:this.top, end:this.top + this.height, travail:this.owner})
      jour.plages = newPlages
      err && error(`${jour.jname}, ${err}`)
      return err ? 1 : 0
    }
  }

  markOverlaped(){
    this.obj.classList.add('overlap')
  }
  unmarkOverLaped(){
    this.obj.classList.remove('overlap')
  }

  /**
   * Propriétés graphiques
   */

   // ~= Heure du travail
   get top(){
     return this._top || (this._top = (this.owner.heure - HEURE_START) * HEURE_HEIGHT)
   }

   // ~= Durée du travail
   get height(){
     return this._height || (this._height = this.owner.duree * HEURE_HEIGHT)
   }

}
