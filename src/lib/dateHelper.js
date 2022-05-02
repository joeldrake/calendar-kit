export function getDaysInMonth(month, year) {
	return new Date(year, month + 1, 0).getDate();
}

export function getDaysBeforeFirstMonday(date) {
	const day = date.getDay();
	return day - (day === 0 ? -6 : 1);
}

export function getDateFriendly(date) {
	let dateOptions = {
		day: 'numeric',
		month: 'short'
	};

	return new Intl.DateTimeFormat('sv', dateOptions)
		.format(date)
		.replace('.', '');
}

export function changeDays(date, days) {
	const oneDay = 1000 * 3600 * 24;
	const newDateInMilliseconds = date.getTime() + days * oneDay;

	return new Date(newDateInMilliseconds);
}

export function getWeek(date) {
	date.setHours(0, 0, 0, 0);
	// Thursday in current week decides the year.
	date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
	// January 4 is always in week 1.
	let week1 = new Date(date.getFullYear(), 0, 4);
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
