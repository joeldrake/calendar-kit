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
