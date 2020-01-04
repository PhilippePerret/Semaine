'use strict'
/**
  Méthode pour faciliter le travail de choix des dossiers et des fichiers


  chooseFile(<params>)    => {String} Retourne LE fichier choisi
  chooseFiles(<params>)   => {Array}  Retourne une liste de fichiers
  chooseFolder(<params>)  => {String} Retourne LE dossier choisi
  chooseFolders(<params>) => {Array}  Retourne la liste des dossiers choisis
**/


const Dialog = remote.dialog

/** ---------------------------------------------------------------------
  *   Méthode pour choisir un fichier (pas un dossier)
  *
  * @param params {Hash} Paramètres (aucun n'est obligatoire)
  *   :message      {String} Le message d'invite
  *   :folder       {String} Le dossier de départ
  *   :extensions   {Array} Liste des extensions acceptées (sans points)
  *   :title        {String} Titre de la fenêtre
  *   :multiple     {Boolean} Si true, on peut en choisir plusieurs
  *   :hiddens      {Boolean} Si true, on montre les fichiers cachés
  *
*** --------------------------------------------------------------------- */
const chooseFiles = function(params){
  if(undefined===params)params={}
  params.properties || Object.assign(params,{properties:[]})
  params.properties.push('multiSelections')
  return chooseFile(params)
}

const chooseFile = function(params){
  if(undefined===params)params={}
  params.message  || Object.assign(params,{message:"Choisir le fichier…"})
  params.title    || Object.assign(params,{title:""})
  params.folder   && Object.assign(params,{defaultPath:params.folder})
  if (params.extensions) {
    params.filters || Object.assign(params, {filters:{name:'Fichiers',extensions:[]}})
    params.filters.extensions = params.extensions
  }
  params.properties || Object.assign(params,{properties:[]})
  params.properties.push('openFile')
  params.multiple   && params.properties.push('multiSelections')
  params.hiddens    && params.properties.push('showHiddenFiles')
  params.properties.push('createDirectory')

  var res = Dialog.showOpenDialogSync(params)

  if ( !res ) {
    return
  } else if (params.properties.indexOf('multiSelections')>-1) {
    return res
  } else {
    return res[0]
  }
}

const chooseFolders = function(params){
  if(undefined===params)params={}
  params.properties || Object.assign(params,{properties:[]})
  params.properties.push('multiSelections')
  return chooseFolder(params)
}
const chooseFolder = function(params){
  if(undefined===params)params={}
  params.message  || Object.assign(params,{message:"Choisir le dossier…"})
  params.title    || Object.assign(params,{title:""})
  params.folder   && Object.assign(params,{defaultPath:params.folder})
  params.properties || Object.assign(params,{properties:[]})
  params.properties.push('openDirectory')
  params.multiple   && params.properties.push('multiSelections')
  var res = Dialog.showOpenDialogSync(params)
  if ( !res ) {
    return
  } else if (params.properties.indexOf('multiSelections')>-1) {
    return res
  } else {
    return res[0]
  }
}
