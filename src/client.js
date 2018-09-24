import { init } from 'sapper/runtime.js';
import { manifest } from './manifest/client.js';
import { Store } from 'svelte/store.js';

init({
	target: document.querySelector('#sapper'),
	manifest,
	store: state => {
		return new Store(state);
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