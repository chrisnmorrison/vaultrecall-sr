export function localDateString(date: Date = new Date()): string {
	const year = date.getFullYear();
	const monthNumber = date.getMonth() + 1;
	const dayNumber = date.getDate();
	const month = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;
	const day = dayNumber < 10 ? `0${dayNumber}` : `${dayNumber}`;
	return `${year}-${month}-${day}`;
}

export function addLocalDays(days: number, date = new Date()): Date {
	const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	next.setDate(next.getDate() + days);
	return next;
}
