import * as sapper from '../__sapper__/client.js';
import { Store } from 'svelte/store.js';

sapper.start({
	target: document.querySelector('#sapper'),
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