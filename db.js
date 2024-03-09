const sqlite3   = require('sqlite3').verbose();
const db        = new sqlite3.Database('index.db');

db.createTables = function() {
        this.exec(`
CREATE TABLE IF NOT EXISTS pages(id INTEGER PRIMARY KEY, url TEXT NOT NULL UNIQUE, title TEXT, text TEXT);
CREATE VIRTUAL TABLE IF NOT EXISTS page_search USING fts5(url, title, text, content=pages, content_rowid=id);

CREATE TRIGGER IF NOT EXISTS pages_ai AFTER INSERT ON pages BEGIN
  INSERT INTO page_search(rowid, url, title, text) VALUES (new.id, new.url, new.title, new.text);
END;

CREATE TRIGGER IF NOT EXISTS pages_ad AFTER DELETE ON pages BEGIN
  INSERT INTO page_search(page_search, rowid, url, title, text) VALUES ('delete', old.id, old.url, old.title, old.text);
END;

CREATE TRIGGER IF NOT EXISTS pages_au AFTER UPDATE ON pages BEGIN
  INSERT INTO page_search(page_search, rowid, url, title, text) VALUES ('delete', old.id, old.url, old.title, old.text);
  INSERT INTO page_search(rowid, url, title, text) VALUES (new.id, new.url, new.title, new.text);
END;
        `);
        console.log("[SQL] Tables created.");
}

db.promiseGet = function() {
        return new Promise((res, rej) => {
                this.get(...arguments, (err, row) => {
                        if(err) rej(err);
                        res(row);
                });
        });
}

module.exports = db;
