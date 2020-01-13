'use strict'
/** ---------------------------------------------------------------------
  *   Classe abstraite CommonElement
  *   ------------------------------
  *   Représente les éléments communs des applications, avec des
  *   des méthodes qu'on trouve pratiquement chaque fois, comme une
  *   méthode de classe 'get' qui retourne l'élément par son identifiant,
  *   la propriété de classe `items` qui contient toutes les éléments
  *   la méthode de classe constructor qui reçoit toujours en unique
  *   argument les données qui seront dispatchées, etc.
  *
*** --------------------------------------------------------------------- */
class CommonElement {
  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
    Retourne l'élément d'identifiant +item_id+
    Note: +item_id+ commence à 1, pas à zéro, pour éviter d'avoir toujours
    à tester l'undéfinitude.
  **/
  static get(item_id) {
    if (!item_id) return ;
    return this.items[item_id]
  }

  /**
    Pour ajouter un item
    Méthode appelée systématiquement à l'instanciation
  **/
  static add(item){
    Object.assign(this.items, {[item.id]: item})
    if (item.id > this.lastId) this.lastId = Number(item.id)
  }

  /**
    Pour faire une boucle sur chaque élément
    +Params+::
      +method+::[Function] Méthode à faire tourner sur chaque élément.
                            Si la méthode retourne false et strictement false,
                            la boucle est interrompue.
  **/
  static forEach(method){
    // console.log("this.items: ", this.items)
    for(var item_id in this.items){
      if ( false === method.call(null, this.items[item_id]) ) {
        break ; // Pour pouvoir interrompren
      }
    }
  }

  /**
   * Méthode appelée quand on sélectionne un item
   *
   * Pour fonctionner, la classe concrète doit avoir une propriété
   * d'instance `selected` qui traite la sélection (set selected(v){...})
   */
  static select(item){
    X(2,'-> CommonElement::select', {this:`<class ${this.name}>`, item:item})
    const sameAsSelected = false // this.selected && this.selected.id == item.id
    // Pour le moment, on n'utilise pas ça car ça poserait problème pour les
    // double-click. Il faudrait gérer une temporisation pour savoir si c'est
    // un click ou un double-click. Ou alors recevoir ici l'évènement et voir
    // le laps de temps entre la sélection et cette nouvelle sélection.
    this.selected && this.deselect()
    unless(sameAsSelected, () => {
      this.selected = item
      this.selected.select()
    })
  }
  static deselect(item){
    X(2,'-> CommonElement::deselect', {this:`<class ${this.name}>`, item:item})
    if (undefined === item) { // => c'est la sélection courante
      item = this.selected
      delete this.selected
    }
    item.deselect()
  }

  /**
    Méthodes d'ensembles (items)
  **/

  /**
   * Sauve les données items
   * Requis : la définition de +path+
   */
  static save(){
    this.path || raise(`Il faut définir le fichier ${this.name}.path, chemin d'accès au fichier de données.`)
    fs.existsSync(this.path) && fs.unlinkSync(this.path)
    var datas = Object.values(this.items).map(item => {
      if ( item.isNew ){
        item.isNew = false // pour la clarté
      }
      return item.data
    })
    // console.log("datas:", datas)
    fs.writeFileSync(this.path, JSON.stringify(datas))
    // Il faut actualiser les listings de cet élément
    this.listingClass.updateListings()
  }

  /**
   * Charge les données items qui doivent se trouver dans
   * le fichier défini par `this.path`
   */
  static load(){
    this.path || raise(`Il faut définir le fichier ${this.name}.path, chemin d'accès au fichier de données.`)
    if ( fs.existsSync(this.path)){
      require(this.path).forEach(ditem => new this(ditem))
    } else {
      // Pour le travail
      this.lastId = 0
      this.items  = {}
    }
  }

  /**
    Initialisation de la classe
  **/
  static init(){
    this.lastId = 0
    this.items  = {}
    this.path && fs.existsSync(this.path) && this.load.call(this)
  }

  /**
    Méthode appelée quand on clique un bouton '+' qui permet
    d'ajouter un élément de ce type.
  **/
  static onClickPlusButton(ev){
    // TODO Créer un nouveau travail sur le premier emplacement libre
    return stopEvent(ev)
  }

  /**
    Méthode appelée quand on clique un bouton '-' qui permet
    de supprimer un élément de ce type
  **/
  static async onClickMoinsButton(ev){
    if ( this.selected ) {
      this.remove(this.selected) // On ne demande pas
    } else {
      return message(`Merci de sélectionner l'élément '${this.name}' à supprimer.`)
    }
    return stopEvent(ev)
  }

  /**
    Détruit l'itme +item+
    ---------------------
    C'est juste pour avoir une méthode de classe claire, car on pourrait
    se contenter d'appeler la méthode 'smartRemove' de l'item, qui se
    charge de tout.
  **/
  static remove(item){
    X(2,'-> CommonElement::remove', {this:this.refDebug, item:item})
    item.smartRemove()
  }

  static get refDebug(){return `<class ${this.name}>`}

  /**
    Retourne un identifiant libre
  **/
  static newId(){
    return ++ this.lastId
  }

  /**
   * La classe éditeur de cet élément
   * Noter qu'elle n'existe pas forcément.
   */
  static get editorClass(){
    return this._editorclass || (this._editorclass = eval(`${this.name}Editor`))
  }

  static get listingClass(){
    return this._listingclass || (this._listingclass = eval(`${this.name}Listing`))
  }

  /**
    Le nom humain de la classe
    Peut-être redéfini pour chaque classe
  **/
  static get humanName(){ return this.name }

  /**
   * Nom de class minuscule
   */
  static get minName(){
    return this._minname || (this._minname = this.name.toLowerCase())
  }

  static get humanData(){return this._humandata ||(this._humandata = {
      name:       this.name
    , nameMin:    this.name.toLowerCase()
    , plurial:    `${this.name}s`
    , plurialMin: `${this.name.toLowerCase()}s`
  })}

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(data){
    this._data = data || {} // par défaut
    this.firstDispatch(data)
    if (undefined === this._id) this._id = this.constructor.newId()
    this.constructor.add(this)
  }

  firstDispatch(d){
    for(var k in d){this[`_${k}`] = d[k]}
  }

  // Les dispatchs suivant, avec d'autres valeurs éditées ou créées
  async dispatch(newData){
    X(2,'-> CommonElement#dispatch', {objet:this.refDebug,data:newData})
    // console.log("Nouvelles données : ", newData)
    // console.log("this.data au début du dispatch : ", JSON.stringify(this._data))

    // Si une méthode before update existe, on l'appelle avec les données
    // Cette méthode a été inaugurée pour les travaux récurrents.
    // La méthode est asynchrone pour permettre des questions/confirmations
    if ( this.beforeDispatch instanceof Function){
      newData = await this.beforeDispatch.call(this, newData)
    }

    var realNewData = {} // celles qui ont vraiment changé
    var keysNewData = Object.keys(newData)
    for(var k in this.constructor.editorClass.properties){
      // console.log("k:'%s', value:'%s'", k, newData[k])
      if ( keysNewData.indexOf(k) > -1 ) {
        if ( this.data[k] != newData[k] ) {
          this.set(k, newData[k])
          Object.assign(realNewData, {[k]: newData[k]})
        } else {
          // console.log("Valeur de clé '%s' n'a pas changé (dans this.data:'%s', dans newData:'%s')", k, this.data[k], newData[k])
        }
      } else {
        console.log("La propriété définie '%s' n'est pas connu des nouvelles données à transmettre", k)
      }
    }

    // console.log("realNewData après dispatch:", realNewData)
    // Si des valeurs ont changées, il faut actualiser le
    // fichier
    // Noter que ça ne devrait pas arriver au chargement (rappel : la méthode
    // est appelée à l'instanciation) car newdata et this.data sont identiques.
    if (Object.keys(realNewData).length){

      if (this.constructor.path){
        // console.log("Données modifiées, je dois sauver…", realNewData)
        // Mesure de prudence
        delete this._data.isNew
        // Aperçu des données data au moment de sauver
        // console.log("Avant la sauvegarder this.data de l'élément = ", this.data)
        // Les jours, par exemple, ne sont pas enregistrés
        this.constructor.save()
        // Il faut aussi actualiser l'affichage
        this.update()
      }
    }
    this.edited = false

    // Si une méthode d'après update existe
    if ( this.afterDispatch instanceof Function) this.afterDispatch.call(this)
  }

  /**
    Permet définir la valeur dans l'instance et dans son _data
    +Params+::
      +prop+::[String]  Nom de la propriété de l'élément (pe 'name')
      +value+::[Any]    Valeur à donner à l'élément, ou undefined
  **/
  set(prop, value){
    this[`_${prop}`] = value // peut être undefined
    this._data[prop] = value
  }

  /**
    Définir des valeurs et enregistrer toutes les données
  **/
  setAndSave(table){
    for(var prop in table) {
      const value = table[prop]
      this[`_${prop}`] = value
      this._data[prop] = value
    }
    this.constructor.save()
  }

  /**
    Édition de l'élément, quel que soit son type (sa classe)

    +Params+::
      +audessusDe+:: [HTMLElement] Elément au-dessus duquel il faut ouvrir
                      l'édition
  **/
  edit(ev, audessusDe){
    X(2,'-> CommonElement#edit', {this:this})
    this.editor = new this.editorClass(this)
    this.editor.show(ev)
    if (audessusDe) {
      var zindex = Number(audessusDe.style.zIndex)
      this.editor.form.style.zIndex = zindex + 1
    }
    this.edited = true
  }

  /**
   * Procède à la destruction intelligente de l'élément.
   * Elle est "intelligente" dans le sens où si l'élément est utilisé
   * par d'autre élément (peut-être passé), il est gardé et seulement
   * marqué 'removed'.
   * Elle est intelligente aussi car elle peut détruire l'élément
   * partout où il est, en lui-même, s'il est édité ou en listing
   *
   * TODO Chercher si l'élément est utilisé ailleurs
   *
   */
  smartRemove() {
    X(2,'-> CommonElement#smartRemove', this)
    this.isSelection && this.constructor.deselect()
    delete this.constructor.items[this.id]
    this.constructor.save()
    this.removeDisplay instanceof Function && this.removeDisplay()
    this.editor && this.editor.updateInnerForm()
    this.removeInListing()
  }
  /**
    Détruit l'élément dans les listings, if any
  **/
  removeInListing(){
    this.constructor.listingClass.forEach(list => list.remove(this))
  }

  update(){
    // console.log("Je dois actualiser l'item, en édition, peut-être pas dans le listing")

    if ( this.rebuild instanceof Function ) {
      // Actualisation particulière
      this.rebuild()
    }
    // On actualise dans l'éditeur seulement si l'éditeur existe
    this.editor && this.editor.updateInnerForm()
    // Actualiser dans les listings éventuels
    // TODO
    // Actualiser à l'affichage
  }

  get editorClass(){ return this.constructor.editorClass }

  /**
    Méthodes d'état
  **/

  // Retourne true si l'élément est l'élément sélectionné
  // (dans le listing si c'est une couleur, un projet etc. ou dans l'agenda
  //  pour un travail)
  get isSelection(){
    return this.selected === true
    // return this.constructor.selected && this.constructor.selected.id == this.id
  }

  select(){
    X(2,'-> CommonElement#select', this)
    this.selected = true
    if ( this.afterSelect instanceof Function ) this.afterSelect.call(this)
  }
  deselect(){
    X(2,'-> CommonElement#deselect', this)
    this.selected = false
    if ( this.afterDeselect instanceof Function ) this.afterDeselect.call(this)
}

  /**
    Méthode d'évènements
  **/

  /**
    Propriétés fixes (enregistrées)
    que possède tout type d'éléments
  **/
  get data()  {return this._data}
  get id()    {return this._id}
  get name()  {return this._name}
  get isNew() {return this._isNew === true}
  set isNew(v){this._isNew = v; delete this._data.isNew /* au cas où */}

  /**
    Retourne le jour du mois de ce travail
    Note : ce jour dépend du njour de la semaine et de la semaine
    Note : this.jour n'est défini que pour un Travail et un TravailRecurrent,
    pas pour une Catergorie, une AssociateCouleur ou autre.
  **/
  get mDay(){
    return this.jour.smartDay.mDay
  }
  /**
    Méthodes formatage
  **/
  get f_duree(){
    return Horloge.heure2horloge(this.duree)
  }
  get f_heure(){
    return Horloge.heure2horloge(this.heure)
  }
  get f_njour(){
    return SmartDay.DATA_JOURS[this.njour].hname.toLowerCase()
  }
  get f_mDay(){
    return String(this.mDay)
  }

  /**
   * Méthodes pour trouver la couleur
   */
   /**
      Retourne soit la couleur définie, soit la couleur héritée
      par un parent.
  **/
  get f_color(){
    if ( this.associatecolorId ){
      return this.associateColor ;
    } else {
      // On va essayer de la trouver dans un parent
      return this.associatecolor_herited
    }
  }


  /**
    Pour faire référence à l'élément
  **/
  get ref(){
    return this._ref || (this._ref = `${this.constructor.minName}-${this.id}`)
  }

  /**
    N0002
    Ces méthodes sont communes à tous les éléments-commun, mais
    c'est juste pour ne pas répéter les méthodes. En réalité, ils
    ne sont pas tous pertinents. Par exemple, projetId n'a aucun
    sens pour un Domaine, qui est une classe hiérarchiquement supérieure.
  **/
  /**
    Propriétés volatiles
  **/
  get associateColor(){
    return this._associatecolor || (this._associatecolor = AssociateColor.get(this.associatecolorId))
  }
  get associatecolorId() { return this._associatecolorId }
  get associatecolor_herited(){
    if ( undefined === this._associatecolor_herited) {
      this._associatecolor_herited = this.getHeritedValueFor(AssociateColor) || null
    } return this._associatecolor_herited
  }

  // Catégorie (cf. N0002)
  get categorie(){
    return this._categorie || (this._categorie = Categorie.get(this.categorieId))
  }
  get categorieId(){ return this._categorieId }

  get categorie_herited(){
    if ( undefined === this._categorie_herited) {
      this._categorie_herited = this.getHeritedValueFor(Categorie) || null
    } return this._categorie_herited
  }

  // Domaine (cf. N0002)
  get domaine(){
    return this._domaine || (this._domaine = Domaine.get(this.domaineId))
  }
  get domaineId(){return this._domaineId}
  get domaine_herited(){
    if ( undefined === this._domaine_herited) {
      this._domaine_herited = this.getHeritedValueFor(Domaine) || null
    } return this._domaine_herited
  }

  // Projet (cf. N0002)
  get projet(){
    return this._projet || (this._projet = Projet.get(this.projetId))
  }
  get projetId(){ return this._projetId }
  get projet_herited(){
    if (undefined === this._projetherited){
      this._projetherited = getValueFor(Projet) || null
    } return this._projetherited
  }

  /**
    Je dois repenser l'algorithme pour trouver une valeur héritée
    Exemple avec un Travail dont on veut le Domaine
    SI
      <travail>[domaineId] est défini
    ALORS
      On retourne <travail>[domaineId]
    SINON
      SI
        le Projet existe
      ALORS
        On cherche le domaineId du projet
        SI
          Le domaineId du Projet est défini
        ALORS
          On retourne <Projet>[domaineId]
        SINON
          On recherche dans la Catégorie du Projet
          SI
            La Catégorie du projet existe
          ALORS
            On doit regarder si la catégorie définie domaineId
          SINON
            On continue de chercher ailleurs (avec la catégorie)
      SINON
        SI
          la catégorie existe
        ALORS
          On cherche le domaineId de la catégorie
        SINON
          On ne renvoie rien

    +Params+::
      +wantedClasse+::[Any]   La classe de l'élément dont on veut l'identifiant
                        par exemple 'Domaine' (ou la classe) pour obtenir
                        le domaineId réel ou hérité de l'élément.
      +parHeritage+::[Boolean]  Si true (par défaut), on recherche la valeur
                                par héritage.
  **/
  getIdFor(wantedClasse, parHeritage = true) {
    // raise_backtrace("Arrivée dans getIdFor")
    if ('string' == typeof wantedClasse) wantedClasse = eval(wantedClasse)
    const propName = `${wantedClasse.minName}Id` // p.e. 'domaineId'
    // Pour mettre l'ID qui sera trouvé
    let foundId ;
    // Si l'instance définit explicitement cette valeur, on la renvoie
    // console.log("[getIdFor] this[propName] = this[%s] = ", propName, this[propName], this)
    if ( foundId = this[propName] ) return foundId ;
    // Si on ne doit pas chercher par héritage, tant pis, on s'en
    // retourne sans valeur
    if ( false === parHeritage )  return undefined ;
    // Sinon, on va la chercher dans son élément supérieur. Par exemple, si
    // `this` est un travail, on cherche dans l'élément supérieur `Projet`
    let supElementName = HIERARCHIE_PARENTS[this.constructor.name]
    // Si la classe supérieur est égale à la classe qu'on cherche, on peut
    // la passer puisqu'un projet, par exemple, ne peut pas définir un projet.
    // Donc on va passer tout de suite à la classe supérieure
    if ( supElementName == wantedClasse.name ) {
      supElementName = HIERARCHIE_PARENTS[supElementName]
      // console.log("[getIdFor] Classe recherchée = classe fouillée => impossible => on prend la classe supérieure : '%s'", supElementName)
    }
    // console.log("[getIdFor] On va rechercher dans la classe supérieure '%s'", supElementName)
    // Si l'élément supérieur n'existe pas dans l'absolus (c'est le cas pour
    // et seulement pour les {Domaine}s et les {AssociateColor}s), alors on
    // doit s'en retourner les mains vides.
    if ( !supElementName ) return undefined
    while ( supElementName ) {
      // console.log("Recherche de '%s' avec l'élément supérieur '%s'", propName, supElementName)
      let supElementClass = eval(supElementName) // par exemple 'Projet'
      // Si l'élément supérieur existe dans l'absolu, existe-t-il pour
      // l'instance courante ?
      if ( this[`${supElementClass.minName}Id`] && this[supElementClass.minName]){
        // si oui, on va regarder s'il définit la propriété recherchée
        foundId = this[supElementClass.minName].getIdFor(wantedClasse)
        // S'il la définit explicitement ou par héritable, on la renvoie
        if ( foundId ) return foundId
      } else {
        // L'instance supérieur qui existe dans l'absolu (pe Categorie) n'existe
        // par pour l'instance courante.
        // => Il faut prendre l'élément supérieur
      }
      supElementName = HIERARCHIE_PARENTS[supElementName]
    }
    return undefined
  }

  /**
    Retourne la valeur (pas l'identifiant) pour la propriété de classe
    +classe+
  **/
  getHeritedValueFor(classe/* pe class Categorie */){
    if ('string' === typeof classe) classe = eval(classe)
    var inheritedValue = this.getIdFor(classe)
    return classe.get(inheritedValue)
  }

  getHeritedNameFor(classe /* pe class Categorie */){
    if ('string' === typeof classe) classe = eval(classe)
    const value = this.getHeritedValueFor(classe)
    if ( value ) return value.name
    else return undefined
  }
  getNameFor(classe, parHeritage = false){
    const instance = this.getHeritedValueFor(classe)
    if (instance) return instance.name
    else return undefined
  }
  /**
    Retourne l'élément pour un affichage du nom qui sera cliquo-éditable
    Mais attention, il faut observer ce span.
  **/
  getWatchedNameFor(classe, parHeritage = false) {
    if ('string' == typeof classe) classe = eval(classe)
    const inst = this.getValueFor(classe, parHeritage)
    if (inst) return DCreate('SPAN', {inner:inst.name, 'data-classe':classe.name, 'data-id':inst.id, 'watched-element':true})
    else return undefined
  }

  /**
    Renvoie l'instance de classe +classe+ [String|Any] pour l'élément
    courant. Si +parHeritage+ est vrai, on cherche aussi par héritage.
    [1]
      Noter que this.getIdFor peut retourner undefined mais que la
      méthode get en tiendra compte et retourne undefined aussi.
  **/
  getValueFor(classe, parHeritage = false){
    if ('string' == typeof classe) classe = eval(classe)
    X(9,'CommonElement#getValueFor',{this:this, classe:classe.name, parHeritage:parHeritage})
    return classe.get(this.getIdFor(classe, parHeritage)) // [1]
  }

  /**
    Retourne true si la propriété de classe +classe+ est une propriété
    héritée.
    En fait, si la valeur est définie, on sait que c'est une valeur héritée
    si elle n'est pas définie pour cette instance.
  **/
  isHeritedFor(classe){
    if ('string' === typeof classe) classe = eval(classe)
    return undefined === this[`${classe.minName}Id`]
  }

}
