import { get } from 'svelte/store';
import { store } from '$lib/store';

export const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

export function getDaysInMonth(month: number, year: number) {
	return new Date(year, month + 1, 0).getDate();
}

export function getDaysBeforeFirstMonday(date: Date) {
	const day = date.getDay();
	return day - (day === 0 ? -6 : 1);
}

export function getDateFriendly(date: Date, onlyNumber?: boolean) {
	const dateOptions: Intl.DateTimeFormatOptions = {
		day: 'numeric'
	};
	if (!onlyNumber) dateOptions.month = 'short';

	return new Intl.DateTimeFormat(get(store).lang, dateOptions)
		.format(date)
		.replace('.', '');
}

export function changeDays(date: Date, days: number) {
	const oneDay = 1000 * 3600 * 24;
	const newDateInMilliseconds = date.getTime() + days * oneDay;

	return new Date(newDateInMilliseconds);
}

export function getWeek(date: Date) {
	date.setHours(0, 0, 0, 0);
	// Thursday in current week decides the year.
	date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
	// January 4 is always in week 1.
	const week1 = new Date(date.getFullYear(), 0, 4);
	// Adjust to Thursday in week 1 and count number of weeks from date to week1.
	return (
		1 +
		Math.round(
			((date.getTime() - week1.getTime()) / 86400000 -
				3 +
				((week1.getDay() + 6) % 7)) /
				7
		)
	);
}

export function isToday(date: Date) {
	const todayDate = new Date();

	return (
		date.getDate() === todayDate.getDate() &&
		date.getMonth() === todayDate.getMonth() &&
		date.getFullYear() === todayDate.getFullYear()
	);
}

export function isWeekend(date: Date) {
	return date.getDay() == 6 || date.getDay() == 0;
}

/** Example return: "2021-04-15" */
export function standardDate(date: Date) {
	return new Intl.DateTimeFormat('sv-SE').format(date);
}
