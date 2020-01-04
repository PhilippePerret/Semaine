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

    console.log("Je dois construire la semaine courante.")
    console.log("Today indice = ", Jour.today_indice)
    console.log("Nom du jour courant = ", Jour.today_name)

    var semaine = new Semaine()

    for(var i=0; i<6; ++i){
      JOURS.push(new Jour(semaine, i))
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
    JOURS.forEach(jour => {
      jour.build()
    })

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
    if (fs.existsSync(this.dataPath)){
      return YAML.safeLoad(fs.readFileSync(this.dataPath,'utf8')).map( dtravail => {
        return new Travail(dtravail)
      })
    } else {
      // ESSAI avec des valeurs
      return [
          new Travail({tache: "Faire ça", heure: 8.5, njour:2, duree: 2.50})
        , new Travail({tache: "Faire cet autre travail", heure: 6.5, njour:1})
        , new Travail({tache: "Et encore autre chose", heure: 10, njour:1, duree:4})
        , new Travail({tache:"Je vais faire ça", heure: 12.5, njour:3})
        , new Travail({tache:"Et ça aussi", heure: 13, njour:3})
        , new Travail({tache:"Et encore ça", heure: 13.5, njour:3})
        , new Travail({tache:"Et encore ça", heure: 18.5, duree:1.5, njour:3})
        , new Travail({tache:"Pour essayer le trigger de 17:5 heures", heure: 17.33, duree:1.5, njour:5})
      ]
    }
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
