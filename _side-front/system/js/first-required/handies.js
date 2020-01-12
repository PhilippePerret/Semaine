'use strict'
/**
  Quelques méthodes pratiques

  # version 0.1.4

  Historique
  ----------
  # version 0.1.4
    + Méthode 'raise_backtrace'
  # version 0.1.3
    + Méthode 'unless'
  # version 0.1.2
    Méthode raise
**/
// Pour pouvoir utiliser par exemple 'correct || raise("Ça n’est pas correct")'
function raise(msgErr) {
  throw new Error(msgErr)
}

function raise_backtrace(msg) {
  try {
    throw new Error("Pour voir le backtrace")
  } catch (err) {
    console.error(`${msg} [Pour voir le backtrace]`)
    console.log(err.stack)
  }
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
