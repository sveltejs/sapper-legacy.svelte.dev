import fs from 'fs';
import path from 'path';
import process_markdown from './_process_markdown.js';
import marked from 'marked';
import hljs from 'highlight.js';

const langs = {
	'hidden-data': 'json',
	'html-no-repl': 'html'
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

		// syntax highlighting
		let uid = 0;
		const highlighted = {};

		const tweaked_content = content.replace(
			/```([\w-]+)?\n([\s\S]+?)```/g,
			(match, lang, code) => {
				const { value } = hljs.highlight(lang, code);
				highlighted[++uid] = value;

				return `@@${uid}`;
			}
		);

		const marked_html = marked(tweaked_content)
			.replace(/<p>@@(\d+)<\/p>/g, (match, id) => {
				return `<pre><code>${highlighted[id]}</code></pre>`;
			})
			.replace(/^\t+/gm, match => match.split('\t').join('  '));


		const subsections = [];
		const pattern = /<h3 id="(.+?)">(.+?)<\/h3>/g;

		const html = marked_html.replace(
			pattern, 
			(match, slug, title) => {
				title = unescape(title);
				subsections.push({ slug, title });
				return `<h3 id="${slug}"><a class="anchor" href="guide#${slug}"><svg viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><use href="#anchor-icon" /></svg></a>${title}</h3>`
			}
		);
	
		return {
			html,
			metadata,
			subsections,
			slug: file.replace(/^\d+-/, '').replace(/\.md$/, ''),
			file
		};
	});
