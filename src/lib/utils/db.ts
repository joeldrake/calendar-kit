import { browser } from '$app/env';
import { files } from '$lib/store';

export function openDb(name: string, version = 1): Promise<IDBDatabase | null> {
	return new Promise((resolve, reject) => {
		if (!browser || !window.indexedDB) reject();

		const request = indexedDB.open(name, version);
		request.onupgradeneeded = onupgradeneeded;
		request.onsuccess = () => resolve(request.result);
		request.onerror = (e) => {
			console.error(e);
			reject();
		};
	});
}

function onupgradeneeded(event: IDBVersionChangeEvent) {
	const conn = (event.target as IDBOpenDBRequest).result;
	conn.createObjectStore('store');
}

// Handle file uploader change event
export async function saveFiles(newFiles?: File[]) {
	if (!browser) return;
	const conn = await openDb('images');
	if (!conn) return;
	await new Promise((resolve, reject) => {
		const tx = conn.transaction('store', 'readwrite');
		tx.oncomplete = resolve;
		tx.onerror = () => reject(new Error('file storage error'));

		const store = tx.objectStore('store');

		store.clear();
		files.set(newFiles || []);

		if (newFiles?.length) {
			for (const [id, file] of Object.entries(newFiles.slice(0, 12))) {
				store.put(file, Number(id));
			}
		}
	});
	conn.close();
}

export async function saveFile(file: File, id: number) {
	if (!browser) return;
	const conn = await openDb('images');
	if (!conn) return;
	await new Promise((resolve, reject) => {
		const tx = conn.transaction('store', 'readwrite');
		tx.oncomplete = resolve;
		tx.onerror = () => reject(new Error('file storage error'));

		const store = tx.objectStore('store');

		files.update((current) => {
			current[id] = file;
			return current;
		});

		store.put(file, id);
	});
	conn.close();
}

export async function getFiles() {
	if (!browser) return;
	const conn = await openDb('images');
	if (!conn) return;
	await new Promise((resolve, reject) => {
		const tx = conn.transaction('store', 'readwrite');

		tx.onerror = () => reject(new Error('file storage error'));
		const images_store = tx.objectStore('store');
		const images_request = images_store.getAll();
		images_request.onsuccess = () => {
			const images = (images_request.result as File[]) || ([] as File[]);
			//if (images.length) images.sort((a, b) => a.id - b.id);
			//images = images.map((item) => item.file);
			files.set(images || []);
		};
	});
	conn.close();
}
