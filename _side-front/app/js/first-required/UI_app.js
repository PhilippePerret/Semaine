Object.assign(UI,{

  ownerMethods: true // juste pour la virgule

, prepare(){

    // Construction des deux boutons pour ajouter ou supprimer un travail
    document.body.append(
        DCreate('DIV', {class:'buttons footer-buttons', inner:[
            DCreate('SPAN', {id:'plus-button-travail', class:'plusmoins-button plus-button', inner:'+'})
          , DCreate('SPAN', {id:'moins-button-travail', class:'plusmoins-button moins-button', inner:'−'})
          , DCreate('SPAN', {id:'prev-week-button', inner:'◀︎', style:'margin-left:4em;margin-right:1em;'})
          , DCreate('SPAN', {inner:"Semaine : "})
          , DCreate('SPAN', {id:'index-semaine', style:'margin-right:2em;'})
          , DCreate('SPAN', {inner:"Année : "})
          , DCreate('SPAN', {id:'annee-semaine'})
          , DCreate('SPAN', {id:'next-week-button', inner:'▶︎', style:'margin-left:1em;margin-right:1em'})
          , DCreate('BUTTON',{id:'curr-week-button', inner:'Aujourd’hui'})
        ]})
    )
    this.observe()
  }
, observe(){
    DGet('#plus-button-travail').addEventListener('click', Travail.onClickPlusButton.bind(Travail))
    DGet('#moins-button-travail').addEventListener('click', Travail.onClickMoinsButton.bind(Travail))
    DGet('#prev-week-button').addEventListener('click',Semaine.showPrevious.bind(Semaine))
    DGet('#next-week-button').addEventListener('click',Semaine.showNext.bind(Semaine))
    DGet('#curr-week-button').addEventListener('click',Semaine.showCurrent.bind(Semaine))
  }
})

Object.defineProperties(UI,{
  content: {get(){return DGet('section#content')}}
})
