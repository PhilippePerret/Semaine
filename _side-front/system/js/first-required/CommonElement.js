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
    for(var k in data){
      this[`_${k}`] = data[k]
    }
    if (undefined === this._id) this._id = this.constructor.newId()
    this.constructor.add(this)
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
      console.log("zindex = ", zindex)
      this.editor.form.style.zIndex = zindex + 1
    }
  }

  get editorClass(){ return this.constructor.editorClass }

  get selected(){return this._selected || false}
  set selected(v){
    this._selected = v
    this.listingItem.classList[v ? 'add' : 'remove']('selected')
  }

  /**
    Méthode d'évènements
  **/

  /**
   * Méthode appelée quand on clique sur un élément de listing
   */
  onClickListingItem(ev){
    this.constructor.select(this)
  }

  /**
    Méthode appelée quand on double-clique sur l'élément de listing
    En fonction du modifier, ça l'édite ou ça le choisit
  **/
  onDoubleClickListingItem(ev){
    if (ev.metaKey) {
      this.edit(ev, this.constructor.editorClass.listing)
    } else {
      this.choose()
    }
  }

  /**
   * Méthode appelée quand on choisit l'item dans le listing, c'est-à-dire
   * lorsque l'on double-clique sur l'item
   * Si le listing était affiché pour un choix, on doit répondre à ce choix
   * TODO Il faut encore implémenter une méthode pour suivre.
   */
  choose(){

  }

  /**
    Propriétés fixes (enregistrées)
  **/
  get data()  {return this._data}
  get id()    {return this._id}
  get name()  {return this._name}

  /**
    Propriétés volatiles
  **/

  /**
   * Méthode pour observer l'élément dans son listing
   */
  __observeListingItem(){
    const my = this;
    this.listingItem.addEventListener('click', my.onClickListingItem.bind(my))
    this.listingItem.addEventListener('dblclick', my.onDoubleClickListingItem.bind(my))
  }

  get listingItem(){
    return this._liitem || (this._liitem = DGet(`#${this.listingId}`))
  }
  /**
   * ID pour l'élément dans le listing
   */
  get listingId(){
    return this._listingid || (this._listingid = `${this.constructor.minName}-items-${this.id}`)
  }

}
