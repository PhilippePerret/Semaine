const App = {
  async init(){

    /**
      NIveau de débuggage
    **/
    Debug.maxLevel = 5;

    UI.init()
    // Appeler la méthode 'onInit' si elle existe
    if ( 'function' === typeof this.onInit ) {
      this.onInit.call(this)
    }


  }

  /**
    Chargement du module d'affixe +moduleName+
    Attention : j'ai l'impression que ça ne fonctionne pas avec l'application
    construite, qu'il faudrait autre chose pour que ce dossier soit copié
  **/
, requireModule(moduleName){
  return require(path.join(this.modulesFolder,`${moduleName}.js`))
}

}
Object.defineProperties(App,{

  // Le dossier $HOME de l'utilisateur courant
  homeDirectory:{get(){
    if (undefined === this._homedirectory){
      this._homedirectory = require('os').homedir();
    } return this._homedirectory
  }}
, userDataFolder:{get(){return app.getPath('userData')}}
, Prefs:{get(){return Prefs}}
, modulesFolder:{get(){
    return this._modulesfolder || (this._modulesfolder = path.join(app.getAppPath(),'_side-front','app','js','modules'))
  }}

})
