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
    this.build()
    this.form.classList.remove('noDisplay')
    // On le place à l'endroit voulu si défini
    if (options && (options.x || options.left)) {
      this.form.style.top   = `${options.y||options.top}px`
      this.form.style.left  = `${options.x||options.left}px`
    }
    // On charge les valeurs
    if (!(options && options.dontFill)) this.setFormValues()
    // On observe le formulaire seulement ici, car on peut observer des
    // valeurs comme par exemple les noms des catégories, couleurs, etc.
    this.__observe()
  }

  hide(){
    console.error("OBSOLÈTE : il faut toujours détruire la fenêtre maintenant")
    this.form.classList.add('noDisplay')
  }

  remove(){
    this.form.remove()
    delete this.owner.editor
  }

  /**
    Méthodes de données
  **/

  /**
    Met les valeurs du propriétaire dans les champs
  **/
  setFormValues(){
    X(2,'-> CommonElementEditor#setFormValues', {this:this})
    for(var prop in this.constructor.properties){
      X(5, `[setFormValues] Traitement de la propriété ${prop}`)
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
          // Les valeurs qui seront utiles
          // -----------------------------
          const classe = eval(dataProp.type)
          /* pe. 'categorie' */
          const classMin = classe.minName
          // L'identifiant du champ, p.e. "travail-12-categorie"
          fieldId = this.idFor(prop)
          // ID du champ pour le Nom (valeur affichée) pe 'travail-12-categorie-name'
          const fieldNameId = this.idFor(`${classMin}-name`)
          // Champ pour le nom affiché
          const nameField = DGet(`#${fieldNameId}`)

          // Nom à afficher
          // Le second argument de `getNameFor` indique qu'on peut utiliser
          // une valeur héritée
          let displayedName = this.owner.geWatchedNameFor(classe, true) ;
          // const displayedName = this.owner.getNameFor(classe, true) ;

          // Mise en forme différente suivant qu'il s'agisse d'une propriété
          // héritée ou non
          if ( displayedName ) {
            if ( this.owner.isHeritedFor(classe) ) {
              displayedName = DCreate('SPAN',{class:'discret italic',inner:[displayedName]})
            } else {
              // Il faut mettre un bouton pour supprimer le lien

            }

            // On opère que s'il y a un champ pour le nom
            // DGet(`#${fieldNameId}`) && displayedName && ( nameField.innerHTML = displayedName )
            if (DGet(`#${fieldNameId}`)) {
              nameField.innerHTML = '';
              nameField.append(displayedName)
            }
          } // fin de s'il y a un nom à afficher

          X(8,"setFormValues (pour classe propre)", {this:this, prop:prop, value:value, displayedName:displayedName, classMin:classMin, fieldId:fieldId, fieldNameId:fieldNameId, nameField:nameField})

      }
      let obj = DGet(`#${fieldId}`)
      obj && value && (obj[domProp /* 'value' ou 'checked' */] = value)
    } // Fin de la boucle for

    X().unsetMaxLevel()
  }


  /**
   * Récupère les valeurs du proprétaire dans les champs
   */
  getFormValues(){
    var newValues = {}
    for(var prop in this.constructor.properties){
      // console.log("Récupération de la propriété : ", prop)
      let dataProp  = this.constructor.properties[prop]
      var fieldId   = this.idFor(prop)
      var domProp   = 'value'
      var oldValue  = this.owner[`_${prop}`]
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
          // fieldId = this.idFor(dataProp.type.toLowerCase()+'Id')
          fieldId = this.idFor(prop)
          // console.error("Je ne sais pas encore traiter le type '%s'", dataProp.type)
      }
      // On prend la valeur
      var field = DGet(`#${fieldId}`);
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
      // Une toute dernière vérification
      if (value === 'undefined') value = null ;

      Object.assign(newValues, {[prop]: value})
    }
    return newValues
  }

  /**
    Méthode qui valide (ou non) les données en fonction du validateur
    défini pour chaque propriété (dans la propriété `properties` des classes
    d'éditeur).
    Une propriété à valider doit définir un attribut
        validator
    qui peut être soit un objet soit un string
    • Quand c'est un string, c'est le nom d'une méthode de l'éditor qui doit
    retourner true en cas de validation correcte ou raiser le corps du message.
    d'erreur en cas de problème. La méthode est appelée avec en premier argument
    la valeur de la propriété et en second argument toutes les autres données
    (qui peuvent être utiles).
    • Quand `validator` est un object, il peut contenir ces définitions :
        required    Si true, une valeur est absolument requise
        uniq        Si true, la valeur doit être unique
        minLength   Si défini, doit donner la longueur minimale de value
        maxLength   Si défini, doit donner la longueur maximale de value
        not         Si défini, ne doit pas être cette valeur (utile pour éviter
                    par exemple la première valeur d'un menu)
  **/
  async validateFormValues(data){
    for(var prop in data){
      var propIsOk = await this.validateFormValue(prop, data[prop], data)
      if ( !propIsOk ) return false
    }
    return true ;// tout est OK
  }
  async validateFormValue(prop, value, data){
    try {
      const vd = this.constructor.properties[prop].validator
      if (undefined === vd) return true ;
      if ('string' == typeof vd) {
        // <= La validation est un string
        // => C'est une méthode propre qu'il faut appeler pour valider
        this[vd].call(this,value,data)
      } else {
        (vd.required  && undefined !== value) || raise("doit absolument être définie.")
        const same = this.findSameAs(prop,value)
        vd.uniq       && same && raise(`doit être unique (l'élément #${same.id} possède cette valeur).`)
        vd.minLength  && value.length < vd.minLength && raise(`doit faire au moins ${vd.minLength} caractères.`)
        vd.maxLength  && value.length > vd.maxLength && raise(`ne doit pas faire plus de ${vd.maxLength} caractères.`)
        vd.not        && value == vd.not && raise(`ne doit pas avoir la valeur '${vd.not}'`)
      }
      return true
    } catch (e) {
      const dataProp = this.constructor.properties[prop]
      let Le;
      if (dataProp.le) {Le = dataProp.le.toUpperCase()} else {Le = dataProp.feminin?'La ':'Le '}
      await error(`${Le}${dataProp.hname} ${e}`)
      return false
    }
  }

  /**
    - méthode de validation -
    Retourne false si on a pas trouver la valeur +value+ pour la propriété
    +prop+ ou l'instance dans le cas contraire.
  **/
  findSameAs(prop,value){
    var found = undefined ;
    value = value.toLowerCase()
    this.constructor.masterClass.forEach( item => {
      if ( item[prop].toLowerCase() == value && item.id != this.owner.id ) {
        found = item
        return false
      }
    })
    return found
  }

  /**
    / Fin des méthodes de validations
  **/

  /**
    Méthodes d'évènement
  **/
  onCancel(){
    if ( this.isNew ) {
      // Il faut le retirer de la liste des items
      delete this.constructor.masterClass.items[this.id]
    }
    this.remove()
  }

  /**
   * Méthode qui enregistrer les nouvelles données
   * Peut-être que l'élément doit être créé.
   */
  async onOk(){
    var newData = this.getFormValues()
    var newDataAreOk = await this.validateFormValues(newData)
    if ( newDataAreOk ){
      this.owner.dispatch(newData)
      this.remove()
    }
  }

  // Retourne true si c'est un nouvel élément. Le seul moyen
  // de le savoir, pour le moment, c'est de voir s'il appartient
  // au listing NOTE : mais que faire si on ne vient pas du listing ?
  get isNew(){
    if (this.owner.isNew) {
      return true
    } else {
      return false
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
    Méthode appelée quand on clique sur le bouton 'x' pour supprimer
    le lien avec une catégorie, une couleur, etc.

    +Params+::
      +class+::[String] La classe de l'élément associé, par exemple 'Categorie',
                        'AssociateColor' ou 'Domaine'
  **/
  onUnlinkType(classe){
    const prop = `${classe.toLowerCase()}Id`
    this.unsetLinkTo(classe)
    this.owner.set(prop) // undefined
  }

  setLinkTo(classe, objet){
    this.defineLinkTo(classe, objet)
  }
  unsetLinkTo(classe) {
    this.defineLinkTo(classe, undefined)
  }
  defineLinkTo(classe, objet){
    // var propId = `${this.owner.owner.ref}-${this.masterClass.minName}Id`
    let realClass ;
    if('string' === typeof classe){
      realClass = eval(classe)
    } else {
      realClass = classe
      classe = String(realClass.name)
    }
    var propId = `${this.owner.ref}-${realClass.minName}Id`
    var propNameId = `${this.owner.ref}-${realClass.minName}-name`
    this.form.querySelector(`#${propId}`).value = objet ? objet.id : '' ;
    this.form.querySelector(`#${propNameId}`).innerHTML = objet ? objet.name : '---'
    this.form.querySelector(`.unlink-${classe}`).classList[objet?'remove':'add']('hidden')
  }

  /**
    Méthode de construction
  **/

  get ownerHumanName(){
    return this.owner.constructor.humanData.name || this.owner.constructor.name
  }

  build(){
    let row_header  = DCreate('DIV',{
      class: 'header'
    , inner: [
        DCreate('DIV', {inner: `Éditeur ${this.ownerHumanName} #${this.owner.id}`})
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
  }

  /**
   * Retourne une rangée pour le type `classe` défini dans les
   * properties du propriétaire. Par exemple categorieId, etc.
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
      , DCreate('LABEL', {inner: `${realClass.humanData.name} : `})
      , DCreate('SPAN', {id:`${this.idFor(classe.toLowerCase())}-name`, inner: '...'})
      , DCreate('SPAN', {inner:'×', class:`button-unlink unlink-${classe} hidden`, 'data-type':classe})
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
    for(var ijour in SmartDay.DATA_JOURS){
      optionsJours.push(DCreate('OPTION',{value: ijour, inner: SmartDay.DATA_JOURS[ijour].hname}))
    }
    return DCreate('DIV',{
        class:'row'
      , inner: [
          DCreate('SPAN', {inner: `${titre} : `})
        , DCreate('SELECT', {id:this.idFor(prop), class:'auto', inner:optionsJours})
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
    this.form.querySelectorAll('.button-unlink').forEach(button => {
      var classe = button.getAttribute('data-type')
      button.addEventListener('click', my.onUnlinkType.bind(my, classe))
    })

    this.form.querySelectorAll('.acolorpicker-button').forEach(button => {
      button.addEventListener('click', UI.pickColorFor.bind(UI, button))
    })

    // Les "names watchés"
    this.form.querySelectorAll('span[watched-element="true"]').forEach(span=>{
      var classe = span.getAttribute('data-classe')
      var id = span.getAttribute('data-id')
      var element = eval(classe).get(id)
      span.addEventListener('click', element.edit.bind(element))
    })

    // Si la classe héritée possède une méthode d'observation, on l'appelle
    if ( this.observe instanceof Function) this.observe.call(this)

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
