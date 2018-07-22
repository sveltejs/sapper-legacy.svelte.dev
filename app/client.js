import { init } from 'sapper/runtime.js';
import { routes } from './manifest/client.js';
import { Store } from 'svelte/store.js';

// `routes` is an array of route objects injected by Sapper
init({
	target: document.querySelector('#sapper'),
	routes,
	store: state => {
		const store = new Store(state);

		fetch(`guide-contents.json`).then(r => r.json()).then(guide_contents => {
			store.set({ guide_contents });
		});

		return store;
	}
});

if (navigator.serviceWorker && navigator.serviceWorker.controller) {
	navigator.serviceWorker.controller.onstatechange = function(e) {
		if (e.target.state === 'redundant') {
			import('./components/Toast.html').then(mod => {
				mod.default.show();
			});
		}
	};
}

if (module.hot) module.hot.accept();