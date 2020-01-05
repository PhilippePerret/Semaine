'use strict';

String.prototype.toTitle = function(localisation/*'en', 'fr', etc.*/){
  var str = this
  return str.substring(0,1).toUpperCase() + str.substring(1,str.length).toLowerCase()
}
