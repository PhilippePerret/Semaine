'use strict'

const Aide = {
  name: 'aide'

/**
  Bascule l'aide
**/
, toggle(){
    if ( this.shown ) this.hide()
    else this.show()
    this.shown = !this.shown
  }
/**
  Méthode qui affiche l'aide
**/
, show(){
    this.domObj || this.build()
    this.domObj.style.display = 'block'
  }

/**
  Méthode qui masque l'aide
**/
, hide(){
    this.domObj.style.display = 'none'
  }

, build(){
    this.domObj = Dom.createDiv({id:'aide', text:this.content})
    let btnClose = '<a class="btn-close" onclick="Aide.toggle.call(Aide)">x</a>'
    this.domObj.prepend(Dom.createDiv({class:'right', text:btnClose}))
    UI.body.append(this.domObj)
  }
, get content(){
return `

<h2>Création des Lois</h2>

<p>Pour créer une loi, un thème ou un sous-thème, utiliser les boutons en bas à droite de la fenêtre de l'application.</p>

<h3>ALT+Click sur Thème ou Sous-thème</h3>
<p>=> Ouvre le formulaire de création d'une nouvelle loi en choisissant ce thème et ce sous-thèmes.</p>

<h2>Recherche des lois</h2>

<p>Utiliser le bouton « RECHERCHE » pour afficher le formulaire de recherche des lois à partir d'un texte.</p>

<h2>Récupération d'une loi</h2>

<h3>ALT+Click sur une Loi</h3>
<p>=> Mettre le lien dans le presse-papier</p>

<h2>Actualisation du livre</h2>

<h3>Création du fichier PDF</h3>
<p>Cliquer sur le bouton « IMPRIMER » pour produire la dernière version du livre.</p>

<h3>Upload du fichier PDF</h3>
<p>Cliquer sur le bouton « UPLOAD » (en bas de fenêtre) pour transmettre le fichier PDF actualisé. Cette commande transmet aussi le fichier HTML.</p>

<h2>Sauvegarde</h2>

<h3>Dump de la base de données</h3>
<p>Toutes les données de la base peuvent être « dumpées », c'est-à-dire copiées dans un fichier backup en cliquant sur le bouton « Dump DB ». Cela produit un nouveau fichier avec la date du jour dans le dossier « backups » qui se trouve dans le dossier des supports de l'application.</p>

`
  }
}
