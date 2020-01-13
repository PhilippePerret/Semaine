'use strict';
/** ---------------------------------------------------------------------
  Class ProjectOpener
  -------------------
  Gestion de l'ouverture des projets

*** --------------------------------------------------------------------- */
class ProjectOpener {
  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  static get(item_id){
    if (undefined === this.items) this.items = new Map()
    return this.items.get(item_id)
  }

  static defineFor(editor){
    console.log("editor = ", editor)
    console.log("editor.form = ", editor.form)
    console.log("editor.owner = ", editor.owner)
    const opener = new ProjectOpener(editor.owner, editor.form)
    opener.edit()
  }

  static get humanData(){
    return this._humandata || (this._humandata = {
        name:       'Ouverture'
      , nameMin:    'ouverture'
      , plurial:    'Ouvertures'
      , plurialMin: 'ouvertures'
    })
  }

  static get minName(){return 'projectopener'}


  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(projet, form){
    this.projet       = projet
    this.projectForm  = form
  }

  /**
   * Pour éditer l'opener
  **/
  edit(){
    this.build()
    this.setDataForm()
  }

  /**
    Méthode appelée quand on veut choisir un dossier ou un fichier à ouvrir
  **/
  onChoose(datafor, ev){
    var choix ;
    switch(datafor){
      case 'fichier':
        choix = chooseFile({title:'Ouvrir le fichier…', message:'Fichier du projet à ouvrir :'})
        this.setFichier(choix)
        break;
      case 'dossier':
        choix = chooseFolder({title:'Ouvrir le dossier…', message:'Dossier du projet à ouvrir :'})
        this.setDossier(choix)
        break;
    }
    return stopEvent(ev)
  }

  onOK(ev){
    this.getDataForm()
    this.setDataInProjectEditor()
    this.remove()
    return stopEvent(ev)
  }

  onCancel(ev){
    this.remove()
    return stopEvent(ev)
  }

  setDataInProjectEditor(){
    this.projectField.value = JSON.stringify(this.data)
  }
  getDataFromProjectEditor(){
    var currentValue = nullIfEmpty(this.projectField.value)
    if ( currentValue ) {
      this.data = JSON.parse(currentValue)
    } else {
      this.data = {dossier:null,fichier:null,code:null}
    }
  }

  get projectField(){
    return this._projectfield || (this._projectfield = DGet(`#${this.projectFieldId}`))
  }
  get projectFieldId(){
    return this._projectfieldid || (this._projectfieldid = `projet-${this.projet.id}-projectopener`)
  }


  /**
    Retourne les valeurs définies
  **/
  getDataForm(){
    this.data = {
        dossier:  DGetValue('.dossier-value',this.obj)
      , fichier:  DGetValue('.fichier-value',this.obj)
      , code:     DGetValue('.code-value',this.obj)
    }
  }
  /**
    Dépose les valeurs dans le formulaire
  **/
  setDataForm(){
    // On prend les données déjà définies (la méthode renseigne this.data)
    this.getDataFromProjectEditor()
    // Les valeurs dans les champs cachés
    this.setFichier(this.data.fichier)
    this.setDossier(this.data.dossier)
    this.setCode(this.data.code)
  }

  /**
    Définit entièrement le fichier et le dossier
      - valeur dans this.data
      - champ hidden
      - affichage du nom
  **/
  setFichier(pth){
    this.data.fichier = pth
    DSetValue('.fichier-value',this.obj, pth || '')
    this.showFichierName()
  }
  setDossier(pth){
    // console.log("dossier mis à ", pth)
    this.data.dossier = pth
    DSetValue('.dossier-value',this.obj, pth || '')
    this.showDossierName()
  }
  setCode(code){
    this.data.code = code
    DSetValue('.code-value',this.obj, this.data.code)
  }

  showFichierName(){
    DGet('.fichier-name', this.obj).innerHTML = this.data.fichier ? path.basename(this.data.fichier) : '---'
  }
  showDossierName(){
    DGet('.dossier-name', this.obj).innerHTML = this.data.dossier ? path.basename(this.data.dossier) : '---'
  }

  /**
    * Pour construire le formulaire d'édition
  **/
  build(){
    this.obj = DCreate('DIV', {class:'form common-editor', inner:[
        DCreate('DIV', {class:'header', inner:`Ouverture de projet<br>“${this.projet.name}”`})
      , DCreate('DIV', {class:'row', inner:[
              DCreate('BUTTON', {type:'button', class:'button-choose small fright', 'data-for': 'dossier', inner:'Choisir…'})
            , DCreate('LABEL', {inner:'Dossier : '})
            , DCreate('SPAN', {inner:'---', class:'dossier-name'})
            , DCreate('INPUT', {type:'hidden', class:'dossier-value'})
          ]
        })
      , DCreate('DIV', {class:'row', inner:[
              DCreate('BUTTON', {type:'button', class:'button-choose small fright', 'data-for': 'fichier', inner:'Choisir…'})
            , DCreate('LABEL', {inner:'Fichier : '})
            , DCreate('SPAN', {inner:'---', class:'fichier-name'})
            , DCreate('INPUT', {type:'hidden', class:'fichier-value'})
          ]
        })
      , DCreate('DIV', {class:'row', inner:[
              DCreate('LABEL', {inner:'Code à jouer : '})
            , DCreate('INPUT', {type:'text', class:'code-value', placeholder:'Code à jouer'})
          ]
        })
      , DCreate('DIV', {
            class:'row buttons'
          , inner:[
                DCreate('BUTTON',{type:'button', class:'button-cancel fleft', inner:'Renoncer'})
              , DCreate('BUTTON',{type:'button', class:'button-ok', inner:'OK'})
            ]
        })
    ]})
    document.body.append(this.obj)
    this.observe()
  }

  remove(){
    this.unobserve()
    this.obj.remove()
  }
  observe(){
    this.buttonOK.addEventListener('click', this.onOK.bind(this))
    this.buttonCancel.addEventListener('click', this.onCancel.bind(this))
    this.obj.querySelectorAll('.button-choose').forEach(button => {
      let dataFor = button.getAttribute('data-for')
      button.addEventListener('click', this.onChoose.bind(this,dataFor))
    })
  }
  unobserve(){
    this.buttonOK.removeEventListener('click', this.onOK.bind(this))
    this.buttonCancel.removeEventListener('click', this.onCancel.bind(this))
  }

  get buttonOK(){
    return this._btnok || (this._btnok = DGet('.button-ok',this.obj))
  }
  get buttonCancel(){
    return this._btncancel||(this._btncancel = DGet('.button-cancel',this.obj))
  }
}
