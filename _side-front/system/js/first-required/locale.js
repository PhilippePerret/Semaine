'use strict'

function locale(message_id, params){
  var message = TEXT[message_id]
  if (params) {
    for(var k in params){
      var reg = new RegExp(`\\\$\\\{${k}\\\}`, 'g')
      message = message.replace(reg, params[k])
    }
  }
  return message
}
