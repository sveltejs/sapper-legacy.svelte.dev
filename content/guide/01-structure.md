---
title: Sapper app structure
---

This section is a reference for the curious. We recommend you play around with the project template first, and come back here when you've got a feel for how things fit together.

If you take a look inside the [sapper-template](https://github.com/sveltejs/sapper-template) repo, you'll see some files that Sapper expects to find:

```bash
├ package.json
├ server.js
├ webpack.client.config.js
├ webpack.server.config.js
├ assets
│ ├ # your files here
├ routes
│ ├ # your routes here
├ templates
│ ├ 2xx.html
│ ├ 4xx.html
│ ├ 5xx.html
│ ├ main.js
│ └ service-worker.js
```

You'll notice a few extra files and a `cypress` directory which relates to [testing](#testing) — we don't need to worry about those right now.

> You *can* create these files from scratch, but it's much better to use the template. See [getting started](#getting-started) for instructions on how to easily clone it


### package.json

Your package.json contains your app's dependencies, including `sapper`, and defines a number of scripts:

* `npm run dev` — start the app in development mode, and watch source files for changes
* `npm run build` — build the app in production mode
* `npm start` — start the app in production mode after you've built it
* `npm test` — run the tests (see [testing](#testing))


### server.js

This is a normal Express app, with two requirements:

* it should serve the contents of the `assets` folder, using for example [serve-static](https://github.com/expressjs/serve-static)
* it should call `app.use(sapper())` at the end

Beyond that, you can write the server however you like.

### webpack.[type].config.js

Sapper uses [webpack](https://webpack.js.org/) to bundle your app. There are two config files, one for the client, one for the server. You probably won't need to change the config, but if you want to (for example to add new loaders or plugins), you can.


### assets

This is a place to put any files that your app uses — fonts, images and so on. For example `assets/favicon.png` will be served as `/favicon.png`.

Sapper doesn't serve these assets — you'd typically use [serve-static](https://github.com/expressjs/serve-static) for that — but it will read the contents of the `assets` folder so that you can easily generate a cache manifest for offline support (see [service-worker.js](#templates-service-worker-js)).


### routes

This is the meat of your app — the pages and server routes. See the section on [routing](#routing) for the juicy details.


### templates/xxx.html

In here, you put HTML files corresponding to the possible responses Sapper can generate:

* `2xx.html` — everything working as planned
* `4xx.html` — client error (e.g. 404 Not Found)
* `5xx.html` — server error (e.g. 500 Internal Server Error)

Each file will contain placeholder tags, like `%sapper.html%`, which Sapper will fill in with data. The possible values for 2xx responses are:

* `%sapper.styles%` — critical CSS for the page being requested
* `%sapper.head%` — HTML representing page-specific `<head>` contents, like `<title>`
* `%sapper.html%` — HTML representing the body of the page being rendered
* `%sapper.scripts%` — script tags for the client-side app

For 4xx responses:

* `%sapper.status%` — the HTTP status code
* `%sapper.title%` — the name of the error
* `%sapper.method%` — the HTTP method, e.g. GET or POST
* `%sapper.url%` — the requested URL
* `%sapper.scripts%` — script tags for the client-side app

For 5xx responses:

* `%sapper.status%` — as above
* `%sapper.title%` — as above
* `%sapper.error%` — the text of the error
* `%sapper.stack%` — a stack trace


### templates/main.js

The entry module for the client-side app. This *must* import, and call, the `init` function from `sapper/runtime/app.js`:

```js
import { init } from 'sapper/runtime/app.js';
init(document.querySelector('#sapper'), __routes__);
```

In many cases, that's the entirety of your entry module, though you can do as much or as little here as you wish. See the [runtime API](#runtime-api) section for more information on functions you can import.

The `__routes__` variable is injected by Sapper.


### templates/service-worker.js

Service workers act as proxy servers that give you fine-grained control over how to respond to network requests. For example, when the browser requests `/goats.jpg`, the service worker can respond with a file it previously cached, or it can pass the request on to the server, or it could even respond with something completely different, such as a picture of llamas.

Among other things, this makes it possible to build applications that work offline.

Because every app needs a slightly different service worker (sometimes it's appropriate to always serve from the cache, sometimes that should only be a last resort in case of no connectivity), Sapper doesn't attempt to control the service worker. Instead, you write the logic in `service-worker.js`, and Sapper injects the following variables:

* `__assets__` — an array of files found in the `assets` directory
* `__shell__` — the client-side JavaScript generated by webpack, plus an empty `index.html` file created from `2xx.html` that you can use to bypass server-side rendering if you wish
* `__routes__` — an array of `{ pattern: RegExp }` objects you can use to determine whether a Sapper-controlled page is being requested
