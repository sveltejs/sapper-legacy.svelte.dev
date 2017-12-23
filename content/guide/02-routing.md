---
title: Routing
---

As we've seen, there are two types of route in Sapper — pages, and server routes.


### Pages

Pages are Svelte components written in `.html` files. When a user first visits the application, they will be served a server-rendered version of the route in question, plus some JavaScript that 'hydrates' the page and initialises a client-side router. From that point forward, navigating to other pages is handled entirely on the client for a fast, app-like feel. (Sapper will preload and cache the code for these subsequent pages, so that navigation is instantaneous.)

For example, here's how you could create a page that renders a blog post:

```html
<!-- routes/blog/[slug].html -->
<:Head>
	<title>{{post.title}}</title>
</:Head>

<h1>{{post.title}}</h1>

<div class='content'>
	{{{post.html}}}
</div>

<script>
	export default {
		// the preload function takes a `{ params, query }`
		// object and turns it into the data we need to
		// render the page
		preload({ params, query }) {
			// the `slug` parameter is available because this file
			// is called [slug].html
			const { slug } = params;

			return fetch(`/api/blog/${slug}`).then(r => r.json()).then(post => {
				return { post };
			});
		}
	};
</script>
```

### Server routes

Server routes are modules written in `.js` files that export functions corresponding to HTTP methods. Each function receives Express `request` and `response` objects as arguments, plus a `next` function. This is useful for creating a JSON API. For example, here's how you could create an endpoint that served the blog page above:

```js
// routes/api/blog/[slug].js
import db from './_database.js'; // the underscore tells Sapper this isn't a route

export async function get(req, res, next) {
	// the `slug` parameter is available because this file
	// is called [slug].js
	const { slug } = req.params;

	const post = await db.get(slug);

	if (post !== null) {
		res.set('Content-Type', 'application/json');
		res.end(JSON.stringify(post));
	} else {
		next();
	}
}
```

There are three simple rules for naming the files that define your routes:

* A file called `routes/about.html` corresponds to the `/about` route. A file called `routes/blog/[slug].html` corresponds to the `/blog/:slug` route, in which case `params.slug` is available to the route
* The file `routes/index.html` (or `routes/index.js`) corresponds to the root of your app. `routes/about/index.html` is treated the same as `routes/about.html`.
* Files and directories with a leading underscore do *not* create routes. This allows you to colocate helper modules and components with the routes that depend on them — for example you could have a file called `routes/_helpers/datetime.js` and it would *not* create a `/_helpers/datetime` route