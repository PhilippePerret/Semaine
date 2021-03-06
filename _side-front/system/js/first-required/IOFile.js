'use strict'
/**
 * Class File
 * -----------
 * Pour la gestion des fichiers
 * Cf. le manuel de développement
 *
 */
class IOFile {
// ---------------------------------------------------------------------
//  CLASSE

/**
  @param  {String} fpath Chemin d'accès au fichier
  @return {String} Format en résultat, en capitales
**/
static getFormatFromExt(fpath){
  switch (path.extname(fpath).toLowerCase()) {
    case '.json':
      return 'JSON'
    case '.yml':
    case '.yaml':
      return 'YAML'
    case '.md':
    case '.mmd':
    case '.markdown':
      return 'MARKDOWN'
    case '.js':
      return 'JAVASCRIPT'
    default:
      return null
  }
}

/**
  Méthode qui retourne NULL si le code +code+ est valide ou le message
  d'erreur en cas d'erreur.

  @param  {String} code     Le code à tester
  @param  {String} format   Le format, 'json' ou 'yaml'
  @return {Null|String} NULL si OK, le message d'erreur sinon

**/
static codeIsOK(code, format){
  switch (format) {
    case 'JSON':
      try {
        JSON.parse(code)
      } catch (e) {
        // console.error(e)
        return `Code JSON invalide :${RC+RC}${e.message}`
      }
      break
    case 'YAML':
      try {
        YAML.safeLoad(code)
      } catch (e) {
        // console.error(e)
        return `Code YAML invalide (lig ${e.mark.line}) :${RC+RC}${e.message}`
      }
      break
  }
  return null // OK
}

// ---------------------------------------------------------------------
//  INSTANCE

// Cf. le manuel de développement
constructor(p_or_owner, otherPath){
  if('string' === typeof p_or_owner){
    this.path   = p_or_owner
    this.owner  = undefined
  } else {
    this.owner  = p_or_owner
    this.path   = otherPath || this.owner.path
  }

}

// ---------------------------------------------------------------------
//  Méthodes d'entrée sortie

/**
 * Sauvegarde "prudente" du fichier. On l'enregistre d'abord dans un fichier
 * temporaire, puis une fois qu'on s'est assuré de sa validité, on le met
 * en bon fichier tout en faisant un backup de l'original.

 @param {Object|Undefined} options  Pour définir des options
    :no_warm_if_shorter   Si true, ne produira pas l'alerte de document 20 %
                          moins gros.
    :no_waiting_msg       Si true, on n'affiche pas le message d'attente
 */
save(options){
  log.info('-> IOFile#save')
  if(this.saving){
    log.info('<- IOFile#save [retour immédiat : en cours de sauvegarde]')
    return false
  } else {
    this.saving = true
  }
  options = options || {}
  this.options = options
  if(!options.no_waiting_msg){
    UI.startWait(`Sauvegarde du fichier "${this.name}" en cours…`)
  }
  if(options.after) this.methodAfterSaving = options.after
  this.checkBackupFolder()
  var scode
  try {
    this.saved = false
    scode = this.encodeCode()
    isDefined(scode)  || raise(T('code-to-save-is-undefined'))
    isNotNull(scode)  || raise(T('code-to-save-is-null'))
    let err_code = IOFile.codeIsOK(scode, IOFile.getFormatFromExt(this.path))
    isNull(err_code)  || raise(T('code-to-save-not-ok', {raison: err_code}))
    isNotEmpty(scode) || raise(T('code-to-save-is-empty'))
    this.savedcode = scode

    if ( isFalse(options.no_warm_if_shorter) && this.codeIsMuchShorter() ) {
      this.confirmIfMuchShorter()
    } else {
      this.execSave()
    }
  } catch (e) {
    this.endSavingInAnyCase()
    if(e){
      F.error(`Erreur au cours de l'enregistrement du fichier : ${e}`)
      log.error(e)
      log.error("CODE FAUTIF :\n")
      log.warn(RC + scode)
    }
    log.info('<- IOFile#save (retour false après erreur)')
  } finally {
    scode = null
  }
  log.info('<- IOFile#save')
}
/**
  Méthode exécutant vraiment la sauvegarde du contenu du fichier
**/
execSave(){
  try {
    if(this.tempExists()) fs.unlinkSync(this.tempPath)
    fs.writeFile(this.tempPath,this.savedcode,'utf8', this.afterTempSaved.bind(this))
  } catch (e) {
    this.endSavingInAnyCase()
    if(e){
      F.error(`Erreur au cours de l'enregistrement du fichier : ${e}`)
      log.error(e)
      log.error("CODE FAUTIF :\n")
      log.warn(RC + this.savedcode)
    }
    log.info('<- IOFile#save (retour false après erreur)')
  } finally {
    delete this.savedcode
  }
}

afterTempSaved(err){
  log.info('-> IOFile#afterTempSaved')
  try {
    if(err) throw(err)
    this.tempExists() || raise(T('temps-file-unfound',{fpath: this.tempPath}))
    this.tempSize > 0 || raise(T('temp-file-empty-stop-save',{fpath: this.tempPath}))
    this.isBackupable ? this.backup() : this.endSave()
  } catch (e) {
    this.endSavingInAnyCase()
    log.error(e)
    F.error(e)
    return false
  }
}
endSave(err){
  log.info('-> IOFile#endSave')
  try {
    if (err){
      this.endSavingInAnyCase()
      return F.error(err)
    }
    this.tempExists() || raise(T('temps-file-unfound',{fpath: this.tempPath}))
    this.tempSize > 0 || raise(T('temp-file-empty-stop-save',{fpath: this.tempPath}))
    fs.rename(this.tempPath, this.path, (err)=>{
      if (err) F.error(err)
      else {
        // FIN !
        this.endSavingInAnyCase()
        this.saved = true
        isFunction(this.methodAfterSaving) && this.methodAfterSaving()
      }
    })
  } catch (e) {
    this.endSavingInAnyCase()
    F.error(e)
  }
}

/**
  La méthode de fin de sauvegarde qu'on utilise dans tous les cas,
  que la procédure se soit bien passée ou qu'elle ait été annulée ou
  interrompue
**/
endSavingInAnyCase(){
  if(!this.options.no_waiting_msg) UI.stopWait()
  this.saving = false
}

/**
 * Procédure intelligente de chargement, en tenant compte du fait que le
 * fichier peut exister mais être vide.
 *
 * Note : utiliser plutôt la méthode `loadIfExists` pour bénéficier de
 * toutes les protections et l'utilisation de backups
 */
load(options){
  var my = this
  if (!options) options = {}
  if(options.format)  this._format = options.format
  if(options.after)   this.methodAfterLoading = options.after
  my.loaded = false
  fs.readFile(this.path, 'utf8', (err, data) => {
    err ? F.error(err) : my.code = data
    my.endLoad(!err)
  })
}

loadSync(options){
  var my = this
  if (!options) options = {}
  if(options.format)  this._format = options.format
  if(options.after)   this.methodAfterLoading = options.after
  my.loaded = false
  my.code = fs.readFileSync(this.path, 'utf8')
  return my.endLoad(true)
}

// La différence avec la méthode précédente, c'est qu'elle ne génère pas
// d'erreur en cas d'inexistence du fichier
loadIfExists(options, fn_pour_suivre){
  var my = this
  this.loaded = false
  // Noter que la méthode peut être rappelée depuis elle-même, donc
  // sans redéfinir options ou fn_pour_suivre. Donc il ne faut les
  // définir que s'ils sont définis.
  isDefined(options) && ( my.options = options )
  isDefined(fn_pour_suivre) && ( my.methodAfterLoading = fn_pour_suivre )
  if(options && options.after) my.methodAfterLoading = options.after
  if(isFalse(this.exists())){
    my.endLoad(false)
  } else {
    if(my.size === 0) {
      my.retrieveBackup()
    } else {
      // On peut charger
      my.load(options)
    }
  }
  my = null
}

endLoad(success){
  this.loaded = success
  delete this._decodedCode
  if(isFunction(this.methodAfterLoading)){
    this.methodAfterLoading(success ? this.decodedCode : null /* ou raw code */)
  } else {
    // Quand loadSync est utilisé
    return success ? this.decodedCode : null
  }
}

backup(){
  var my = this
  try {
    // console.log({
    //   op: 'rename dans backup()', src: my.path, dst: my.backupPath
    // })
    fs.rename(my.path, my.backupPath, my.endSave.bind(my))
  } catch (e) {F.error(e)}
  my = null
}

retrieveBackup(){
  var my = this
  try {
    // On doit tenter la procédure de retreive de backup
    fs.unlinkSync(this.path)
    if(this.backupExists()){
      fs.copyFile(my.backupPath,my.path, (err) => {
        if(err){ F.error(err) ; my.endLoad }
        // Puis on réessaye…
        return this.loadIfExists()
      })
    } else {
      // Pas de backup… j'abandonne
      my.endLoad(false)
    }
  } catch (e) {
    F.error(e)
  }
  my = null
}

/**
 * Méthode qui vérifie la présence du dossier backup et le crée si nécessaire
 */
checkBackupFolder(){
  if(fs.existsSync(this.backupFolder)) return true
  fs.mkdirSync(this.backupFolder)
}

/**
  @return TRUE si le code à sauver (this.savedcode) est de 20% plus court
  que le code original.
**/
codeIsMuchShorter(){
  if ( this.exists() ) {
    let vingtPourcent = this.size * 80 / 100
      , newLength = Buffer.from(this.savedcode).length
    return newLength < vingtPourcent
  } else {
    return false
  }
}
/**
  Méthode de protection qui demande confirmation, à l'enregistrement, si
  le code à enregistrer est plus court de plus de 20% que le code original
  s'il existe déjà.

  @param {String} scode   Le nouveau code prêt à être enregistré
  @return {Boolean} true si on peut poursuivre, false quand ça n'a pas été
                    confirmé.
**/
confirmIfMuchShorter(){
  confirm({
      message: T('confirm-content-much-shorter', {doc_name: this.nameWithFolder})
    , buttons:['Renoncer', 'Je confirme']
    , defaultButtonIndex:1
    , cancelButtonIndex:0
    , okButtonIndex:1
    , methodOnOK: this.execSave.bind(this)
  })
}

// ---------------------------------------------------------------------
//  Méthode de test

exists()        { return fs.existsSync(this.path) }
tempExists()    { return fs.existsSync(this.tempPath)}
backupExists()  { return fs.existsSync(this.backupPath)}

get isBackupable(){ return this.exists() && this.size > 0 }

// ---------------------------------------------------------------------
//  Données

get options(){return this._options}
set options(v){ this._options = v || {} }

set code(v){this._code = v}
// Note : il ne faut surtout pas mettre dans une __data (__code) car
// ce ne serait pas le nouveau contenu du document qui serait enregistré,
// mais toujours son contenu initial.
get code(){
  if (isUndefined(this.owner)) {
    return this._code
  } else {
    // console.log("Je prends code dans le propriétaire (pas dans _code)")
    // Le code doit être défini dans la propriété `contents` ou `code`
    // du propriétaire de l'instance
    return this.owner.contents || this.owner.code || this.owner.data || this._code
  }
}

/**
  Par mesure de sécurité, on vérifie toujours la validité d'un code
  avant son enregistrement.

  @param {String} code    Le code à checker, celui qui sera vraiment enregistré
  @returns true si le +code+ est valide, false dans le cas contraire.

**/

/**
  * Retourne le code décodé en fonction du format du fichier (défini par
  * son extension ou explicitement en options)
  */
get decodedCode(){return this._decodedCode || defP(this,'_decodedCode',this.decode())}
decode(){
  if(!this._code) return null // fichier inexistant, par exemple
  try {
    switch (this.format.toUpperCase()) {
      case 'RAW':
        return this._code // pour la clarté
      case 'JSON':
        if ('object' === typeof this._code) return this._code
        else return JSON.parse(this._code)
      case 'YAML':
        return YAML.safeLoad(this._code)
      default:
        return this._code
    }
  } catch (e) {
    console.log(`ERROR ${this.format} AVEC:`, this.path)
    F.error('Une erreur s’est produite en lisant le fichier '+this.path)
    F.error(e)
    return null
  }
}

/**
 * Encode le code au besoin, c'est-à-dire si un format particulier est
 * utilisé (JSON ou YAML pour le moment) et si le code n'est pas du string.
 */
encodeCode(){
  if ( !this.code ){
    return null
  }
  if ('string' === typeof this.code) return this.code // déjà encodé
  switch (this.format) {
    case 'JSON':
      return JSON.stringify(this.code, null, 2)
    case 'YAML':
      return YAML.safeDump(this.code)
    default:
      return this.code
  }
}

get size(){ return fs.statSync(this.path).size }
get tempSize(){ return fs.statSync(this.tempPath).size }
get backupSize(){ return fs.statSync(this.backupPath).size }

get methodAfterSaving(){return this._methodAfterSaving}
set methodAfterSaving(v){this._methodAfterSaving = v}
get methodAfterLoading(){return this._methodAfterLoading}
set methodAfterLoading(v){this._methodAfterLoading = v}

/**
 * Retourne le format du fichier, en fonction de son extension
 */
get format(){return this._format||defP(this,'_format',IOFile.getFormatFromExt(this.path))}

// ---------------------------------------------------------------------
//  Données de path

get nameWithFolder(){
  return this._nameWithFolder || defP(this,'_nameWithFolder', `${path.basename(this.folder)}/${this.name}`)
}
get folder(){
  return this._folder || defP(this,'_folder', path.dirname(this.path))
}
get backupFolder(){
  return this._bckFolder || defP(this,'_bckFolder', path.join(this.folder,'.backups'))
}
get name(){
  return this._name || defP(this,'_name',path.basename(this.path))
}
get backupPath(){
  return this._backupPath || defP(this,'_backupPath',path.join(this.backupFolder,this.name))
}
get tempPath(){
  return this._tempPath || defP(this,'_tempPath', `${this.path}.temp`)
}
}

module.exports = IOFile
