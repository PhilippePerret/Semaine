'use strict'
/** ---------------------------------------------------------------------
  *   Classe abstraite CommonEditElement
  *   ----------------------------------
  *   Pour la gestion de tous les éléments éditables
  *

REQUIS POUR HÉRITAGE
--------------------

  Si la classe est MonTruc, on doit faire une classe d'éditeur de nom
  `MonTrucEditor` qui va hériter de cette classe. Donc :
      class MonTrucEditor extends CommonElementEditor {
        ...
      }

  Cette classe doit définir la table `properties` qui
  définit les propriétés de l'objet édité.
  static get properties(){
    return {
      <property>: {hname: "nom humain", type: 'string\number\etc.', default: <valeur par défaut>}
    }
  }
  Le `type` peut être une classe propre à l'application.
  Le mieux est que cette classe soit aussi une classe avec classeEditor
  associée. Dans ce cas, tout le reste est géré automatiquement.
  Sinon :
    Cette classe doit posséder une méthode d'instance
    `chooseFor` qui permet de choisir un élément dans la liste des éléments de
    cette classe, si possible d'en créer un
    et une propriété d'instance `name` qui permette d'afficher l'élément
    dans le formulaire.

  Dans le #innerForm (cf. ci-dessous), il suffit d'appeler la méthode
  #rowFormForType(<classe>) avec la classe (i.e. le type) en argument pour
  produire un champ avec le nom courant (if any) et un bouton pour choisir

  #innerForm
    Méthode d'instance qui construire le formulaire. Appelé par `build`, qui
    doit renvoyer le contenu propre du formulaire (hors champ id, boutons,
    etc.)

  La classe du formulaire est mise à 'common-editor noDisplay'

  La classe CSS <classe propriétéaire minuscule>-form qui peut définir ou
  redéfinir les éléments du formulaire.

MÉTHODES PRATIQUES
------------------

  show()          Pour afficher le formulaire d'édition
  idFor(<prop>)   Pour obtenir l'identifiant d'une propriété
                  Utile pour la fabrication du formulaire.

  getFormValues() Retourne les valeurs des propriétés (telles que définies
                  dans `properties`)
  setFormValues() Définit les valeurs des champs en se basant sur properties
                  et sur l'owner de l'éditeur.
*** --------------------------------------------------------------------- */
class CommonElementEditor {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
   * Permet de choisir un élément du type voulu
   +Params+::
    +asker+::[Any classe]       Le 'demandeur', l'instance qui réclame le
                                choix de cet élément.
    +audessusDe+::[DOMElement] Elément au-dessus duquel il faut placer
                  le listing. Noter que souvent c'est asker.form qui est
                  envoyé.
   */
  static chooseFor(asker, audessusDe){
    console.log("Il va falloir choisir un ", this.masterClass.name)
    // this.masterClass.forEach()
    this.listingBuilt || this.buildListing()
    this.listing.classList.remove('noDisplay')
    var zindex;
    if (audessusDe) {
      zindex = audessusDe.style.zIndex || 500
    } else {
      zindex = 500
    }
    this.listing.style.zIndex = zindex + 1
  }

  /**
    Peuple la liste
  **/
  static peupleListing(){
    const my = this
    var items   = this.masterClass.items
    const ul = this.listing.querySelector('ul.ul-items')
    ul.innerHTML = ''
    this.masterClass.forEach(item => {
      ul.append(DCreate('LI',{id:`${item.listingId}`, inner:item.name}))
      item.__observeListingItem()
    })
  }
  /**
   * Construit un listing pour pouvoir choisir un élément ou
   * en créer un nouveau
   */
  static buildListing(){
    // Titre
    var row_header = DCreate('DIV',{
        class: 'header'
      , inner: [
          DCreate('SPAN',{class:'title', inner: `Listing des ${this.masterClass.name.toLowerCase()}s`})
        ]
    })
    // Pour les Items
    var row_items = DCreate('UL', {id: `${this.listingId}-ul`, class: 'ul-items'})
    // Le bouton pour créer ou supprimer un élément
    var row_buttons = DCreate('DIV',{
        class:'buttons'
      , inner:[
          DCreate('BUTTON', {class:'btn button-ok fright', inner:'OK'})
        , DCreate('SPAN',{class:'button button-plus', inner:'+'})
        , DCreate('SPAN',{class:'button button-moins', inner:'−'})
        ]
    })
    this._listing = DCreate('DIV',{
        id: this.listingId
      , class:'common-listing'
      , inner:[ row_header, row_items, row_buttons ]
    })
    document.body.append(this.listing)
    this.listingBuilt = true

    // On peuple le listing avec les éléments courants
    this.peupleListing()

    // On observe le listing
    this.observeListing()

  }

  static observeListing(){
    const my = this
    this.listing.querySelector('.button-ok')
      .addEventListener('click', my.onClickOkListing.bind(my))
  }

  static onClickOkListing(){
    this.listing.classList.add('noDisplay')
  }

  /**
   * Retourne la classe maitresse de cette éditor, qui correspond
   * au nom de la classe sans 'Editor'. Par exemple, la masterClass
   * de 'ProjetEditor' est 'Projet'
   */
  static get masterClass() { return eval(this.name.replace(/Editor$/,'')) }

  static get listing(){
    return this._listing || (this._listing = DGet(`#${this.listingId}`))
  }
  static get listingId(){
    return this._listingid || (this._listingid = `listing-${this.masterClass.minName}s-items`)
  }


  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  /**
    Instanciation

    +Params+::
      +owner+::[Any Class] Le propriétaire, c'est-à-dire l'objet qui doit
                          être édité.
  **/
  constructor(owner){
    this.owner = owner
  }

  show(options){
    this.built || this.build()
    this.form.classList.remove('noDisplay')
    // On le place à l'endroit voulu si défini
    if (options && (options.x || options.left)) {
      this.form.style.top   = `${options.y||options.top}px`
      this.form.style.left  = `${options.x||options.left}px`
    }
    // On charge les valeurs
    if (!(options && options.dontFill)) this.setFormValues()
  }

  hide(){
    this.form.classList.add('noDisplay')
  }

  /**
    Méthodes de données
  **/

  /**
    Met les valeurs du propriétaire dans les champs
  **/
  setFormValues(){
    for(var prop in this.constructor.properties){
      let dataProp = this.constructor.properties[prop]
      var domProp = 'value'
      var fieldId = this.idFor(prop)
      var value   = this.owner[prop]
      switch (dataProp.type) {
        case 'string':
        case 'number':
        case 'float':
          break;
        case 'boolean':
          domProp = 'checked'
          break;
        default:
          /* Un type propre à l'application */
          var typeMin = dataProp.type.toLowerCase()
          // Champ id contenant l'identifiant de l'élément
          var fieldId = this.idFor(typeMin+'Id')
          // Si la valeur est défini pour le propriétaire, il faut
          // aussi indiquer le nom
          var fieldNameId = this.idFor(`${typeMin}-name`)
          console.log("Id du champ nom:", fieldNameId)
          if ( DGet(`#${fieldNameId}`) ) {
            DGet(`#${fieldNameId}`).innerHTML = this.owner[typeMin] ? this.owner[typeMin].name : '---'
          }
          // console.error("Je ne sais pas encore traiter le type '%s'", dataProp.type)
      }
      // console.log("")
      let obj = DGet(`#${fieldId}`)
      if (obj) {
        obj[domProp/*p.e. 'value' ou 'checked'*/] = value
      }
    }
  }

  /**
   * Récupère les valeurs du proprétaire dans les champs
   */
  getFormValues(){
    var newValues = {}
    for(var prop in this.constructor.properties){
      let dataProp  = this.constructor.properties[prop]
      var fieldId   = this.idFor(prop)
      var domProp   = 'value'
      var oldValue  = this.owner[prop]
      switch (dataProp.type) {
        case 'string':
        case 'number':
        case 'float':
          break;
        case 'boolean':
          domProp = 'checked'
          break;
        default:
          /* Un type propre à l'application */
          fieldId = this.idFor(dataProp.type.toLowerCase()+'Id')
          // console.error("Je ne sais pas encore traiter le type '%s'", dataProp.type)
      }
      // On prend la valeur
      value = DGet(`#${fieldId}`)[domProp/*p.e. 'value' ou 'checked'*/]
      switch (dataProp.type) {
        case 'string':
        case 'number':
          value = parseInt(value,10)
        case 'float':
          value = parseFloat(value,10)
          break;
        case 'boolean':
          value = !!value
          break;
        default:
          /* Un type propre à l'application */
          console.error("Je ne sais pas encore traiter le type '%s'", dataProp.type)
      }
      Object.assign(newValues, {[prop]: {new: value, old: oldValue}})
    }
    return newValues
  }

  /**
    Méthodes d'évènement
  **/
  onCancel(){
    this.hide()
  }
  onOk(){
    console.log("OK à traiter")
    this.hide()
  }

  /**
   * Méthode appelée quand on clique sur un bouton 'Choisir…' concernant
   * un type de propriété qui est une classe de l'application.
   */
  onChooseType(classe){
    eval(`${classe}Editor`).chooseFor(this, this.form)
  }

  /**
    Méthode de construction
  **/

  build(){
    let row_header  = DCreate('DIV',{
      class: 'header'
    , inner: [
        DCreate('DIV', {inner: `Éditeur ${this.owner.constructor.name}`})
      , DCreate('INPUT',{type:'hidden', id:this.idFor('id'), value: this.owner.id})
      ]
    })
    let row_buttons = DCreate('DIV',{
      class: 'row buttons'
    , inner: [
        DCreate('BUTTON', {id: this.buttonCancelId, class:'fleft cancel-button', inner:'Renoncer'})
      , DCreate('BUTTON', {id:this.buttonOkId, class: 'ok-button', inner:'OK'})
      ]
    })
    var innerBody
    if ( this.innerForm instanceof Function) {
      innerBody = this.innerForm()
    } else {
      alert("Une erreur est survenue. Consultez la console.")
      console.error("Il faut définir la méthode d’instance `innerForm` de %s qui doit retourner le contenu du formulaire d'édition.", this.constructor.masterClass.name)
      innerBody = '--- non défini ---'
    }
    let row_body = DCreate('DIV', {class: 'row body', inner: innerBody})

    this.form = DCreate('DIV', {
        id:this.formId
      , class:`form common-editor ${this.ownerClass} noDisplay`
      , inner: [row_header, row_body, row_buttons]
    })
    document.body.append(this.form)
    this.built = true
    this.__observe()
    if ( this.observe instanceof Function) this.observe.call(this)
  }

  /**
   * Retourne une rangée pour le type `classe` défini dans les
   * propriété du propriétaire
   */
  rowFormForType(classe) {
    var realClass
    if ('string' === typeof classe) {
      realClass = eval(classe)
    } else {
      realClass = classe
      classe    = realClass.name
    }
    return DCreate('DIV',{
      class:'external-type row'
    , inner:[
        DCreate('BUTTON', {class:'button-choose', 'data-type':classe, inner:'Choisir…'})
      , DCreate('LABEL', {inner: `${realClass.humanName} : `})
      , DCreate('SPAN', {id:`${this.idFor(classe.toLowerCase())}-name`, inner: '...'})
      , DCreate('INPUT',{type:'hidden', id:`${this.idFor(`${classe.toLowerCase()}Id`)}`})
      ]
    })
  }

  __observe(){
    const my = this
    DGet(`#${this.buttonOkId}`).addEventListener('click', my.onOk.bind(my))
    DGet(`#${this.buttonCancelId}`).addEventListener('click', my.onCancel.bind(my))
    // On doit surveiller tous les boutons "Choisir…" des types externes
    this.form.querySelectorAll('.button-choose').forEach(button => {
      var classe = button.getAttribute('data-type')
      button.addEventListener('click', my.onChooseType.bind(my, classe))
    })
  }


  get buttonOkId(){
    return this._butokid || (this._butokid = this.idFor('ok-button'))
  }
  get buttonCancelId(){
    return this._butcancid || (this._butcancid = this.idFor('cancel-button'))
  }

  /**
    Retourne l'identifiant de champ de formulaire pour la propriété
    +prop+. Ressemblera à 'travail-12-duree'
  **/
  idFor(prop){
    return `${this.ref}-${prop}`
  }

  /**
    La classe CSS propre du propriété
    Par exemple 'travail-form' si la classe du propriétaire est Travail
  **/
  get ownerClass(){
    return `${this.owner.constructor.minName}-form`
  }
  /**
    La référence unique à cet éditeur
  **/
  get ref(){
    return this._ref || (this._ref = `${this.owner.constructor.minName}-${this.owner.id}`)
  }
  get formId(){
    return this._formid || (this._formid = `${this.ref}-form`)
  }

  // Raccourci
  get listingItem(){return this.owner.listingItem}
}
