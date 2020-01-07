'use strict'

// Pour pouvoir utiliser par exemple 'correct || raise("Ça n’est pas correct")'
function raise(msgErr) {
  throw new Error(msgErr)
}

function stopEvent(ev){
  ev.preventDefault()
  ev.stopPropagation()
  return false
}
