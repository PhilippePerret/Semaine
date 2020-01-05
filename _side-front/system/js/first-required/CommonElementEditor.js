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

  <Objet>Editor#innerForm
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
   * Retourne la classe maitresse de cette éditor, qui correspond
   * au nom de la classe sans 'Editor'. Par exemple, la masterClass
   * de 'ProjetEditor' est 'Projet'
   */
  static get masterClass() { return eval(this.name.replace(/Editor$/,'')) }


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
      console.log("Récupération de la propriété : ", prop)
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
      var field = DGet(`#${fieldId}`)
      var value;
      // console.log("field : ", field)
      if (undefined != field) {
        value = field[domProp/*p.e. 'value' ou 'checked'*/]
      } else {
        console.warn("Le champ '%s' n'existe pas…", fieldId)
        continue;
      }

      if (value == 'undefined' || value == ''){
        value = undefined
      } else {
        switch (dataProp.type) {
          case 'string':
            break;
          case 'number':
            value = parseInt(value,10)
            break;
          case 'float':
            value = parseFloat(value,10)
            break;
          case 'boolean':
            value = !!value
            break;
          default:
            /* Un type propre à l'application */
            // La valeur doit être un entier (ID)
            value = parseInt(value,10)
            // console.error("Je ne sais pas encore traiter le type '%s'", dataProp.type)
        }
      }

      Object.assign(newValues, {[prop]: value})
    }
    return newValues
  }

  /**
    Méthodes d'évènement
  **/
  onCancel(){
    if ( this.isNew ) {
      // Il faut le retirer de la liste des items
      delete this.constructor.masterClass.items[this.id]
    }
    this.hide()
  }

  /**
   * Méthode qui enregistrer les nouvelles données
   * Peut-être que l'élément doit être créé.
   */
  onOk(){
    var newData = this.getFormValues()
    this.owner.dispatch(newData)
    this.hide()
  }

  // Retourne true si c'est un nouvel élément. Le seul moyen
  // de le savoir, pour le moment, c'est de voir s'il appartient
  // au listing NOTE : mais que faire si on ne vient pas du listing ?
  get isNew(){
    if (this.owner.isNew) {
      console.log("NOUVEL ÉLÉMENT")
    } else {
      console.log("PAS NOUVEAU")
    }
  }

  /**
   * Après une modification on actualise l'intérieur du formulaire,
   * la rangée qui contient les données propres à l'élément
   */
  updateInnerForm(){
    let body = this.form.querySelector('div.row.body')
    body.innerHTML = ''
    this.innerForm().forEach(field => body.append(field))
  }


  /**
   * Méthode appelée quand on clique sur un bouton 'Choisir…' concernant
   * un type de propriété qui est une classe de l'application.
   */
  onChooseType(classe){
    eval(`${classe}Listing`).chooseFor(this, this.form)
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
      console.error("Il faut définir la méthode d’instance `innerForm` de %s qui doit retourner le contenu du formulaire d'édition.", this.constructor.name)
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

  /**
   * Méthode utile pour construire un menu pour les jours
   * avec le titre +titre+ pour la propriété +prop+
   */
  rowFormForJour(titre, prop){
    var optionsJours = []
    for(var ijour in DATA_JOURS){
      optionsJours.push(DCreate('OPTION',{value: ijour, inner: DATA_JOURS[ijour].hname}))
    }
    return DCreate('DIV',{
        class:'row'
      , inner: [
          DCreate('SPAN', {inner: titre})
        , DCreate('SELECT', {id:this.idFor(prop), inner:optionsJours})
      ]
    })
  }
  /**
   * Méthode utile pour construire un menu heure de titre
   * +titre+ pour la propriété +prop+
   */
  rowFormForHour(titre, prop){
    var selectOptions = []
    for(var i = HEURE_START; i <= HEURE_END; ++i ){
      var iNum = parseFloat(i,10)
      var heure = String(i).padStart(2,'0')
      selectOptions.push(DCreate('OPTION',{value:iNum,      inner: `${heure}:00`}))
      selectOptions.push(DCreate('OPTION',{value:iNum+0.25, inner: `${heure}:15`}))
      selectOptions.push(DCreate('OPTION',{value:iNum+0.5,  inner: `${heure}:30`}))
      selectOptions.push(DCreate('OPTION',{value:iNum+0.75, inner: `${heure}:45`}))
    }
    return DCreate('DIV', {
      class: 'row'
    , inner: [
          DCreate('SPAN', {inner:`${titre} : `})
        , DCreate('SELECT', {id:this.idFor(prop), class:'heure', inner: selectOptions})
      ]
    })
  }

  /**
   * Méthode utile pour construire un menu durée de titre
   * +titre+ pour la propriété +prop+
   */
  rowFormForDuree(titre, prop){
    var selectOptions = []
    for(var i = 0; i < 6 ; ++i){
      var iNum = parseFloat(i,10)
      var heure = String(i).padStart(2,'0')
      i > 0 && selectOptions.push(DCreate('OPTION',{value:iNum, inner:`${heure}:00`}))
      selectOptions.push(DCreate('OPTION',{value:iNum + 0.25,inner:`${heure}:15`}))
      selectOptions.push(DCreate('OPTION',{value:iNum + 0.5,inner:`${heure}:30`}))
      selectOptions.push(DCreate('OPTION',{value:iNum + 0.75,inner:`${heure}:45`}))
    }
    return DCreate('DIV', {
      class: 'row'
    , inner: [
          DCreate('SPAN', {inner:`${titre} : `})
        , DCreate('SELECT', {id:this.idFor(prop), class:'heure', inner: selectOptions})
      ]
    })
  }

  rowFormForAssociateColor(propFTcolor, propBGcolor){
    var spanDemoId = this.idFor(`propColor-demo`)
    var hiddenFTvalueField = this.idFor(propFTcolor)
    var hiddenBGvalueField = this.idFor(propBGcolor)
    return DCreate('DIV',{
        class: 'row row-color right'
      , inner: [
          DCreate('INPUT',{type:'hidden', id:hiddenFTvalueField, value: this.owner.ftcolor})
        , DCreate('INPUT',{type:'hidden', id:hiddenBGvalueField, value: this.owner.bgcolor})
        , DCreate('DIV', {id:spanDemoId, class:'acolorpicker-demo', inner: "Pour voir les couleurs fond/font", style:`background-color:${this.owner.bgcolor||'white'};color:${this.owner.ftcolor||'black'};`})
        , DCreate('BUTTON', {type:'button', class:'acolorpicker-button', 'data-span':spanDemoId, 'data-ft-hidden':hiddenFTvalueField, 'data-bg-hidden':hiddenBGvalueField, inner: 'Pick…'})

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

    this.form.querySelectorAll('.acolorpicker-button').forEach(button => {
      button.addEventListener('click', UI.pickColorFor.bind(UI, button))
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
  get ref(){ return this.owner.ref }

  get formId(){
    return this._formid || (this._formid = `${this.ref}-form`)
  }
}
