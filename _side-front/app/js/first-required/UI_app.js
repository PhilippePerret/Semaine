Object.assign(UI,{

  ownerMethods: true // juste pour la virgule

, prepare(){

    // Construction des deux boutons pour ajouter ou supprimer un travail
    document.body.append(
        DCreate('DIV', {class:'buttons footer-buttons', inner:[
            DCreate('SPAN', {id:'plus-button-travail', class:'plusmoins-button plus-button', inner:'+'})
          , DCreate('SPAN', {id:'moins-button-travail', class:'plusmoins-button moins-button', inner:'−'})
          , DCreate('SPAN', {id:'prev-week-button', class:'prevnext-button', inner:'◀︎'})
          , DCreate('INPUT', {type:'hidden', id:'index-semaine'}) // inutile maintenant, mais bon…
          , DCreate('BUTTON',{id:'curr-week-button', inner:'Aujourd’hui'})
          , DCreate('SPAN', {id:'next-week-button', class:'prevnext-button',inner:'▶︎'})
          , DCreate('SPAN', {inner:"Année : "})
          , DCreate('SPAN', {id:'annee-semaine'})
        ]})
    )
    this.observe()
  }
, observe(){
    DGet('#plus-button-travail').addEventListener('click', Travail.onClickPlusButton.bind(Travail))
    DGet('#moins-button-travail').addEventListener('click', Travail.onClickMoinsButton.bind(Travail))
    DGet('#prev-week-button').addEventListener('click',SemaineLogic.showPrevious.bind(SemaineLogic))
    DGet('#next-week-button').addEventListener('click',SemaineLogic.showNext.bind(SemaineLogic))
    DGet('#curr-week-button').addEventListener('click',SemaineLogic.showCurrent.bind(SemaineLogic))
  }
})

Object.defineProperties(UI,{
  content: {get(){return DGet('section#content')}}
})
