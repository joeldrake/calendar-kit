import { browser } from '$app/env';
import { writable } from 'svelte/store';
import { defaultCustomDates } from '$lib/defaultCustomDates';
import { getFiles } from '$lib/utils/db';
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

export function getMonths(lang?: string) {
	return Array.from({ length: 12 }, (_, i) =>
		getFriendlyMonth(new Date(2022, i), lang)
	);
}

export function getWeekdays(lang?: string) {
	const monday = getFirstDayOfWeek();
	return Array.from({ length: 7 }, (_, i) => {
		const day = changeDays(monday, i);
		return getFriendlyWeekday(day, lang);
	});
}

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
	weekdays: getWeekdays('sv'),
	months: getMonths('sv')
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

// UTILS

export function getFriendlyMonth(date: Date, forceLang?: string) {
	const dateOptions: Intl.DateTimeFormatOptions = {
		month: 'long'
	};
	const lang = forceLang || getLang();
	return new Intl.DateTimeFormat(lang, dateOptions).format(date);
}

export function getFriendlyWeekday(date: Date, forceLang?: string) {
	const dateOptions: Intl.DateTimeFormatOptions = {
		weekday: 'short'
	};
	const lang = forceLang || getLang();

	return new Intl.DateTimeFormat(lang, dateOptions).format(date);
}

function getLang() {
	const savedStore = browser && localStorage.getItem('store');
	return savedStore ? (JSON.parse(savedStore).lang as string) || 'sv' : 'sv';
}

function getFirstDayOfWeek() {
	const date = new Date();
	const day = date.getDay(); // 👉️ get day of week

	// 👇️ day of month - day of week (-6 if Sunday), otherwise +1
	const diff = date.getDate() - day + (day === 0 ? -6 : 1);

	return new Date(date.setDate(diff));
}

export function changeDays(date: Date, days: number) {
	const oneDay = 1000 * 3600 * 24;
	const newDateInMilliseconds = date.getTime() + days * oneDay;

	return new Date(newDateInMilliseconds);
}
