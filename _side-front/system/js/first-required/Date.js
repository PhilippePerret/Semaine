'use strict'
/**
  Extension de la classe Date
**/

Date.prototype.addDays = function(nombreJours) {
  let d = new Date(this.valueOf());
  d.setDate(d.getDate() + nombreJours);
  return d;
}
