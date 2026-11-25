/**
 * Writes build/404.html: the app shell with a "not found" title and noindex.
 * vercel.json serves it with HTTP 404 for any path that isn't a known route
 * or a built file. The SPA then boots and renders the NotFound route.
 * Any failure fails the build.
 */
const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "..", "build");
const TEMPLATE_PATH = path.join(BUILD_DIR, "index.html");

const fail = (msg) => {
	console.error(`write-404: ${msg}`);
	process.exit(1);
};

if (!fs.existsSync(TEMPLATE_PATH)) fail(`missing ${TEMPLATE_PATH} (run the build first)`);

let html = fs.readFileSync(TEMPLATE_PATH, "utf8");
html = html.replace(/<title>[\s\S]*?<\/title>/, "");
html = html.replace(/<(?:meta|link)\b[^>]*\bdata-rh="true"[^>]*>/g, "");
if (/data-rh="true"/.test(html)) fail("template still has data-rh tags after stripping");
if (!html.includes("</head>")) fail("template has no </head>");
html = html.replace(
	"</head>",
	'<title data-rh="true">Page not found | Glowra</title><meta data-rh="true" name="robots" content="noindex"/></head>'
);

const rootTag = '<div id="root"></div>';
if (!html.includes(rootTag)) fail(`template has no empty ${rootTag}`);
html = html.replace(
	rootTag,
	'<div id="root"><main><h1>Page not found</h1><p><a href="/">Go to the Glowra home page</a></p></main></div>'
);

fs.writeFileSync(path.join(BUILD_DIR, "404.html"), html, "utf8");
console.log("Wrote build/404.html");
