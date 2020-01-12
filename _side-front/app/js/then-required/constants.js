'use strict'

const HIERARCHIE_PARENTS = {
    'Travail':          'Projet'
  , 'TravailRecurrent': 'Projet'
  , 'Projet':           'Categorie'
  , 'Categorie':        'Domaine'
  , 'Domaine':          null
}

const HEURE_START   = 6 ;
const HEURE_END     = 18 ;
const HEURE_HEIGHT  = 50 ;
const COEF_MINUTE   = HEURE_HEIGHT / 60 ;
const TOP_START     = 30 ; // hauteur du nom du jour


/**
  Données des récurrences
  -----------------------
  Si une donnée a besoin de définir recurrenceValue, qui va la définir,
  alors il faut ajouter `definable:true`
  Cf. le fichier ./_site-front/app/locales/$LANG/data.yaml pour voir les
  valeurs humaines.
**/

const DATA_RECURRENCES = {
    'none':   {hname: loc('verbe.choose')}
  , 'cron':   {definable:true, explication: 'long-texts.recur.cron.ex'}
  , 'jour':   {}
  , 'xjour':  {definable:true}
  , 'jours':  {definable:true}
  , 'hebdo':  {}
  , 'biheb':  {}
  , 'month':  {}
  , 'months': {definable:true}
  , 'bimen':  {}
  , 'trim':   {}
  , 'annee':  {}
}
