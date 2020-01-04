'use strict'

const path      = require('path')
    , fs        = require('fs')
    , {remote}  = require('electron')


window.onerror = function(err, url, line){
  alert("Une erreur est survenue : " + err + "\n\nConsulter la console (ALT+CMD+i) pour le détail.")
  console.log("# ERREUR :", err, url, line)
}
