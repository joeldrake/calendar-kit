import { browser } from '$app/env';
import { writable } from 'svelte/store';
import { defaultCustomDates } from '$lib/defaultCustomDates';
import { getFiles } from '$lib/utils/db';
import { getMonthsFriendly } from './utils/dateHelper';

export const files = writable([] as File[]);

getFiles();

const genericMargins = [-14, -22, -16, -9, -8, -5, -8, -17, -15, -18, -16, -15];
// const personalMargins = [
// 	-34, // 'Januari'
// 	-29, // 'Februari'
// 	-16, // 'Mars'
// 	-47, // 'April'
// 	-49, // 'Maj'
// 	-38, // 'Juni'
// 	-37, // 'Juli'
// 	-38, // 'Augusti'
// 	-26, // 'September'
// 	-18, // 'Oktober'
// 	-28, // 'November'
// 	-33 // 'December'
// ];

const months = new Array(12)
	.fill(null)
	.map((_, i) => (browser ? getMonthsFriendly(new Date(2022, i)) : null));

export const storeDefault = {
	lang: 'sv',
	year: 2022,
	settingsOpen: false,
	settingsWidth: '33vw',
	showWeekNumbers: true,
	showSliders: false,
	customDates: defaultCustomDates,
	imageHeight: 33,
	imageMargins: genericMargins,
	months
	// months: [
	// 	'Januari',
	// 	'Februari',
	// 	'Mars',
	// 	'April',
	// 	'Maj',
	// 	'Juni',
	// 	'Juli',
	// 	'Augusti',
	// 	'September',
	// 	'Oktober',
	// 	'November',
	// 	'December'
	// ]
};

let savedStore;
if (browser) {
	savedStore = localStorage.getItem('store');
}

export const store = writable(
	typeof savedStore === 'string'
		? (JSON.parse(savedStore) as typeof storeDefault)
		: storeDefault
);

store.subscribe((value) => {
	if (browser) {
		localStorage.setItem('store', JSON.stringify(value));
	}
});
