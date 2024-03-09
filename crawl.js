const cheerio   = require('cheerio');
const db        = require("./db");
const queue     = require("./queue");

db.createTables();

if(!process.argv[2]) {
        db.get("SELECT id, url FROM pages ORDER BY id DESC LIMIT 1", (err, row) => {
                crawl(row.url, true);
        });
} else {
        crawl(process.argv[2]);
}

async function crawl(url, ignoreExisting = false) { 
        if(!!await db.promiseGet("SELECT url FROM pages WHERE url = ?", url) && !ignoreExisting)
                return;

        await(queue());

        try {
                const res = await fetch(url);
                console.log(`[${res.status} ${res.statusText}] ${url}`); 
                
                if(res.status == 200) {
                        const $         = cheerio.load(await res.text());
                        const title     = $("title").text();
        
                        console.log(`[TITLE] ${title} (${url})`);
                        
                        db.run(`INSERT INTO pages(url, title) 
                                VALUES(?, ?)`, url, title, (err) => {
                                if(err) {
                                        console.log(`[INSERT FAIL: ${err}] ${url}|${title}`);
                                } else {
                                        console.log(`[INSERT] ${url}|${title}`);             
                                }
                        });

                        for await (const anchor of $("a")) {
                                const href = $(anchor).attr("href");
                                crawl(new URL(href, url).href);
                        }
                }
        } catch(e) {
                console.log(`[FETCH FAIL] Fail for ${url}`); 
        }
}
