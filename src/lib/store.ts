import { browser } from '$app/env';
import { writable } from 'svelte/store';
import { defaultCustomDates } from '$lib/defaultCustomDates';

export const defaultImageHeight = 33;
export const defaultImageMargins = [
	-20, // 'Januari'
	-20, // 'Februari'
	-20, // 'Mars'
	-20, // 'April'
	-20, // 'Maj'
	-20, // 'Juni'
	-20, // 'Juli'
	-20, // 'Augusti'
	-20, // 'September'
	-20, // 'Oktober'
	-20, // 'November'
	-20 // 'December'
];
let savedDates, savedImageHeight, savedImageMargins;
if (browser) {
	savedDates = localStorage.getItem('customDates');
	savedImageHeight = localStorage.getItem('imageHeight');
	savedImageMargins = localStorage.getItem('imageMargins');
}

export const customDates = writable(
	typeof savedDates === 'string' ? savedDates : defaultCustomDates
);

export const imageHeight = writable(
	typeof savedImageHeight === 'string'
		? Number(savedImageHeight)
		: defaultImageHeight
);

export const imageMargins = writable(
	typeof savedImageMargins === 'string'
		? JSON.parse(savedImageMargins)
		: defaultImageMargins
);
