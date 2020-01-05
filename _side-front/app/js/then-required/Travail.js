'use strict'

const HEURE_START   = 6 ;
const HEURE_END     = 18 ;
const HEURE_HEIGHT  = 50 ;
const COEF_MINUTE   = HEURE_HEIGHT / 60 ;
const TOP_START     = 30 ; // hauteur du nom du jour

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

  static get path(){
    return this._path || (this._path = path.join(App.userDataFolder,'travaux.json'))
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(data){
    /**
     * Va définir:
     *    tache       La tâche à accomplir
     *    heure       L'heure à laquelle il faut l'accomplir
     *    njour       L'indice du jour de la semaine (de 0 à 6)
     *    duree       La durée du travail
     *    recurrence  La récurrence éventuelle
     */
    super(data)

    // SI
    //    - le travail appartient au jour courant,
    //    - et son heure est inférieure au temps courant
    // ALORS il faut ajouter un trigger
    if ( this.njour == Jour.todayIndice && this.heure > Horloge.currentHour) {
      Cursor.current.addTrigger(this)
    } else {
      // Pour être tranquille, mais il faut bien mesurer le fait que
      // si on change de jour, ça ne fonctionnera pas, les tâches du
      // jour suivant ne seront pas signalées.
      this.notified = true
    }
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
    var classCss = ['travail']
    this.selected && classCss.push('selected')
    this.obj = DCreate('DIV',{class:classCss.join(' '),inner:[
      DCreate('SPAN', {class:'tache', inner:`${this.formated_tache} à ${this.heure}` })
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
    this.buildIn(JOURS_SEMAINE[this.njour].objTravaux)
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
  **/
  observe(){
    const my = this
    this.obj.addEventListener('dblclick', my.onDblClick.bind(my))
    this.obj.addEventListener('click', my.onClick.bind(my))
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

  /**
    La tâche à accomplir, formatée

    Pour le moment, on gère les variables dollar.
  **/
  get formated_tache(){
    let fstr = this.tache;
    if ( this.tache.match(/\$\{/) ){
      // console.log("'%s' est une tâche avec variable", this.tache)
      fstr = fstr.replace(/\$\{([a-zA-Z]+)\}/, (corr, classe) => {
        classe = classe.toLowerCase()
        var prop = `${classe}Id`
        if ( this[prop] ) {
          return this[classe].name
        } else {
          return `- ${classe.toTitle()} inconnu -`
        }
      })
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
  /**
    La catégorie du travail
  **/
  get categorie(){
    return this._categorie || (this._categorie = Categorie.get(this.categorieId))
  }
  get categorieId(){
    return this._categorieId
  }

  /**
    Le projet du travail
  **/
  get projet(){
    return this._projet || (this._projet = Projet.get(this.projetId))
  }
  get projetId(){ return this._projetId }
}
