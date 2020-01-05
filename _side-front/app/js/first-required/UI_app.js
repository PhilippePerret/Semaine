Object.assign(UI,{

  ownerMethods: true // juste pour la virgule

, prepare(){

    // Construction des deux boutons pour ajouter ou supprimer un travail
    document.body.append(
        DCreate('DIV', {class:'buttons footer-buttons', inner:[
            DCreate('SPAN', {id:'plus-button-travail', class:'plusmoins-button plus-button', inner:'+'})
          , DCreate('SPAN', {id:'moins-button-travail', class:'plusmoins-button moins-button', inner:'−'})
        ]})
    )
    this.observe()
  }
, observe(){
    DGet('#plus-button-travail').addEventListener('click', Travail.onClickPlusButton.bind(Travail))
    DGet('#moins-button-travail').addEventListener('click', Travail.onClickMoinsButton.bind(Travail))
  }
})

Object.defineProperties(UI,{
  content: {get(){return DGet('section#content')}}
})
