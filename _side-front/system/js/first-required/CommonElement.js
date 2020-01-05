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
    if ( this.selected ) {
      this.deselect(this.selected)
      delete this.selected
    }
    this.selected = item
    this.selected.selected = true
  }
  static deselect(item){
    item.selected = false
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
        console.log("J'ai mis le nouvel item à ancien")
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
    return stopEvent(ev)
  }

  /**
    Méthode appelée quand on clique un bouton '-' qui permet
    de supprimer un élément de ce type
  **/
  static async onClickMoinsButton(ev){
    console.log('-> onClickMoinsButton')
    if ( this.selected ) {
      var choix = await confirmer(`Dois-je vraiment détruire l’élément “${this.selected.name}” ?`)
      if (choix) {
        this.selected.smartRemove()
        delete this._selected
      }
    } else {
      return message(`Merci de sélectionner l'élément ${this.name} à supprimer.`)
    }
    return stopEvent(ev)
  }

  /**
    Retourne un identifiant libre
  **/
  static newId(){
    return ++ this.lastId
  }

  /**
   * Nom de class minuscule
   */
  static get minName(){
    return this._minname || (this._minname = this.name.toLowerCase())
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
  dispatch(newData){
    // console.log("Nouvelles données : ", newData)
    var realNewData = {} // celles qui ont vraiment changé
    var keysNewData = Object.keys(newData)
    for(var k in this.constructor.editorClass.properties){
      // console.log("k:'%s', value:'%s'", k, newData[k])
      if ( keysNewData.indexOf(k) > -1 ) {
        // console.log("La clé '%s' est connu des données transmises", k)
        // console.log("Valeur dans this.data:'%s' / nouvelle:'%s'", this.data[k], newData[k])
        if ( this.data[k] != newData[k])
        this._data[k] = this[`_${k}`] = newData[k]
        Object.assign(realNewData, {[k]: newData[k]})
      }
    }

    // console.log("realNewData après dispatch:", realNewData)
    // Si des valeurs ont changées, il faut actualiser le
    // fichier
    // Noter que ça ne devrait pas arriver au chargement (rappel : la méthode
    // est appelée à l'instanciation) car newdata et this.data sont identiques.
    if (Object.keys(realNewData).length){
      if (this.constructor.path){
        console.log("Données modifiées, je dois sauver…", realNewData)
        // Les jours, par exemple, ne sont pas enregistrés
        this.constructor.save()
        // Il faut aussi actualiser l'affichage
        this.update()
      }
    }
    this.edited = false
  }

  /**
    Édition de l'élément, quel que soit son type (sa classe)

    +Params+::
      +audessusDe+:: [HTMLElement] Elément au-dessus duquel il faut ouvrir
                      l'édition
  **/
  edit(ev, audessusDe){
    this.editor || (this.editor = new this.editorClass(this))
    this.editor.show(ev)
    if (audessusDe) {
      var zindex = Number(audessusDe.style.zIndex)
      console.log("zindex = ", zindex)
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
   * TODO Pour le moment, on le détruit simplement
   *
   */
  smartRemove() {
    delete this.constructor.items[this.id]
    this.constructor.save()
    this.removeDisplay instanceof Function && this.removeDisplay()
    this.edited && this.editor.updateInnerForm()
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
    this.edited && this.editor.updateInnerForm()
    // Actualiser dans les listings éventuels
    // TODO
  }

  get editorClass(){ return this.constructor.editorClass }



  /**
    Méthode d'évènements
  **/

  /**
    Propriété volatile
  **/
  get associateColor(){
    return this._associatecolor || (this._associatecolor = AssociateColor.get(this.accociatecolorId))
  }

  /**
    Propriétés fixes (enregistrées)
    que possède tout type d'éléments
  **/
  get data()  {return this._data}
  get id()    {return this._id}
  get name()  {return this._name}
  get isNew() {return this._isNew === true}
  set isNew(v){this._isNew = v; delete this._data.isNew /* au cas où */}

  get accociatecolorId() { return this._accociatecolorId }

  get ref(){
    return this._ref || (this._ref = `${this.constructor.minName}-${this.id}`)
  }

}
