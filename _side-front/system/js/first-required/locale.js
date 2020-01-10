'use strict'
/**
  Version 0.1.3

  # 0.1.3
    Définitionss mises dans le dossier locales
    ./_site-front/app/locales/$LANG/data.yaml

**/
function locale(message_id, params) {
  var dmessage = message_id.split('.')
  var message = TEXT
  var dom ;
  while ( dom = dmessage.shift() ){ message = message[dom] }
  if ( params ) {
    for(var k in params){
      var reg = new RegExp(`\\\$\\\{${k}\\\}`, 'g')
      message = message.replace(reg, params[k])
    }
  }
  return message
}
