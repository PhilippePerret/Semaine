'use strict';
/**
  Locales.js

  Version 0.2.1
  -------------
  # 0.2.1
      Remplacement des retours chariots par des <br>
  # 0.2.0
      Tout est mis dans ce module.
  # 0.1.3
    Définitionss mises dans le dossier locales
    ./_site-front/app/locales/$LANG/data.yaml

**/
function loc(message_id, params) {
  var dmessage = message_id.split('.')
  var message = TEXT
  var dom ;
  while ( dom = dmessage.shift() ){
    message = message[dom]
  }
  message = message.replace(/\n/g,'<br>')
  if ( params ) {
    for(var k in params){
      var reg = new RegExp(`\\\$\\\{${k}\\\}`, 'g')
      message = message.replace(reg, params[k])
    }
  }
  return message
}
window.LANG = 'fr'
const TEXT = YAML.safeLoad(fs.readFileSync(`./_side-front/app/locales/${LANG}/data.yaml`,'utf8'))
