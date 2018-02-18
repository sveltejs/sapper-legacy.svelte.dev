import { Store } from 'svelte/store.js';

const store = new Store({
	guide_contents: []
});

if (typeof fetch !== 'undefined') {
	fetch(`/api/guide-contents`).then(r => r.json()).then(guide_contents => {
		store.set({ guide_contents });
	});
}

export default store;