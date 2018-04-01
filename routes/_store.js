import { Store } from 'svelte/store.js';

const store = new Store({
	guide_contents: []
});

if (process.browser) {
	fetch(`guide-contents.json`).then(r => r.json()).then(guide_contents => {
		store.set({ guide_contents });
	});
}

export default store;