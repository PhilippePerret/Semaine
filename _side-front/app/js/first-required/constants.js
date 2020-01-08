'use strict'

const HIERARCHIE_PARENTS = ['travail','projet','categorie','domaine']

const HEURE_START   = 6 ;
const HEURE_END     = 18 ;
const HEURE_HEIGHT  = 50 ;
const COEF_MINUTE   = HEURE_HEIGHT / 60 ;
const TOP_START     = 30 ; // hauteur du nom du jour

const explicationCron = `
<code><pre>
À la façon d'un cron-job, c'est-à-dire avec des étoiles ou des valeurs :

      .----------- Minute(s)
      | .--------- Heure(s)
      | | .------- Jour(s) du mois (1-31)
      | | | .----- Mois (de 1=janvier à 12=décembre)
      | | | | .--- jour(s) de la semaine
      | | | | |
      * * * * *

Pour chaque valeur, on peut utiliser :
------------------------------------
  - Une valeur fixe           0 6 * * *         Pour 'à 6 heures tous les jours'
  - Une plage de valeurs      0 8 4-7 * *       Pour 'du 4 au 7 de chaque mois à 8 heures'
  - Une fréquence de valeurs  */15 * * * *      Pour 'toutes les 15 minutes'
                              15 9 */10 * *     Pour 'tous les 10 jours à 9h15'
  - Une liste de valeurs      0 5 * * mar,sat   Pour 'Les mardi et samedi à 5 heures'
                              10,20 9-12 * * *  Pour 'à chaque 10 et 20 minutes, de 9 heures
                                                à midi', donc 9:10, 9:20, 10:10, 10:12, etc.
Les MOIS peuvent être spécifiés par :
  - leur indice naturel (1 = janvier, 12 = décembre)
  - leur valeur min en anglais : jan,feb,mar,apr,may,jun,jui,aug,sep,oct,nov,dec

Les JOURS peuvent être spécifié par :
  - leur indice naturel (sauf pour dimanche qui est 0)
  - leur valeur réduite en anglais : mon,tue,wed,thu,fri,sat,sun

</pre></code>
`
/**
  Données des récurrences
  -----------------------
  Si une donnée a besoin de définir recurrenceValue, qui va la définir,
  alors il faut ajouter `definable:true`
**/

const DATA_RECURRENCES = {
    'none':   {hname: 'Choisir…', explication:'Choisir obligatoirement le type de récurrence à appliquer.'}
  , 'cron':   {definable:true, hname: 'façon CRON…', explication: explicationCron}
  , 'jour':   {hname: 'tous les jours', explication: "Ce travail de ${duree} sera répété chaque jour à ${heure}."}
  , 'xjour':  {definable:true, hname: 'tous les x jours', explication: "Ce travail de ${duree} sera répété tous les x jours à ${heure} à compter du ${date}."}
  , 'jours':  {definable:true, hname: 'seulement les jours…', explication: "Ce travail sera répété seulement les jours indiqués. Le lundi vaut 1 et le samedi vaut 6. On peut spécifier les valeurs en les séparant ou non par n'importe quel caractère, par exemple '134' ou '1,3,4' ou '1 3 4'."}
  , 'hebdo':  {hname: 'un par semaine (aka "briefing")', explication: "Ce travail de  ${duree} sera répété chaque semaine, le ${njour} à ${heure}."}
  , 'biheb':  {hname: 'un toutes les 2 semaines', explication: "Ce travail de ${duree} sera répété tous les quinze jours, le ${njour} à ${heure}."}
  , 'month':  {hname: 'un par mois (aka "bilan")', explication: "Ce travail de ${duree} sera répété tous les ${mDay} du mois à ${heure}."}
  , 'months': {definable:true, hname: 'seulement les mois…', explication: "Le travail sera répété seulement les mois indiqués. La valeur doit être une liste d'indice de mois (1 pour janvier, 2 pour février, 10 pour octobre, etc.) séparés par des espaces. Par exemple '1 3 11' pour janvier, mars et novembre. Ne pas mettre les mois sur deux chiffres."}
  , 'bimen':  {hname: 'bimensuel', explication: "Le travail sera répété tous les deux mois, le même numéro de jour du mois."}
  , 'trim':   {hname: 'trimestriel (aka "conseil")', explication: "Le travail sera répété tous les trois mois, le même numéro de jour du mois."}
  , 'annee':  {hname: 'un par an (aka "anniversaire")', explication: "Le travail ne sera répété qu'une fois par an, précisément le jour spécifié (en prenant en compte la semaine)."}
}
