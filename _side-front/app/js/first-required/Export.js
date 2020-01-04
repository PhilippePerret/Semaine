'use strict'
/**
  Composant Export qui s'occupe de l'export du livre
**/
const Export = {


async exportBook(){
  const my = this

  try {

    var intro = 'Export du livre.'
    F.action(intro + '..')

    // Tout d'abord, il faut voir s'il y a une nouvelle version à initier
    var lastUpdate = await Data.get('last_update')
    var lastExport = await Data.get('last_export')
    if ( lastUpdate && lastExport && lastUpdate > lastExport ) {
      F.action(intro + 'Changement de version…')
      G2LN.version.incRevisionValue()
    }

    // On construit le dossier d'export si nécessaire, ou on le vide
    F.action(intro + 'Préparation du dossier…')
    my.traiteExportMainFolder()

    // Construction de la couverture
    // C'est un mélange d'image et de svg
    F.action(intro + 'Construction de la couverture…')
    Cover.build()
    fs.existsSync(my.exportCoverPath) || raise("Arrêt car impossibilité de trouver le fichier "+my.exportCoverPath)

    // On copie le fichier css (book.css) dans le dossier d'export
    F.action(intro + 'Copie du fichier book.css…')
    fs.copyFileSync(this.bookCSSPath,this.bookCSSExportPath)

    // On construit le livre HTML à partir de div#book
    F.action(intro + 'Construction du fichier HTML…')
    my.buildBookHTML() || raise('Arrêt')

    F.action('Création du PDF…', {start:true})
    exec(my.commandBuilPDF(), (error, stdout, stderr) => {
      F.stop()
        if( error ) {
          console.error(error)
          alert("Une erreur est survenue (cf. console).\n\nRaisons connues :\n\n\t• les styles utilisent opacity\n\n\nJe vais exporter avec le code simple.")
          my.execSimpleBuildPDF()
        } else if ( fs.existsSync(my.PDFBookPath) ) {
          // On ouvre le dossier
          alert(`Livre créé avec succès dans ${my.PDFBookPath}.`)
          exec(`open "${my.exportFolder}"`, (err,stdout,stdin)=>{})
        } else {
          alert("Bizarrement, le livre n'a pas été créé. Vérifier la commande en console.")
          console.log("Commande : ", cmd)
        }
    });

    // On définit la date de dernier export
    Data.set('last_export', new Date, 'd')

  } catch (e) {
    alert(e.message)
    console.error(e)
  }
}

/**
  Après une erreur, on essaie de faire une version avec un code simplifié
**/
, execSimpleBuildPDF(){
    const my = this
    exec(my.simplifiedCode, (err, stdin, stdout) => {
      if ( err ) throw Error(err)
      alert("Document PDF simplifié exporté.")
    })
  }

/**
  retourne la commande qui va créer le PDF avec exec
**/
, commandBuilPDF(){
    const my = this
    let cmd = []
    cmd.push(`cd "${my.exportFolder}";`)
    cmd.push(EBOOK_CONVERT_CMD)
    cmd.push(my.HTMLBookName)
    cmd.push(my.PDFBookName)
    // cmd.push('--extra-css="../_side-front/css/book.css"')
    cmd.push(`--extra-css="book.css"`)
    cmd.push(`--cover="${my.exportCoverName}"`)
    cmd.push('--preserve-cover-aspect-ratio')
    cmd.push(`--custom-size=${Cover.width}pxx${Cover.height}px`)
    cmd.push(`--pdf-default-font-size=16`)
    cmd.push(`--pdf-page-margin-left=72`)
    cmd.push(`--pdf-page-margin-right=120`)
    cmd.push("--language=fr")
    cmd.push("--title=\"Grand livre des Lois de la Narration\"")
    // Options PDF
    cmd.push('--pdf-page-numbers')
    cmd.push("-v")
    cmd = cmd.join(' ')
    // console.log("Commande exécutée : %s", cmd)
    return cmd
  }
/**
  retourne la commande qui va créer le PDF avec exec
**/
, get simplifiedCode(){
    const my = this
    let cmd = []
    cmd.push(`cd "${my.exportFolder}";`)
    cmd.push(EBOOK_CONVERT_CMD)
    cmd.push(my.HTMLBookName)
    cmd.push(my.PDFBookName)
    // cmd.push('--extra-css="../_side-front/css/book.css"')
    // cmd.push(`--cover="${my.exportCoverName}"`)
    // cmd.push('--preserve-cover-aspect-ratio')
    // cmd.push(`--custom-size=${Cover.width}pxx${Cover.height}px`)
    // cmd.push(`--pdf-default-font-size=16`)
    // cmd.push(`--pdf-page-margin-left=72`)
    // cmd.push(`--pdf-page-margin-right=120`)
    cmd.push("--language=fr")
    cmd.push("--title=\"Grand livre des Lois de la Narration\"")
    // Options PDF
    cmd.push('--pdf-page-numbers')
    cmd.push("-v")
    cmd = cmd.join(' ')
    // console.log("Commande exécutée : %s", cmd)
    return cmd
  }

, buildBookHTML(){
  const my = this

  var code = fs.readFileSync(this.HTMLTemplatePath, 'utf-8')
  var code_book = UI.book.outerHTML

  // TODO Quelques correction ?

  code = code.replace(/__BODY__/, code_book)
  code = code.replace(/__TITLE__/, 'GRAND LIVRE DES LOIS DE LA NARRATION')
  code = code.replace(/<body>/,'<body id="export">') // pour les changements de style
  let res = fs.writeFileSync(this.HTMLBookPath, code)

  // true si le fichier a bien été créé
  return fs.existsSync(this.HTMLBookPath)
}


, traiteExportMainFolder(){
  const my = this
  if ( false === fs.existsSync(this.exportFolder) ) {
    fs.mkdirSync(this.exportFolder)
  } else {
    // Sinon, on détruit tout ce qu'il contient
    glob.sync(`${this.exportFolder}/**/*.*`).forEach(f => fs.unlinkSync(f))
  }
}

// ---------------------------------------------------------------------
//  PATHS POUR L'EXPORT
// ---------------------------------------------------------------------

, pathOf(relative){return path.join(this.exportFolder,relative)}

, get PDFBookPath(){ return this.pathOf(this.PDFBookName)}
, get PDFBookName(){ return `LIVRE_LOIS_NARRATION-v${G2LN.VERSION}.pdf`}

, get HTMLBookPath(){ return this.pathOf(this.HTMLBookName)}
, get HTMLBookName(){ return 'book.html'}

, get exportCoverPath(){
    return this._expcoverpath || (this._expcoverpath = this.pathOf(this.exportCoverName))
  }
, get sourceCoverName(){return this._srccovername || (this._srccovername = 'cover-sans-version.tiff')}
, get exportCoverName(){return this._expcovername || (this._expcovername = 'cover.svg')}

, get HTMLTemplatePath(){return path.join(G2LN.templatesFolder,'html_template.html')}

, get bookCSSPath(){return IO.pathOf('_side-front/css/book.css')}
, get bookCSSExportPath(){return this.pathOf('book.css')}

, get exportFolder(){
    // return this._exportfolder || ( this._exportfolder = IO.pathOf('export'))
    return this._exportfolder || ( this._exportfolder = this.getExportFolder() )
  }
, getExportFolder(){
    return path.join(app.getPath('userData'),'export')
  }

}
