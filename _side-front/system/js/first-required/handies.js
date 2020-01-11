'use strict'
/**
  Quelques méthodes pratiques

  # version 0.1.3
    + Méthode 'unless'

  Historique
  ----------
  # version 0.1.2
    Méthode raise
**/
// Pour pouvoir utiliser par exemple 'correct || raise("Ça n’est pas correct")'
function raise(msgErr) {
  throw new Error(msgErr)
}

function stopEvent(ev){
  ev.preventDefault()
  ev.stopPropagation()
  return false
}

function unless(condition, fnc){
  if ( condition ) return ;
  return fnc.call()
}
