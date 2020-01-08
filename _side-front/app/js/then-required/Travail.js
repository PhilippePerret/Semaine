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
    Initialisation de la classe
    Surclasse la méthode abstraite (pour ne pas charger tout de suite
    les données, qui ont besoin de connaitre la semaine à afficher)
  **/
  static init(){
    this.lastId = 0
    this.items  = {}
  }

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
  get selected() { return this._selected}
  set selected(v){
    this._selected = v
    this.obj.classList[v?'add':'remove']('selected')
  }
  /**
    Méthodes de construction
  **/
  buildIn(container){
    var classCss = ['travail'] ;
    this.isRecurrent && classCss.push('recurrent')
    this.selected && classCss.push('selected')
    var styles = []
    if ( this.f_color ) {
      styles.push(`background-color:${this.f_color.bgcolor}`)
      styles.push(`color:${this.f_color.ftcolor}`)
    }

    // L'objet du travail
    this.obj = DCreate('DIV',{
        class:classCss.join(' ')
      , inner:[
          DCreate('SPAN', {class:'tache', inner:this.formated_tache })
        , DCreate('SPAN', {class:'infos', inner:this.formated_infos })
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
   */
  build(){
    this.buildIn(SemaineLogic.jours[this.njour].objTravaux)
    this.observe()
  }

  /**
   * Reconstruction du travail après modification
   */
  rebuild(){
    this.unobserve()
    this.obj.remove()
    this.build()
  }

  /**
    Observation de l'objet
    ----------------------
    Ici, on doit aussi ajouter un "trigger" pour le travail s'il appartient
    au jour courant et qu'il n'est pas encore passé
  **/
  observe(){
    const my = this
    this.obj.addEventListener('dblclick', my.onDblClick.bind(my))
    this.obj.addEventListener('click', my.onClick.bind(my))
    // SI
    //    - le travail appartient au jour courant,
    //    - et son heure est inférieure au temps courant
    // ALORS il faut ajouter un trigger
    if ( this.njour == TODAY.wDay && this.heure > Horloge.currentHour) {
      Cursor.current.addTrigger(this)
    } else {
      // Pour être tranquille, mais problème si on passe minuit.
      this.notified = true
    }
  }

  async beforeDispatch(newData){
    if ( ! newData.recurrent ) return newData ;
    // On passe ici si c'est un travail récurrent
    var choix = await confirmer("Voulez-vous vraiment faire de ce travail un travail récurrent ?")
    if ( choix ) { return newData }
    else { return Object.assign(newData, {recurrent: false}) }
  }

  /**
    Méthode appelée après la méthode de dispatch commune
    C'est cette méthode, pour Travail, qui va permettre de savoir
    s'il faut transformer le travail en travail récurrent
  **/
  afterDispatch(){
    if ( !this.isRecurrent ) return
    // La récurrence doit être prise en compte. Cela consiste à :
    //  - supprimer le travail de cette semaine
    //  - l'ajouter à la liste des travaux récurrents
    TravailRecurrent.createFromTravail(this)
    Travail.remove(this)

  }

  /**
   * Pour détruire le travail dans la semaine
   * (quand on le supprime)
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
   * Un double-clic sur un travail le met en édition
   */
  onDblClick(ev){
    // console.log("Double clic sur le travail")
    this.edit(ev)
    return stopEvent(ev) // pour ne pas déclencher le jour
  }

  /**
   * CLic sur un travail => le sélectionner
   */
  onClick(ev){
    this.constructor.select(this)
    return stopEvent(ev)
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
  **/
  get njour(){ return this._njour }

  get jour(){
    return this._jour || ( this._jour = Jour.get(this.njour) )
  }

}// /Travail
