const app       = require("express")();
const db        = require("./db");
const port      = process.env.PORT || 8080;

const sep       = `<br /><br />`;

function genListing(row) {
        return `<a href="${row.url}">
                        <span style="font-size: 1.5em">${row.title || row.url}</span>
                        <br />
                        <span style="font-size: 1em">${row.url}</span>
                </a>`;
}

function searchBar(query = "") {
        return `<form action="/search">
                        <input type="text" value="${query}" name="q" placeholder="search here!" />
                </form>`;
}

function offsetButton(query, offset, limit, text) {
        return `<a href="?q=${query}&o=${offset}&l=${limit}">${text}</a>`;
}

app.get("/", (req, res) => {
        res.send(searchBar());
});

app.get("/search", (req, res) => {
        const query     = req.query.q;
        const offset    = +req.query.o || 0;
        const limit     = +req.query.l || 50;
        const next      = offsetButton(query, offset + limit, limit, "Next");
        const prev      = offsetButton(query, offset - limit, limit, "Prev");
        const page      = (offset / limit) + 1; 

        db.all("SELECT url, title FROM page_search(?) ORDER BY rank LIMIT ?, ?", 
                req.query.q, offset, limit, (err, rows) => {
                res.send(`
                        ${searchBar(query)}
                        ${prev} ${page} ${next}
                        ${sep}
                        ${rows.map(genListing).join(sep)}
                        ${sep}
                        ${prev} ${page} ${next}
                `);
        });
});

app.listen(port, () => {
        console.log(`Running at http://127.0.0.1:${port}/`);
});
