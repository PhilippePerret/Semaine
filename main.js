'use strict'

// // ?
// require('update-electron-app')({
//   logger: require('electron-log')
// })

const electron = require('electron')
const path = require('path')
const glob = require('glob')
const {app, BrowserWindow} = require('electron')
const { Menu, MenuItem } = require('electron')

// Mode débug ?
const debug = /--debug/.test(process.argv[2])

// La fenêtre principale
global.mainWindow = null
global.ObjMenus = require('./_side-back/js/app/menus')
global.screenWidth   = null
global.screenHeight  = null

// Fonction appelée en bas de ce module, pour initialiser l'application
function initialize () {

  // Création d'une instance unique
  makeSingleInstance()

  // Chargement de tous les fichiers javascript utiles au
  // processus principal
  loadMainProcessFiles()

  // Construction des menus
  // Note : on a besoin de `mainMenuBar` pour retrouver les menus par
  // leur identifiant (cf. le modules modules/menus.js)
  ObjMenus.mainMenuBar = Menu.buildFromTemplate(ObjMenus.data_menus)
  Menu.setApplicationMenu(ObjMenus.mainMenuBar)

  // On doit créer le fichier main.html
  // Utiliser "npm run start-update" pour actualiser le fichier
  if ( process.env.UPDATE_MAIN_HTML ) {
    console.log("Actualisation du fichier main.html…")
    MainBuild.build()
    console.log("Fichier main.html actualisé")
  }


  // Création de la fenêtre
  function createWindow () {

    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
    screenWidth   = width
    screenHeight  = height

    const windowOptions = {
        width: 1680
      , minWidth: 1200
      , height: 1000
      , x: 0
      , y: 0
      , icon: __dirname+'/Imagerie/Icone/Icone-1024x1024.icns'
      , title: app.name
      , webPreferences: {
          nodeIntegration: true
        }
    }

    // // Si on est sur Linux
    // if (process.platform === 'linux') {
    //   windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
    // }

    // On ouvre la fenêtre principale…
    mainWindow = new BrowserWindow(windowOptions)
    // Et on charge dedans le fichier principal

    // Chargement d'un fichier html
    mainWindow.loadURL(path.join('file://', __dirname, '/_side-front/xmain.html'))

    // Launch fullscreen with DevTools open, usage: npm run debug
    if (debug) {
      mainWindow.webContents.openDevTools()
      mainWindow.maximize()
      require('devtron').install()
    }

    // var dbMethod
    // if (process.env.FORCE_REBUILD_DB/* quand on utilise npm run update-db */) {
    //   // On force la reconstruction des tables (si elles sont définies)
    //   dbMethod = "MySql2.createTablesIfRequired(true)"
    // } else {
    //   // On checke pour voir si les tables existent
    //   dbMethod = "MySql2.checkTables()"
    //
    // }
    // mainWindow.webContents.executeJavaScript(dbMethod).then(res => console.log(res))

    // Quand on ferme la fenêtre, on détruit l'instance
    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  /**
    Quand l'application est prête, on créer la fenêtre
  **/
  app.on('ready', () => {
    createWindow()
  })

  /**
    Si toutes les fenêtres sont fermées, et qu'on n'est pas sur mac,
    on quitte l'application.
  **/
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  /**
    Quand on active l'application, on ne recrée une nouvelle instance
    de fenêtre que si elle a été détruite (sur mac, donc)
  **/
  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
}// /initialize

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
  if (process.mas) return

  app.requestSingleInstanceLock()

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// Require each JS file in the main-process dir
function loadMainProcessFiles () {
  const files = glob.sync(path.join(__dirname, '_side-back/js/**/*.js'))
  files.forEach((file) => { require(file) })
}

initialize()
