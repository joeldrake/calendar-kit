<script>
	import {
		getDaysInMonth,
		getDateFriendly,
		getDaysBeforeFirstMonday
	} from '$lib/dateHelper.js';
	import { dataset_dev } from 'svelte/internal';

	const year = 2021;

	const months = [
		'Januari',
		'Februari',
		'Mars',
		'April',
		'Maj',
		'Juni',
		'Juli',
		'Augusti',
		'September',
		'Oktober',
		'November',
		'December'
	];

	const imageMargins = [
		'-20', // 'Januari'
		'-50', // 'Februari'
		'-40', // 'Mars'
		'-20', // 'April'
		'-20', // 'Maj'
		'-20', // 'Juni'
		'-20', // 'Juli'
		'-20', // 'Augusti'
		'-20', // 'September'
		'-20', // 'Oktober'
		'-20', // 'November'
		'-20' // 'December'
	];

	const presetDates = [
		{ date: '5 jan', text: 'Trettondags&shy;afton' },
		{ date: '6 jan', text: 'Trettonde&shy;dag jul', textRed: true },
		{ date: '17 jan', text: 'Karins födelsedag 🎉', textRed: true },
		{ date: '14 feb', text: 'Alla hjärtans dag ❤️' },
		{ date: '14 apr', text: 'Skärtorsdagen<br>🥚' },
		{ date: '15 apr', text: 'Långfredagen<br>🐣', textRed: true },
		{ date: '16 apr', text: 'Påskafton<br>🐥' },
		{ date: '17 apr', text: 'Påskdagen<br>🐓', textRed: true },
		{ date: '18 apr', text: 'Annandag påsk<br>🍗', textRed: true },
		{ date: '30 apr', text: 'Valborgs&shy;mässo&shy;afton 🍻' },
		{ date: '1 maj', text: 'Första maj', textRed: true },
		{ date: '27 maj', text: 'Kristi himmelsfärd', textRed: true },
		{
			date: '24 juni',
			text: 'Celines födelsedag 🎉<br>Midsommar&shy;afton',
			textRed: true
		},
		{ date: '25 juni', text: 'Midsommar&shy;dagen', textRed: true },
		{ date: '4 juni', text: 'Pingstafton' },
		{ date: '5 juni', text: 'Pingstdagen', textRed: true },
		{ date: '6 juni', text: 'Nationaldagen 🇸🇪', textRed: true },
		{ date: '20 maj', text: 'Joels födelsedag 🎉', textRed: true },
		{ date: '4 nov', text: 'Allhelgona&shy;afton 👻 ' },
		{ date: '5 nov', text: 'Alla helgons dag 👻', textRed: true },
		{ date: '24 dec', text: 'Julafton 🎅🏻' },
		{ date: '25 dec', text: 'Juldagen 🎁', textRed: true },
		{ date: '26 dec', text: 'Annandag jul', textRed: true },
		{ date: '31 dec', text: 'Nyårsafton 🎆' }
	];

	let calendar = { [year]: [] };

	for (let month = 0; month < 12; month++) {
		calendar[year].push([]);

		const daysInMonth = getDaysInMonth(month, year);

		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, month, day, 12);

			const dateFriendly = getDateFriendly(date);

			let label = dateFriendly;
			if (day !== 1) label = label.split(' ')[0];

			let findDate = presetDates.find((d) => {
				return d.date === dateFriendly;
			});
			let text, textRed;
			if (findDate) {
				text = findDate.text;
				if (findDate.textRed) textRed = true;
			}

			if (day === 1) {
				const daysBeforeFirstMonday = getDaysBeforeFirstMonday(date);
				if (daysBeforeFirstMonday > 0) {
					for (
						let extraDay = 1;
						extraDay <= daysBeforeFirstMonday;
						extraDay++
					) {
						calendar[year][month].push({
							isPlaceholder: true
						});
					}
				}
			}

			calendar[year][month].push({
				date,
				label,
				text,
				textRed
			});
		}
	}
</script>

<!-- <pre>
{JSON.stringify(calendar,null,2)}
</pre> -->

{#each calendar[year] as month, i}
	<div class="month">
		<div class="image">
			<img
				src={`/images/${1}.JPG`}
				style={`margin-top:${imageMargins[i]}%`}
				alt=""
			/>
		</div>
		<div class="month-headline">{months[i]} {year}</div>
		<div class="days">
			<div class="day headline">Måndag</div>
			<div class="day headline">Tisdag</div>
			<div class="day headline">Onsdag</div>
			<div class="day headline">Torsdag</div>
			<div class="day headline">Fredag</div>
			<div class="day headline">Lördag</div>
			<div class="day headline">Söndag</div>

			{#each month as day}
				<div class={day.label ? 'day active' : 'day'}>
					{day.label || ''}
					{#if day.text && day.label}
						<div class="day-text" class:textRed={day.textRed}>
							{@html day.text}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/each}

<style>
	.month {
		padding: 1rem;
		--border-size: 1px;
		--border-size-negative: calc(
			var(--border-size) - var(--border-size) - var(--border-size)
		);
	}
	.image {
		overflow: hidden;
		height: 21.5rem;
	}

	.image img {
		width: 100%;
	}
	.days {
		display: grid;
		grid-template-columns: repeat(7, 14.2857142857143%);
	}

	.day {
		margin-right: var(--border-size-negative);
		margin-top: var(--border-size-negative);
		transform: translate(var(--border-size), var(--border-size));

		border: var(--border-size) solid transparent;

		padding: 0.25rem;

		color: var(--color-text-secondary);
	}

	.month-headline {
		padding: calc(0.25rem + var(--border-size));
		font-size: 3rem;
		text-transform: uppercase;
	}

	.day.headline {
		font-weight: bold;
		text-transform: uppercase;
		text-align: center;
		font-size: 0.8em;
		letter-spacing: 1px;
	}

	.day.active {
		border-color: var(--color-grey);
		height: 6rem;
	}

	.day-text {
		color: var(--color-grey);
		font-size: 0.8em;
		line-height: 1.2;
	}

	.textRed {
		color: var(--color-red);
	}

	@media print {
		html,
		body,
		.day {
			font-size: 32px;
		}

		.day,
		.month-headline {
			padding: 16px;
		}

		.month-headline {
			font-size: 100px;
		}

		.day.headline {
			font-size: 24px;
		}

		.image {
			height: 30vh;
		}

		.month {
			page-break-after: always;
		}

		.day.active {
			height: 200px;
		}

		@page {
			size: auto;
			margin: 20px;
		}
	}
</style>
