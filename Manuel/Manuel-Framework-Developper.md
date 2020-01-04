# Node JS Framework

* [Présentation](#presentation)
* [Construction d'une nouvelle application](#buil_new_app)
  * [Code à jouer au démarrage](#code_onload)
  * [Icone de l'application](#iconeapplication)
* [Lancer l'application](#run_app)
* [Interface de l'application](#app_ui)
  * [Actualisation du fichier HTML principal](#update_html_file)
* [Réglage des paramètres MySql](#define_mysql_settings)
  * [Définition des tables DB](#define_tables_db)
  * [Reconstruction complète de la base de données](#rebuild_db)
* [Implémentation de l'applicaton](#implementeapplication)
  * [Méthodes JS utiles](#usefulljsmethods)

## Présentation {#presentation}

*Node JS Framework* est un framework permettant de construire très rapidement une application NodeJS simple (mais avec toutes les fonctionnalités de base utiles : base de données, messages, etc.).


## Construction d'une nouvelle application {#buil_new_app}

* dupliquer tout le dossier `NodeJSFramework` à l'endroit voulu et renommer ce dossier du nom de l'application,
* reporter le nom de cette application dans le fichier `package.json` (propriétés `name` et `productName`),
* dans `package.json`, régler la valeur du compte github,
* [pour le moment] détruire le dossier `.git` et relancer `git init` (`git add -A;git commit -m "Premier dépôt";`)
* Ajouter ce dossier à `Github Desktop` pour le publier plus facilement,
* définir les [paramètres MySql](#define_mysql_settings) si l'application a besoin d'une base de données,
* définir les tables DB dans le fichier `./_side-back/app/js/db/tables.js` (cf. [Définition des tables DB](#define_tables_db)),
* lancer la commande `npm update` pour actualiser les modules
* si `electron` n'est pas encore chargé sur l'ordinateur, jouer `npm install electron -g`,
* définir le fichier `./_side-front/app/main-template.html` pour qu'il corresponde à l'apparence voulue pour l'application (cf. [Interface de l'application](#app_ui)),
* jouer npm start


### Code à jouer au démarrage {#code_onload}

Pour jouer du code JS au démarrage de l'application, une fois que tout a été chargé, il suffit de le mettre dans le fichier `./_side-front/app/js/then-required/App.js`, dans la méthode `onInit()` qui est appelée quand la page est prête (le `ready` de jQuery — même si ici on n'utilise pas jQuery).

---

## Icone de l'application {#iconeapplication}

L'icone de l'application doit être un fichier portant le nom exact `app.icns` (pour MacOs) `app.ico` (pour Windows) de 520px par 520px et placé dans le dossier `./icons`.

Dans le cas contraire, régler la valeur de l'option `--icon` dans le script `build` du fichier `package.js` en lui donnant le nom du fichier à utiliser.

> Note : si aucune icone n'est créée, il se peut qu'il faille utiliser la commande `npm run build-sans-icone` pour pouvoir construire l'application.

---

## Lancer l'application {#run_app}

`npm start`

---


## Interface de l'application {#app_ui}

L'interface de l'application se définit dans le fichier `./_side-front/app/main-template.html`.


### Actualisation du fichier HTML principal {#update_html_file}

Lancer l'application avec `npm run start-update`

Cette commande est à utiliser après la modification du template de l'application (le fichier `./_side-front/app/main-template.html`).

## Modification des feuilles de styles

Un `id` unique (issu du path) est donné aux feuilles de styles `link`. Pour les récupérer, il suffit de faire (noter le `.sheet`)

~~~javascript
const SHPage = DGet('#stylesheet_app_ma_css').sheet
~~~

On peut ensuite ajouter des règles à l’aide de :

~~~javascript
SHPage.insertRule('.container .vers .selector {height: 112px;}', 10)
~~~

Le `10` ci-dessus signifie que la règle (rule) devra être placée en 11e position dans le fichier actuel.

Pour l’[explication complète](https://www.w3.org/wiki/Dynamic_style_-_manipulating_CSS_with_JavaScript#Adding_and_Removing_Rules).

---

## Réglage des paramètres MySql {#define_mysql_settings}

Les paramètres MySql doivent se définir dans un fichier `.mysql.config` à la racine du dossier utilisateur (`~/.mysql.config`).

Ce fichier doit contenir :

```javascript

const MYSQL_DATA = {
    local:{
        host: 'localhost'
      , user: 'root'
      , password: '_PASSWORDLOCAL_'
      /*, database: '_DB_BASE_NAME_'*/
    }
    // Pour une utilisation distante :
  , distant:{
        host: '_DISTANT_HOST_'
      , user: '_DISTANT_USER_'
      , password: '_DISTANT_PASSWORD_'
      , database: '_DISTANT_DBASENAME_'
    }
}
module.exports = MYSQL_DATA

```

### Définition de la base de données

Ce fichier servant à toutes les applications construites avec le framework, il vaut mieux ne pas définir la base de données dedans.

Cette base de données peut être définies de plusieurs façons (noter que dans tous les cas il faut créer cette base de données, le framework ne le fait pas) :

* de façon conventielle, sans rien préciser d'autres, le framework recherchera une base qui porte le même nom que l'application.
* dans la méthode `App::onInit` du fichier `_side-front/app/js/App.js`, on peut définir : `MySql2.database = "<nom de la base>"`,

### Définition des tables DB {#define_tables_db}

On définit les tables DB dans le fichier `./_side-back/app/js/db/tables.js` qui définit la constantE `DB_TABLES`. C'est une liste dont chaque élément définit une table :

```javascript

const DB_TABLES = [
    {/* définition table A (cf. ci-dessous) */}
  , {/* définition table B */}
  //...
  , {/* définition table Z */}
]

```

Chaque table est définie par un hash qui contient :

```javascript

// Définition de la table A
{
      name: "nom_de_la_table"
    , autoincrement: true // ou false
    , columns: [
          {/* définition de la colonne 1 (cf. ci-dessous) */}
        , {/* définition de la colonne 2 */}
        // ...
        , {/* définition de la colonne X */}
      ]
}

```

> Note : si `autoincrement` est true, il est inutile de créer la colonne `id`, ce sera fait automatiquement.

Chaque colonne est définie par un hash qui contient :

```javascript

// Définition de la colonne 1
{
    name: 'nom_de_la_colonne'
  , type: 'INT' // ou autre type valide
  , default: null // valeur par défaut, 'NULL' pour valeur null
  , unique: false // ou true si la valeur doit être unique
  , notNull: true // ou false si la valeur peut être non définie
}
```

Une définition complète peut donc ressembler à :

```javascript

const DB_TABLES = [
  {
      name: "Auteurs"
    , autoincrement: true // crée la colonne ID
    , columns: [
          {name:'prenom', type:'VARCHAR(100)', notNull:true}
        , {name:'nom',    type:'VARCHAR(100)', notNull:true}
        , {name:'naissance' type:'VARCHAR(8)'}
        , {name:'created_at', type:'DATE'}
      ]
  }
, {
      name: 'Livres'
    , autoincrement:true
    , columns:[
          {name:'titre', type:'VARCHAR(255)'}
        , {name:'auteur_id', type:'INT'}
        , {name:'reference_type', type:'VARCHAR(8)'}  // p.e. 'ISBN'
        , {name:'reference', type:'VARCHAR(30)'}      //p.e. le n° ISBN
      ]
  }
]

```

### Reconstruction complète de la base de données {#rebuild_db}

ATTENTION : cette opération détruit toutes les données qui pourraient se trouver dans les tables.

Lancer `npm run update-db`

---

## Implémentation de l'applicaton {#implementeapplication}

### Méthodes JS utiles {#usefulljsmethods}

Avant de commencer l'implémentation, on peut jeter un œil au module `_site-front/system/js/first-required/utils.js` qui contient un grand nombre de méthodes utiles, par exemple la méthode `defP` qui permet de définir très simplement des propriétés volatiles ou la méthode `DGet` qui permet de remplacer `document.querySelector`.
