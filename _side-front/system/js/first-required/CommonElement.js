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
    return (this.items||{})[item_id]
  }

  /**
    Pour ajouter un item
    Méthode appelée systématiquement à l'instanciation
  **/
  static add(item){
    this.items || this.init()
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
    this.items || this.init()
    console.log("this.items: ", this.items)
    for(var item_id in this.items){
      if ( false === method.call(null, this.items[item_id]) ) {
        break ; // Pour pouvoir interrompren
      }
    }
  }

  /**
   * Méthode appelée quand on sélectionne un item
   */
  static select(item){
    if ( this.selectedItem ) {
      this.deselect(this.selectedItem)
      delete this.selectedItem
    }
    this.selectedItem = item
    this.selectedItem.selected = true
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
    var datas = Object.values(this.items).map(item => item.data)
    // console.log("datas:", datas)
    fs.writeFileSync(this.path, JSON.stringify(datas))
  }

  /**
   * Charge les données items qui doivent se trouver dans
   * le fichier défini par `this.path`
   */
  static load(){
    this.path || raise(`Il faut définir le fichier ${this.name}.path, chemin d'accès au fichier de données.`)
    if ( fs.existsSync(this.path)){
      this.items = {}
      require(this.path).forEach(ditem => {
        var item = new this(ditem)
        Object.assign(this.items, {[item.id]: item})
      })
      // console.log("%s.items = ", this.name, this.items)
    } else {
      this.init()
    }
  }

  /**
    Instanciation de la classe
  **/
  static init(){
    this.lastId = 0
    this.items  = {}
    if(this.path && fs.existsSync(this.path)){ this.load() }
  }

  /**
    Retourne un identifiant libre
  **/
  static newId(){
    this.lastId || this.init()
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
    for(var k in d){
      this[`_${k}`] = d[k]
    }
  }

  // Les dispatchs suivant, avec d'autres valeurs éditées ou créées
  dispatch(newData){
    var realNewData = {} // celles qui ont vraiment changé
    var keysNewData = Object.keys(newData)
    for(var k in this.data){
      console.log("k:'%s', value:'%s'", k, newData[k])
      if ( keysNewData.indexOf(k) > -1 ) {
        if ( this.data[k] != newData[k] /* valeur modifiée */)
        this.data[k] = this[`_${k}`] = newData[k]
        Object.assign(realNewData, {[k]: newData[k]})
      }
    }
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
        this.updateDisplay()
      }
    }
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
      var zindex = audessusDe.style.zIndex
      // console.log("zindex = ", zindex)
      this.editor.form.style.zIndex = zindex + 1
    }
  }

  update(){
    console.log("Je dois actualiser l'item, en édition, peut-être pas dans le listing")
    // Actualisation dans l'affichage des semaines
    // TODO
    // Actualiser en édition (if any) Utiliser un this.edited
    // TODO
    // Actualiser dans les listings éventuels
    // TODO
  }
  /**
   * Après une modification, on doit actualiser l'affichage
   * L'affichage peut être dans un listing ou dans la semaine
   * en fonction de ce que c'est.
   */
  updateDisplay(){
    console.warn("Il faut voir comment actualiser les listes d'items")
    // if (this.listingItem) {
    //   this.listingItem.replaceWith(this.buildListingItem())
    //   this.__observeListingItem()
    // }
  }

  get editorClass(){ return this.constructor.editorClass }


  /**
    Méthode d'évènements
  **/

  /**
    Propriétés fixes (enregistrées)
  **/
  get data()  {return this._data}
  get id()    {return this._id}
  get name()  {return this._name}


  get ref(){
    return this._ref || (this._ref = `${this.constructor.minName}-${this.id}`)
  }

}
