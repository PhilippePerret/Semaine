'use strict'

const DB_DATA = {

  /**
    La table qui tient à jour les mots clés
  **/
  create_table_lois(){
    var request = `CREATE TABLE IF NOT EXISTS lois (
      id INT PRIMARY KEY AUTO_INCREMENT,
      theme_id      TINYINT UNSIGNED NOT NULL,
      subtheme_id   SMALLINT NOT NULL,
      FOREIGN KEY (theme_id, subtheme_id) REFERENCES subthemes(theme_id, id),
      numero        SMALLINT NOT NULL,
      content       TEXT NOT NULL,
      exemple       TEXT DEFAULT NULL,
      note          TEXT DEFAULT NULL,
      created_at    DATE,
      updated_at    DATE
) AUTO_INCREMENT=1 ;`
    MySql2.execute(request)
  }
  /**
    Table des thèmes (par exemple "Personnage", "Structure", etc.)
  **/
, create_table_themes(){
    // var request = `CREATE TABLE IF NOT EXISTS themes (
    var request = `CREATE TABLE themes (
      id        TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      numero    SMALLINT      UNIQUE NOT NULL,
      name      VARCHAR(100)  UNIQUE NOT NULL,
      options   VARCHAR(16)   DEFAULT ${this.defaultOptions},
      created_at    DATE,
      updated_at    DATE
) AUTO_INCREMENT=1 ;`
    MySql2.execute(request)
  }

/**
  Pour créer les tables, la première fois

  ATTENTION : cela supprimer toutes les données existantes, s'il y en a
**/
, CreateTables(){
  // MySql2.execute("DROP TABLE IF EXISTS themes;")
  // this.create_table_themes()
  // MySql2.execute("DROP TABLE IF EXISTS subthemes;")
  // this.create_table_subthemes()
  // MySql2.execute("DROP TABLE IF EXISTS lois;")
  // this.create_table_lois()
  // MySql2.execute("DROP TABLE IF EXISTS keywords;")
  // this.create_table_keywords()
  // MySql2.execute("DROP TABLE IF EXISTS connected_lois;")
  // this.create_table_connected_lois()
  // MySql2.execute("DROP TABLE IF EXISTS lois_keywords;")
  // this.create_table_lois_keywords()
  // MySql2.execute("DROP TABLE IF EXISTS general_data;")
  // this.create_table_general_data()
}

}// /DB_DATA

// Décommenter cette ligne pour créer les tables
// (il faut aussi décommenter ci-dessus dans la fonction)
// DB_DATA.CreateTables()
