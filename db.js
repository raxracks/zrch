const sqlite3   = require('sqlite3').verbose();
const db        = new sqlite3.Database('index.db');

db.createTables = function() {
        this.exec(`
CREATE TABLE IF NOT EXISTS pages(id INTEGER PRIMARY KEY, url TEXT NOT NULL UNIQUE, title TEXT);
CREATE VIRTUAL TABLE IF NOT EXISTS page_search USING fts5(url, title, content=pages, content_rowid=id);

CREATE TRIGGER IF NOT EXISTS pages_ai AFTER INSERT ON pages BEGIN
  INSERT INTO page_search(rowid, url, title) VALUES (new.id, new.url, new.title);
END;

CREATE TRIGGER IF NOT EXISTS pages_ad AFTER DELETE ON pages BEGIN
  INSERT INTO page_search(page_search, rowid, url, title) VALUES ('delete', old.id, old.url, old.title);
END;

CREATE TRIGGER IF NOT EXISTS pages_au AFTER UPDATE ON pages BEGIN
  INSERT INTO page_search(page_search, rowid, url, title) VALUES ('delete', old.id, old.url, old.title);
  INSERT INTO page_search(rowid, url, title) VALUES (new.id, new.url, new.title);
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
