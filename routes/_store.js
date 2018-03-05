import { Store } from 'svelte/store.js';

const store = new Store({
	guide_contents: []
});

// bit of a hack — we wait for global.fetch to have been created
// so that this works on the server...
setTimeout(() => {
	fetch(`/guide-contents.json`).then(r => r.json()).then(guide_contents => {
		store.set({ guide_contents });
	});
});

export default store;