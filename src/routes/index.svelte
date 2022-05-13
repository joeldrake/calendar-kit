<script lang="ts">
	import {
		changeDays,
		dateRegex,
		getDateFriendly,
		getDaysBeforeFirstMonday,
		getDaysInMonth,
		getWeek
	} from '$lib/dateHelper';

	const year = 2022;

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
		-10, // 'Januari'
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

	const presetDatesText = `
2022-01-05 Trettondags&shy;afton
2022-01-06 Trettonde&shy;dag jul red_day

2022-01-17 Karins födelsedag 🎉

2022-02-14 Alla hjärtans dag ❤️

2022-04-14 Skärtorsdagen<br>🥚
2022-04-15 Långfredagen<br>🐣 red_day
2022-04-16 Påskafton<br>🐥
2022-04-17 Påskdagen<br>🐓 red_day
2022-04-18 Annandag påsk<br>🍗 red_day
2022-04-30 Valborgs&shy;mässo&shy;afton 🍻

2022-05-01 Första maj red_day
2022-05-20 Joels födelsedag 🎉
2022-05-26 Kristi himmelsfärd red_day
2022-05-29 Mors dag

2022-06-04 Pingstafton
2022-06-05 Pingstdagen red_day
2022-06-06 Nationaldagen 🇸🇪 red_day
2022-06-24 Celines födelsedag 🎉<br>Midsommar&shy;afton red_day
2022-06-25 Midsommar&shy;dagen red_day

2022-10-30 Vintertid börjar

2022-11-04 Allhelgona&shy;afton 👻
2022-11-05 Alla helgons dag 👻 red_day
2022-11-27 Första advent

2022-12-24 Julafton 🎅🏻
2022-12-25 Juldagen 🎁 red_day
2022-12-26 Annandag jul red_day
2022-12-31 Nyårsafton 🎆 red_day
`;

	let calendar: App.Calendar = { [year]: [] };

	const presetDates = [];
	for (const row of presetDatesText.split('\n')) {
		let textRed: boolean | undefined;
		let rowParts = row.split(' ');
		const validDate = dateRegex.test(rowParts[0]);
		if (!validDate) continue;
		const date = rowParts[0];
		rowParts.shift(); // removes date

		// remove and track any keywords
		if (rowParts.includes('red_day')) {
			textRed = true;
			rowParts = rowParts.filter((word) => word !== 'red_day');
		}

		presetDates.push({
			date: getDateFriendly(new Date(date)),
			text: rowParts.join(' '),
			textRed
		});
	}

	console.log(presetDates);

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
					for (let extraDay = 0; extraDay < daysBeforeFirstMonday; extraDay++) {
						const placeholderDate = changeDays(
							date,
							-(daysBeforeFirstMonday - extraDay)
						);
						const placeholderDateFriendly =
							getDateFriendly(placeholderDate).split(' ')[0];

						calendar[year][month].push({
							label: placeholderDateFriendly,
							date: placeholderDate,
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
		<div class="image-wrapper">
			<div class="image">
				<img
					src={`/images/${i + 1}.JPG`}
					style={`margin-top:${imageMargins[i]}%`}
					alt=""
				/>
			</div>
			<input
				type="range"
				class="slider"
				min="-100"
				max="0"
				bind:value={imageMargins[i]}
			/>
		</div>
		<div class="month-headline">{months[i]} {year}</div>
		<div class="days">
			<div class="week" />
			<div class="day headline">Måndag</div>
			<div class="day headline">Tisdag</div>
			<div class="day headline">Onsdag</div>
			<div class="day headline">Torsdag</div>
			<div class="day headline">Fredag</div>
			<div class="day headline">Lördag</div>
			<div class="day headline">Söndag</div>

			{#each month as day, x}
				{#if x % 7 === 0}
					<div class="week">
						{day.date ? getWeek(day.date) : ''}
					</div>{/if}
				<div class="day" class:placeholder={day.isPlaceholder}>
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
		max-width: 760px;
		margin: 0 auto 5rem auto;
		padding: 1.25rem;
		--border-size: 1px;
		--border-size-negative: calc(
			var(--border-size) - var(--border-size) - var(--border-size)
		);
	}

	.week {
		white-space: nowrap;
		font-size: 0.8rem;
		color: var(--color-grey);
		display: flex;
		justify-content: right;
		padding-right: 0.25rem;
		align-items: center;
	}

	.image-wrapper {
		position: relative;
	}
	.image {
		overflow: hidden;
		max-height: 21.5rem;
	}

	.image img {
		width: 100%;
	}

	.image-wrapper .slider {
		position: absolute;
		top: 0;
		right: 0;
		transform: rotate(90deg) translateX(100%);
		transform-origin: top right;
	}

	.days {
		--week-number-width: 1.2rem;
		display: grid;
		grid-template-columns: var(--week-number-width) repeat(
				7,
				calc(14.2857% - 0.171428rem)
			);
		width: calc(100% + var(--week-number-width));
		transform: translateX(calc(var(--week-number-width) * -1));
	}

	.day {
		margin-right: var(--border-size-negative);
		margin-top: var(--border-size-negative);
		transform: translate(var(--border-size), var(--border-size));

		border: var(--border-size) solid var(--color-grey);

		padding: 0.25rem;

		color: var(--color-text-secondary);

		height: 6rem;
	}

	.month-headline {
		padding: calc(0.25rem + var(--border-size));
		font-size: 3rem;
		text-transform: uppercase;
	}

	.day.headline {
		font-weight: bold;
		text-transform: uppercase;
		text-align: left;
		font-size: 0.8em;
		letter-spacing: 1px;

		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;

		border-color: transparent;
		height: auto;
	}

	.day.placeholder {
		color: var(--color-grey-light);
		border-color: var(--color-grey-light);
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
		.month {
			margin: 0;
			max-width: none;
		}
		.image {
			max-height: 30vh;
		}

		.image .slider {
			display: none;
		}

		.month {
			page-break-after: always;
		}

		.day:not(.headline) {
			height: 100px;
		}

		@page {
			size: auto;
			margin: 20px;
		}
	}
</style>
