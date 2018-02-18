import { init } from 'sapper/runtime.js';
import { routes } from './manifest/client.js';

// `routes` is an array of route objects injected by Sapper
init(document.querySelector('#sapper'), routes);

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