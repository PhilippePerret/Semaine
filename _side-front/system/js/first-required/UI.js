'use strict'

const UI = {

  init(){
    this.setDimensions()
  }

, setDimensions(){
    const my = this
        , hwindow = this.UI_HEIGHT
        // , hheader = UI.header.offsetHeight
        , hfooter = UI.footer.offsetHeight
        // , innerHeight = `${hwindow - (hheader + hfooter)}px`

  }


  /**
    Affiche un message
    @param {String} msg   Le message à afficher
    @param {Hash|String}  options   Les options ou le style
                          keep:     Si true, on ne fait pas disparaitre le message
                          style:    Le style, 'notice', 'neutre' ou 'warning'
                          replace:  Si true, le texte précédente est effacé et
                                    remplacé par celui-là
                          waiter:   Si true, un "waiter" est placé devant le message
  **/
, flash(msg, options){
    const my = this
    if ( 'string' === typeof options ) options = {style:options}
    else { options = options || {} }
    if ( options.waiter ) msg = `${HORLOGE_ATTENTE} ${msg}`
    // Si un timer de destruction est en route, il faut l'interrompre
    my.flashTimer && this.clearFlashTimer()
    let divFlash = document.querySelector('#flash')
    if ( options.replace && divFlash ){
      divFlash.remove()
      divFlash = undefined
    }
    divFlash || (divFlash = DCreate('DIV',{id:'flash'}))
    msg = msg.replace(/\n/g,'<br>')
    let divMsg   = DCreate('DIV',{class:options.style||'notice', text:msg})
    divFlash.append(divMsg)
    document.body.append(divFlash)
    // Sauf si l'option 'keep' est activée, il faudra supprimer le message
    // au bout d'un certain temps
    if ( !options.keep ) {
      let nombre_mots = msg.split(' ').length
      if ( nombre_mots < 6 ) nombre_mots = 6
      let laps = 1000 * ( nombre_mots / 1.5 )
      my.flashTimer = setTimeout(()=>{
        let flash = document.querySelector('#flash')
        flash.classList.add('vanish')
        my.clearFlashTimer()
        my.flashTimer = setTimeout(()=>{
          my.clearFlashTimer()
          flash.remove()
        }, laps + 5000)
      }, laps)
    }
  }

, clearFlashTimer(){
    const my = this
    clearTimeout(my.flashTimer)
    my.flashTimer = null
    document.querySelector('#flash').classList.remove('vanish')
  }

  /**
    Rend visible l'élément +o+ {HTMLElement} dans son parent
  **/
, rendVisible(o) {
    let parent = o.parentNode

    let pBounds = parent.getBoundingClientRect()
      , parentStyle = window.getComputedStyle(parent)
      , oneTiers = pBounds.height / 3
      , twoTiers = 2 * oneTiers

    var h = {
          pBounds: pBounds
        , pHeight: pBounds.height
        , pBorderTop: parseInt(parentStyle['borderTopWidth'],10)
        , pPaddingTop: parseInt(parentStyle['paddingTop'],10)
        , oneTiers: oneTiers
        , twoTiers: twoTiers
    }
    h.soust = h.pBorderTop + h.pPaddingTop

    let oBounds = o.getBoundingClientRect()

    // let oTop =  oBounds.top - (pBounds.top + soust)
    let oTop    = o.offsetTop - h.soust
      , pScroll = parent.scrollTop
      , oSpace  = {from:oTop, to: oTop + oBounds.height}
      , pSpace  = {from:pScroll, to:h.pHeight + pScroll}

    // console.log({
    //   oBounds: oBounds
    // , hdata: h
    // , oSpace: oSpace
    // , pSpace: pSpace
    // })

    if ( oSpace.from < pSpace.from || oSpace.to > pSpace.to ) {
      var tscrol
      if ( oSpace.from < pSpace.from ) {
      //   // <= On est en train de monter et l'item se trouve au-dessus
      //   // => Il faut placer l'item en bas
      //   tscroll = oSpace.from + pBounds.height - oBounds.height
      tscrol = Math.round(oSpace.from - h.twoTiers)
      } else {
      //   // <= On est en train de descendre et l'item se trouve en dessous
      //   // => Il faut placer l'item en haut
      //   tscroll = oSpace.from
      tscrol = Math.round(oSpace.from - h.oneTiers)
      }
      // console.log("L'item est en dehors, il faut le replacer. Scroll appliqué :", tscrol)
      // parent.scrollTo(0, tscrol)
      parent.scroll({top: tscrol, behavior:'smooth'})
    }
  }

  /** ---------------------------------------------------------------------
    *   Pour picker couleur
    *   require('a-color-picker')
    *
  *** --------------------------------------------------------------------- */
, pickColorFor(button, ev){
    if (this.pickerColorIsVisible) {
      this.aBGcolorpicker.hide()
      this.aFTcolorpicker.hide()
    } else {

      // Le champ pour mettre la valeur
      let hiddenFTcolor = button.getAttribute('data-ft-hidden')
      let hiddenBGcolor = button.getAttribute('data-bg-hidden')
      hiddenFTcolor || raise("Il faut définir l'attribut 'data-ft-hidden' (ID du champ hidden pour consigner la couleur de police — de départ et nouvelle) dans le bouton picker de couleur.")
      hiddenBGcolor || raise("Il faut définir l'attribut 'data-bg-hidden' (ID du champ hidden pour consigner la couleur de fond — de départ et nouvelle) dans le bouton picker de couleur.")
      hiddenFTcolor = DGet(`#${hiddenFTcolor}`)
      hiddenBGcolor = DGet(`#${hiddenBGcolor}`)

      // Le span qu'on devra coloriser
      let spanColor   = button.getAttribute('data-span')
      spanColor || raise("Il faut définir l'attribut 'data-span' (ID du span pour montrer la couleur) dans le bouton picker de couleur.")
      spanColor = DGet(`#${spanColor}`)

      let BGPickerColor = DGet('div#acolorpicker-bg-container');
      let FTPickerColor = DGet('div#acolorpicker-ft-container');
      if (!BGPickerColor){
        document.body.append(DCreate('DIV',{id:'acolorpicker-bg-container', class:'apickerforcolor', style:`position:fixed;top:0px;right:0px;width:auto;height:auto;z-index:1000;`}))
        document.body.append(DCreate('DIV',{id:'acolorpicker-ft-container', class:'apickerforcolor', style:`position:fixed;top:0px;right:232px;width:auto;height:auto;z-index:1000;`}))
        BGPickerColor = DGet('#acolorpicker-bg-container')
        FTPickerColor = DGet('#acolorpicker-ft-container')
        this.aBGcolorpicker = AColorPicker.createPicker(BGPickerColor, {paletteEditable:true})
        this.aFTcolorpicker = AColorPicker.createPicker(FTPickerColor, {paletteEditable:true})
      }

      this.foregroundColor = hiddenFTcolor.value || '#FFFFFF'
      this.backgroundColor = hiddenBGcolor.value || '#00FF00'
      this.aFTcolorpicker.setColor(this.foregroundColor, true)
      this.aBGcolorpicker.setColor(this.backgroundColor, true)

      this.aFTcolorpicker.on('change', (picker, color) => {
        color = AColorPicker.parseColor(color, "hex");
        spanColor.style.color = this.foregroundColor = color
        hiddenFTcolor.value = color
      })
      this.aBGcolorpicker.on('change', (picker, color) => {
        color = AColorPicker.parseColor(color, "hex");
        spanColor.style.backgroundColor = this.backgroundColor = color
        hiddenBGcolor.value = color
      })
      this.aBGcolorpicker.show()
      this.aFTcolorpicker.show()
    }
    this.pickerColorIsVisible = !this.pickerColorIsVisible;


    return stopEvent(ev)
  }


}
Object.defineProperties(UI,{
  body:{get(){return document.querySelector('body')}}
, header:{get(){return document.querySelector('section#header')}}
, footer:{get(){return document.querySelector('section#footer')}}
, UI_HEIGHT:{get(){return window.innerHeight}}
, UI_WIDTH: {get(){return window.innerWidth}}
})
