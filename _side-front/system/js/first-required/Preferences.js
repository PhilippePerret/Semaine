'use strict'
/**
  |
  | Prefs.js
  | version 1.0.0
  |
  | Note : pour les valeurs propres à l'application courante, voir
  | le fichier then-required/app/preferences.js
**/

const Prefs = {

  /**
    retourne la préférence d'identifiant +pref_id+ ou sa valeur par défaut
  **/
  get(pref_id) {
    this.loaded || this.load()
    console.log("this.app_data = ", this.app_data)
    return this.data[pref_id] || eval(this.app_data[pref_id])
  }

  /**
    Définit une préférence
  **/
, set(prefId, value) {
    this.loaded || this.load()
    Object.assign(this.data, {[prefId]: value})
    this.save.call(this)
  }

  /**
    Charge les préférences (à mettre dans la procédure d'initialisation)
  **/
, load(){
    if ( fs.existsSync(this.path) ) {
      this.data = require(this.path)
    } else {
      console.warn("Pas de fichier préférences (normal si nouvelle application)")
      this.data = {}
    }
    console.log("Prefs.data = ", this.data)
    this.loaded = true
  }


  /**
    Enregistrement du fichier des préférences de l'application
  **/
, save(){
    this.app_data || raise("Il est impératif de définir le Prefs.app_data propre à l'application.")
    for (var k in this.app_data){
      if ( undefined !== this.data[k] ) continue
      Object.assign(this.data, {[k]: this.app_data[k]})
    }
    console.log("Données préférences enregistrées : ", this.data)
    fs.writeFileSync(this.path, JSON.stringify(this.data))
  }


}
Object.defineProperties(Prefs,{
  path:{get(){
    return path.join(app.getPath('userData'), 'preferences.json')
  }}
})
