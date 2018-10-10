import fs from 'fs';
import path from 'path';
import process_markdown from './_process_markdown.js';
import marked from 'marked';

import prismjs from 'prismjs'; // prism-highlighter – smaller footprint [hljs: 192.5k]
require('prismjs/components/prism-bash');
require('prismjs/components/prism-diff');

// console.log(Prism);

const langs = {
	'hidden-data': 'json',
	'html-no-repl': 'html'
};

// map lang to prism-language-attr
const prismLang = {
  bash: 'bash',
  html: 'markup',
  js: 'javascript',
  css: 'css',
  diff: 'diff',
};

function btoa(str) {
	return new Buffer(str).toString('base64');
}

const escaped = {
	'"': '&quot;',
	"'": '&#39;',
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;'
};

const unescaped = Object.keys(escaped).reduce(
	(unescaped, key) => ((unescaped[escaped[key]] = key), unescaped),
	{}
);

function unescape(str) {
	return String(str).replace(/&.+?;/g, match => unescaped[match] || match);
}

export default () => fs
	.readdirSync(`content/guide`)
	.filter(file => file[0] !== '.' && path.extname(file) === '.md')
	.map(file => {
		const markdown = fs.readFileSync(`content/guide/${file}`, 'utf-8');

		const { content, metadata } = process_markdown(markdown);

    // -----------------------------------------------
    // edit vedam
    // insert prism-highlighter (syntax highlighting)
    // -----------------------------------------------
		let uid = 0;
		const highlighted = {};

		const tweaked_content = content.replace(
			/```([\w-]+)?\n([\s\S]+?)```/g,
			(match, lang, code) => {
				let plang = prismLang[lang];
 
				const prismed = Prism.highlight(
          code,
          Prism.languages[plang],
          lang,
				);

				highlighted[++uid] = [ plang, prismed ];

				return `@@${uid}`;
			}
		);

		const html = marked(tweaked_content)
			.replace(/<p>@@(\d+)<\/p>/g, (match, id) => {
				let code = highlighted[id]
				return `<pre class='language-${code[0]}'><code>${code[1]}</code></pre>`;
			})
			.replace(/^\t+/gm, match => match.split('\t').join('  '));

		const subsections = [];
		const pattern = /<h3 id="(.+?)">(.+?)<\/h3>/g;
		let match;

		while ((match = pattern.exec(html))) {
			const slug = match[1];
			// const title = unescape(
			// 	match[2].replace(/<\/?code>/g, '').replace(/\.(\w+)\W.*/, '.$1')
			// );
			const title = unescape(match[2]);

			subsections.push({ slug, title });
		}

		return {
			html,
			metadata,
			subsections,
			slug: file.replace(/^\d+-/, '').replace(/\.md$/, ''),
			file
		};
	});
