---
title: Preloading
---

As seen in the [routing](#routing) section, top-level page components can have a `preload` function that will load some data that the page depends on. This is similar to `getInitialProps` in Next.js or `asyncData` in Nuxt.js.

```html
<script>
	export default {
		preload({ params, query }) {
			const { slug } = params;

			return fetch(`/blog/${slug}.json`).then(r => r.json()).then(post => {
				return { post };
			});
		}
	};
</script>
```

Your `preload` function is optional; whether or not you include it, the component will have access to the `query` and `params` objects, on top of any [default data](https://svelte.technology/guide#default-data) specified with a `data` property.


### Argument

When `preload` runs in the **browser**, the argument is a `{ params, query }` object where `params` is derived from the URL and the route filename, and `query` is an object of values in the query string.

So if the example above was `routes/blog/[slug].html` and the URL was `/blog/some-post?foo=bar&baz`, the following would be true:

* `params.slug === 'some-post'`
* `query.foo === 'bar'`
* `query.baz === true`

When `preload` runs on the **server**, the argument is the entire `Request` object, which includes `params` and `query`. This is useful if you're using session middleware such as [express-session](https://github.com/expressjs/session) as it allows you to render a page for a specific user, for example:

```html
<script>
	import * as auth from './_auth.js'; // handles client-side auth

	export default {
		preload({ params, session }) {
			// on the server, use the session object
			// on the client, maintain auth state separately
			const user = session ? session.user : auth.user;

			return {
				user
			};
		}
	};
</script>
```


### Return value

If you return a Promise from `preload`, the page will delay rendering until the promise resolves. You can also return a plain object.

When Sapper renders a page on the server, it will attempt to serialize the resolved value and include it on the page, so that the client doesn't also need to call `preload` upon initialization. Serialization will fail if the value includes circular references, or things that aren't POJOs (plain old JavaScript objects) such as instances of `Map` and `Set` or custom classes.



### Error handling and redirects

Inside `preload`, you have access to two methods:

* `this.error(statusCode, error)`
* `this.redirect(statusCode, location)`


#### Handling errors

If the user navigated to `/blog/some-invalid-slug`, we would want to render a 404 Not Found page. We can do that with `this.error`:

```html
<script>
	export default {
		preload({ params, query }) {
			const { slug } = params;

			return fetch(`/blog/${slug}.json`).then(r => {
				// assume all responses are either 200 or 404
				if (r.status === 200) {
					return r.json().then(post => {
						return { post };
					});
				} else {
					this.error(404, 'Not found');
				}
			});
		}
	};
</script>
```

The same applies to other error codes you might encounter.


#### Redirecting

You can abort rendering and redirect to a different location with `this.redirect`:

```html
<script>
	import * as auth from './_auth.js'; // handles client-side auth

	export default {
		preload({ params, session }) {
			// on the server, use the session object
			// on the client, maintain auth state separately
			const user = session ? session.user : auth.user;

			if (!user) {
				return this.redirect(302, '/login');
			}

			return {
				user
			};
		}
	};
</script>
```