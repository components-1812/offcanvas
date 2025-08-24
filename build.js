import esbuild from "esbuild";
import {minify} from "html-minifier-terser";
import path from "node:path";
import fs from "node:fs";


const SOURCE = path.resolve(import.meta.dirname, 'src');
const OUTPUT = path.resolve(import.meta.dirname, 'dist');

const BUILD_ENTRIES = [
    {   
        name: 'Offcanvas.min.js',
        options: {
            entryPoints: [path.join(SOURCE, 'Offcanvas.js')],
            minify: true,
            sourcemap: false,
            target: 'esnext',
            outfile: path.join(OUTPUT, 'Offcanvas.min.js'),
            plugins: [ minifyHTML() ]
        }
    },
    {
        name: 'Offcanvas.min.css',
        options: {
            entryPoints: [path.join(SOURCE, 'Offcanvas.css')],
            minify: true,
            outfile: path.join(OUTPUT, 'Offcanvas.min.css'),
        }
    },
    {
        name: 'OffcanvasBase.min.js',
        options: {
            entryPoints: [path.join(SOURCE, 'OffcanvasBase.js')],
            minify: true,
            sourcemap: false,
            target: 'esnext',
            outfile: path.join(OUTPUT, 'OffcanvasBase.min.js'),
            plugins: [ minifyHTML() ]
        }
    },
    {   
        name: 'index.js',
        options: {
            entryPoints: [path.join(SOURCE, 'index.js')],
            bundle: true,
            minify: true,
            sourcemap: false,
            target: 'esnext',
            outfile: path.join(OUTPUT, 'index.min.js'),
            plugins: [rawCSSLoader(), minifyHTML()]
        }
    },
];

// Asegurarse de que dist exista
if(!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT);

for(const {name, options} of BUILD_ENTRIES) {
    
    try {
        await esbuild.build(options);

        console.log(`Build success: ${name}`);
    } 
    catch (error) {

        console.log(error);
    }
}



//MARK: Plugins
/**
 *  Support for import ?raw from '.css'
 *  Load the css file and minify it
 */
function rawCSSLoader(){

    return {
        name: 'raw-css-loader',
        setup(build) {

            build.onResolve({ filter: /\.css\?raw$/  }, (args) => {

                return {
                    path: path.resolve(args.resolveDir, args.path.replace('?raw','')),
                    namespace: 'raw-file'
                };
            });

            build.onLoad({ filter: /.*/, namespace: 'raw-file' }, async (args) => {

                const content = await fs.promises.readFile(args.path, 'utf8');

                // Minify the CSS using esbuild transform API
                const { code } = await esbuild.transform(content, {
                    loader: "css",
                    minify: true
                });

                return {
                    contents: `export default ${JSON.stringify(code)};`,
                    loader: 'js'
                };
            });
        }
    };
};

/**
 *  Minify the HTML inside the JavaScript string literals using the html-minifier library
 */
export function minifyHTML() {

    const HTML_REGEX = /\/\*html\*\/\s*`([\s\S]*?)`/g;
    const SVG_REGEX = /\/\*svg\*\/\s*`([\s\S]*?)`/g;

    async function minifyContents(regex,contents) {

        const matchs = [...contents.matchAll(regex)];

        if(matchs.length === 0) return contents;

        for(const match of matchs) {
            
            const [_, html] = match;


            const minified = await minify(html, {
                removeComments: true,
                collapseWhitespace: true,
                collapseInlineTagWhitespace: true,
                removeAttributeQuotes: true,
                collapseBooleanAttributes: true,
            });

            contents = contents.replace('`' + html + '`', '`' + minified + '`');
        }

        return contents;
    }


    return {
        name: 'html-minify',
        setup(build) {
            
            build.onLoad({ filter: /\.js$/ }, async (args) => {

                const fs = await import('node:fs/promises')
                let contents = await fs.readFile(args.path, 'utf8');

                contents = await minifyContents(HTML_REGEX, contents);
                contents = await minifyContents(SVG_REGEX, contents);

                return { contents, loader: 'default' }
            })
        }
    }
}

