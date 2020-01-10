'use strict'
/**
  Définition des locales
**/
window.LANG = 'fr'
const TEXT = YAML.safeLoad(fs.readFileSync(`./_side-front/app/locales/${LANG}/data.yaml`,'utf8'))
console.log("TEXT = ", TEXT)
