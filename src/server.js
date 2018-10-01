import express from 'express';
import compression from 'compression';
import serve from 'serve-static';
import { Store } from 'svelte/store.js';
import * as sapper from '../__sapper__/server.js';
import guide_sections from './routes/guide/_sections.js';

const guide_contents = guide_sections().map(section => {
	return {
		metadata: section.metadata,
		subsections: section.subsections,
		slug: section.slug
	};
})

express()
	.use(
		compression({ threshold: 0 }),
		serve('static'),
		sapper.middleware({
			store: () => new Store({
				guide_contents
			})
		})
	)
	.listen(process.env.PORT);