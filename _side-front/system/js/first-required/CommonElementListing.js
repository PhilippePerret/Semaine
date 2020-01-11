'use strict'

/** ---------------------------------------------------------------------
  *   Classe de listing
  *
*** --------------------------------------------------------------------- */
class CommonElementListing {
  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */
  static chooseFor(asker, audessusDe) {
    // console.log("Je dois afficher la liste '%s' pour choisir un élément pour", this.name, asker)
    const chooser = new this(asker)
    chooser.show(audessusDe)
  }

  static get listings(){
    this._listings || (this._listings = [])
    return this._listings
  }

  static add(listing) {
    this._listings || (this._listings = [])
    this._listings.push(listing)
  }

  static forEach(method){
    for(var listing of this.listings){
      if (false === method(listing)) { break }
    }
  }

  static updateListings(){
    this.forEach(listing => listing.peuple())
  }

  /**
   * Instanciation
   Ici, le owner est celui qui demande le listing pour choisir un de
   ses éléments. C'est par exemple une tâche, dans un plan, qui appelle
   la liste des projets pour pouvoir définir son projet.

   Cette classe est utilisée pour l'instance 'listing' du propriétaire, de
   la même manière que 'editor' utilise une instance CommonElementEditor
   */
  constructor(owner){
    this.owner = owner
    this.constructor.add(this)
    this.id = Number(this.constructor.listings.length)
  }

  /**
   * Affichage du listing pour faire le choix principalement
   */
  show(audessusDe){
    this.built || this.build()
    this.obj.classList.remove('noDisplay')
    var zindex;
    if (audessusDe) {
      zindex = Number(audessusDe.style.zIndex) || 500
    } else {
      zindex = 500
    }
    this.obj.style.zIndex = zindex + 1
  }

  hide(){
    this.obj.classList.add('noDisplay')
  }

  build(){
    // Titre
    var row_header = DCreate('DIV',{
        class: 'header'
      , inner: [
          DCreate('SPAN',{class:'title', inner: `Listing des ${this.masterClass.humanData.plurialMin}`})
        ]
    })
    // Pour les Items
    var row_items = DCreate('UL', {id: `${this.domId}-ul`, class: 'ul-items'})
    // Le bouton pour créer ou supprimer un élément
    var row_buttons = DCreate('DIV',{
        class:'buttons'
      , inner:[
          DCreate('BUTTON', {class:'btn button-ok fright', inner:'Choisir'})
        , DCreate('SPAN',{class:'plusmoins-button plus-button', inner:'+'})
        , DCreate('SPAN',{class:'plusmoins-button moins-button', inner:'−'})
        , DCreate('BUTTON', {class:'btn button-cancel', inner:'Renoncer'})
        ]
    })

    document.body.append(DCreate('DIV',{
        id: this.domId
      , class:'common-listing'
      , inner:[ row_header, row_items, row_buttons ]
    }))
    this.built = true

    // On peuple le listing avec les éléments courants
    this.peuple()

    // On observe le listing
    this.observe()
  }

  peuple(){
    this.ul.innerHTML = ''
    this.masterClass.forEach(item => this.add(item))
  }

  observe(){
    const my = this
    // Le bouton OK
    this.obj.querySelector('.button-ok')
      .addEventListener('click', my.onChoisir.bind(my))
    // Le bouton Renoncer
    this.obj.querySelector('.button-cancel')
      .addEventListener('click', my.onCancel.bind(my))
    // Le bouton + pour ajouter un élément
    this.obj.querySelector('.plus-button')
      .addEventListener('click', my.onPlus.bind(my))
    // Le bouton - pour supprimer un élément
    this.obj.querySelector('.moins-button')
    .addEventListener('click', my.onMoins.bind(my))
  }

  add(item){
    var styles = []
    // Si l'item a une couleur associée, on l'indique
    if ( item.associatecolorId ) {
      styles.push(`color:${item.associateColor.ftcolor};background-color:${item.associateColor.bgcolor}`)
    }
    styles = styles.join(';')
    let liItem = DCreate('LI', {id:this.liIdFor(item), class:'item', inner: item.name, style:styles})
    this.ul.append(liItem)
    this._observeItem(item, liItem)
  }

  /**
    Actualisation de l'item
    ------------------------
   * Pour le moment, on part du principe qu'il n'y a que le .name à modifier
   * Plus tard, s'il s'avère que le LI d'un item doit être plus complexe,
   * il faudra revoir sa copie et faire plutôt une reconstruction-remplacement
   * de l'élément (en s'inspirant de ce qui sera fait dans 'add' ci-dessus).
   */
  update(item){
    var objItem = DGet(`#${this.liIdFor(item)}`)
    objItem && (objItem.innerHTML = item.name)
  }

  remove(item){
    let objItem = DGet(`#${this.liIdFor(item)}`)
    objItem && objItem.remove()
  }

  liFor(item){return DGet(`#${this.liIdFor(item)}`)}
  liIdFor(item){ return `${this.domId}-item-${item.id}` }

  _observeItem(item, liItem){
    const my = this;
    liItem.addEventListener('click', my.onClickItem.bind(my, item))
    liItem.addEventListener('dblclick', my.onDblClickItem.bind(my, item))
  }

  onClickItem(item, ev){
    // console.log("item = ", item)
    this.selected = item
  }

  onDblClickItem(item, ev){
    if (ev.metaKey) {
      // TODO Ici, on devrait pouvoir affecter la propriété qui s'appelle
      // toujours <objet>Id, par exemple categorieId pour la catégorie ou
      // projetId pour le projet. Mais on connait aussi l'askeur qui a
      // appelé ce listing.
      this.choose()
    } else {
      item.edit(ev, this.obj)
    }
  }

  // Sélection courante
  get selected(){return this._selected || undefined}
  set selected(item){
    if (this._selected ) this.deselect(this.selected)
    this._selected = item
    this.liFor(item).classList.add('selected')
  }
  deselect(item){
    this.liFor(item) && this.liFor(item).classList.remove('selected')
    if ( this.selected && item.id === this.selected.id ){
      delete this._selected
    }
  }

  /**
    Méthodes de données
  **/
  // Méthode pour créer un nouvel élément
  // On le crée toujours vraiment, mais sans le mettre dans la liste des
  // items
  createNewItem(ev, audessus){
    const newItem = new this.masterClass({name: `${this.masterClass.name} sans nom`, isNew:true})
    newItem.edit(ev, audessus)
  }

  /**
    Méthodes d'évènement
  **/

  // Quand on clique sur le bouton '+' du listing
  onPlus(ev){
    this.createNewItem(ev, this.obj)
  }

  // Quand on clique sur le bouton '-'
  async onMoins(ev){
    if (this.selected){
      const item = this.selected
      this.deselect(item)
      item.smartRemove()
    } else {
      console.log("Aucune sélection de type " + this.masterClass.name+ " à supprimer")
    }
  }

  /**
    Quand on clique sur le bouton CHOISIR
    Cela affecte l'élément à l'objet (par exemple la couleur à la catégorie,
    le domaine au travail, etc.)
    Pour le moment, en tout cas, ça le définit dans la boite d'édition.
  **/
  onChoisir(){
    // console.log("-> onChoisir / selected = ", this.selected)
    this.hide()
    if ( this.selected ){
      // Le mettre dans l'éditeur seulement
      this.owner.owner.editor.setLinkTo(this.masterClass, this.selected)
    } else {
      alert("Il faut choisir l'élément à associer.")
    }
  }

  /**
   * Quand on clique sur le bouton pour renoncer (ou Escape)
   */
  onCancel(){
    this.hide()
  }

  /**
    Propriétés
  **/

  get ul(){
    return this._ul || (this._ul = this.obj.querySelector('ul.ul-items'))
  }
  get obj(){
    return this._obj || (this._obj = DGet(`#${this.domId}`))
  }
  get domId(){
    return this._domid || (this._domid = `listing-${this.masterClass.minName}s-items-${this.id}`)
  }

  get masterClass() { return eval(this.constructor.name.replace(/Listing$/,'')) }

}
