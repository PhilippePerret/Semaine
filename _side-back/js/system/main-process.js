'use strict'

const path  = require('path')
const fs    = require('fs')
const {app} = require('electron')
const glob  = require('glob')

/**
  Fichier principal du main-process
  Tous les fichiers dans ce dossier seront automatiquement chargés.
**/

global.MainBuild = {
  /**
    Méthode qui construit le fichier _site-front/main.html avec toutes les
    balise css et script requises.
    Sans faire ça, l'application packagée ne les comprend pas.
  **/
  build(){
    this.buildJSTags()
    this.buildCSSTags()
    let code = fs.readFileSync(this.mainHtmlTemplatePath,'utf-8')
    code = code
      .replace(/__CSS__/, this.CSSTags.join("\n"))
      .replace(/__SCRIPTS__/, this.JSTags.join("\n"))
      .replace(/__WARNING__/, this.WarningDontTouch)
    fs.writeFileSync(this.mainHtmlPath, code)
  }

, buildJSTags(){
    this.JSTags = []
    for ( var relative of ['first-required', 'then-required'] ){
      this.buildJSTagsOfFolder(this.pathOf(`_side-front/system/js/${relative}`))
      this.buildJSTagsOfFolder(this.pathOf(`_side-front/app/js/${relative}`))
    }
  }
, buildCSSTags(){
    this.CSSTags = []
    this.buildCSSTagsOfFolder(this.pathOf('_side-front/system/css'))
    this.buildCSSTagsOfFolder(this.pathOf('_side-front/app/css'))
  }

, buildJSTagsOfFolder(folder){
    let files = this.filesOfFolder(folder,'js')
    files.forEach( file => this.JSTags.push(this.buildTag(file,'js')))
  }

, buildCSSTagsOfFolder(folder){
    let files = this.filesOfFolder(folder,'css')
    files.forEach( file => this.CSSTags.push(this.buildTag(file,'css')))
  }

, filesOfFolder(folder, tag){
    return glob.sync(`${folder}/**/*.${tag}`)
  }

, buildTag(path, tag){
    path = path.replace(this.appFolder+'/_side-front/','')
    var id = 'stylesheet_' + path.replace(/\//g,'_')
                  .replace(/_+/g,'_')
                  .replace(/^(css|js)_/,'')
                  .replace(/\.(css|js)$/,'')
    if ( tag == 'js' ) {
      return `<script type="text/javascript" src="${path}" id="${id}"></script>`
    } else {
      return `<link rel="stylesheet" href="${path}" id="${id}" />`
    }
  }

, pathOf(relpath){
    return path.join(this.appFolder,relpath)
  }
}
Object.defineProperties(MainBuild,{
  mainHtmlPath:{get(){return this.pathOf('_side-front/xmain.html')}}
, mainHtmlTemplatePath:{get(){return this.pathOf('_side-front/app/main-template.html')}}
, cssFolder:{get(){return this.pathOf('_side-front/css')}}
, jsFolder:{get(){return this.pathOf('_side-front/js')}}
, appFolder:{get(){return this._appfolder || (this._appfolder = app.getAppPath())}}
, WarningDontTouch:{get(){
  return `<!--

    *************************************
    !!! NE PAS MODIFIER CE FICHIER !!!
    (cf. le manuel pour modifier la page)
    *************************************

  -->`
}}
})
