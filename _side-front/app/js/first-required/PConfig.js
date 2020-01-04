'use strict'


/**
  Définition des configurations (options) de l'application
**/
const APP_DATA_CONFIG = {
  configExemple:{
      hname: "Exemple de config"
    , type: 'boolean'
    , value: true
  }
}

if ('undefined' == typeof(window.DATA_MINI_AIDE)){window.DATA_MINI_AIDE = {}}
Object.assign(DATA_MINI_AIDE,{
  configExemple: {
      title:'Exemple de config'
    , content:"La description de la config peut être mise ici. Elle apparaitra au click sur le ?"
  }

})
