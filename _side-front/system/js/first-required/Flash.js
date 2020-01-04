'use strict'
/**
  Pour les messages
**/
const Flash = {
  name: 'Flash/F'
  /**
    Pour afficher le message +msg+ dans le pied de page

    Si options.start est true, on lance un timer d'intervalle en attendant
    l'appel de Flash.stop([message optionnel]) qui va interrompre la boucle
    d'attente
  **/
, show(msg, css, options){
    this.domObj.innerHTML = msg
    this.domObj.className = css
    options && options.start && this.startWaitingLoop()
  }
, warn(msg, options){
    this.show(msg, 'warning', options)
  }
, notice(msg, options){
    this.show(msg, 'notice', options)
  }
, action(msg, options){
    this.show(msg, 'green', options)
  }

, startWaitingLoop(){
    this.initialMsg = this.domObj.innerHTML
    this.asterCount = 0
    this.loopTimer  = setInterval(this.loop.bind(this), 500)
  }
, loop(){
    ++ this.asterCount
    if ( this.asterCount > 15 ) {
      this.asterCount = 1
      this.domObj.innerHTML = this.initialMsg
    }
    this.domObj.insertAdjacentHTML('beforeend', '*')
  }
, stop(msg){
    clearInterval(this.loopTimer)
    this.loopTimer = null
    delete this.loopTimer
    this.show(msg || '---')
  }

}
Object.defineProperties(Flash,{
  domObj:{get(){return document.querySelector('#footer #message')}}
})

const F = Flash
