'use strict'

const YAML = require('js-yaml')

const ICON_PATH = '/Users/philippeperret/Programmation/Semaine/icons/app2.icns';

class Semaine {
  static build_main_semaine(){

    Notification.requestPermission().then(function(result) {
      if (result != 'granted'){
        alert("Attention, pour une raison inconnue, je ne pourrai pas faire de notification.")
      }
    });

    var semaine = new Semaine()

    // Faire tous les jours
    for(var i=1; i<7; ++i){
      Object.assign(JOURS_SEMAINE, {[i]: new Jour({semaine:semaine, njour:i})})
    }

    // On doit instancier un nouveau curseur qui va :
    //  - afficher une ligne pour suivre le temps sur la semaine
    //  - déclencher les notifications des travaux quand il passera
    //    sur leur temps.
    new Cursor();

    // il faut instancier le curseur avant de charger et construire
    // la semaine, car on va enregistrer les travaux à jouer aujourd'hui
    // dans le curseur
    semaine.build();

    // On peut construire le curseur (ce qu'on ne peut pas faire avant
    // d'avoir construit la semaine, ce qui sera à corriger TODO)
    Cursor.current.build()

    // On met en route le curseur.
    Cursor.current.startMoving()

  }

  /**
   * INSTANCE
   */
  constructor(data){
    // TODO On doit pouvoir spécifier la semaine à utiliser.
    // Note : c'est un fichier dans les dossiers de l'user
  }

  /**
   * Méthode principale de construction de la semaine
   */
  build(){
    UI.content.append(DCreate('DIV',{id:'semaine-courante', class:'semaine'}))
    this.obj = DGet('div#semaine-courante')

    // Créer tous les jours de la semaine
    for(var ijour in JOURS_SEMAINE){
      JOURS_SEMAINE[ijour].build()
    }

    // Tracer les lignes d'heures
    for(var h = HEURE_START; h <= HEURE_END; h += .5){
      var contenu = h == parseInt(h,10) ? Horloge.heure2horloge(h) : ''
      this.obj.append(DCreate('DIV',{class:'hourline', style:`top:${(h-HEURE_START)*HEURE_HEIGHT+TOP_START}px;`, inner:[
        DCreate('SPAN', {class:'hourspan', inner:contenu})
      ]}))
    }

    // Construire les travaux
    this.data.forEach(w => w.build())

  }

  get data(){
    return this._data || this.loadData()
  }

  loadData(){
    // Pour le moment, on prend tous les travaux
    // TODO Il faudra ensuite charger par semaine
    Travail.load()
    return Object.values(Travail.items)
  }

  /**
   * Retourne le chemin d'accès au fichier des données qui doit se
   * trouver dans le dossier de l'user.
   * Mais pour le moment, je le prends ici.
   */
  get dataPath(){
    if (undefined === this._datapath) {
      this._datapath = path.join(App.homeDirectory,'Programmation','Semaine','sample_data.yaml')
    } return this._datapath
  }
}
