<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/env';
	import { fade } from 'svelte/transition';
	import {
		changeDays,
		dateRegex,
		getDateFriendly,
		getDaysBeforeFirstMonday,
		getDaysInMonth,
		getWeek,
		isToday,
		isWeekend
	} from '$lib/utils/dateHelper';
	import Settings from '$lib/components/Settings.svelte';
	import { store, files } from '$lib/store';

	onMount(() => {
		if (browser && window.innerWidth <= 700) {
			// mobile scrensize, scroll to active month
			const date = new Date();
			const index = date.getMonth();
			const target = document.getElementById(`month-${index}`);
			if (!target) return;
			let scrollTop = window.pageYOffset;
			const finalOffset = target.getBoundingClientRect().top + scrollTop;
			window.scroll({
				top: finalOffset,
				left: 0,
				behavior: 'smooth'
			});
		}
	});

	$: if (browser) {
		document.documentElement.style.setProperty(
			'--image-height',
			`${$store.imageHeight}%`
		);
	}

	let calendar: App.Calendar = { [$store.year]: [] };

	$: {
		calendar = { [$store.year]: [] }; // reset for rerenders
		const presetDates = [];
		for (const row of $store.customDates.split('\n')) {
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

		for (let month = 0; month < 12; month++) {
			calendar[$store.year].push([]);

			const daysInMonth = getDaysInMonth(month, $store.year);

			for (let day = 1; day <= daysInMonth; day++) {
				const date = new Date($store.year, month, day, 12);

				const dateFriendly = getDateFriendly(date);

				let label = day !== 1 ? day : dateFriendly;

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
							let extraDay = 0;
							extraDay < daysBeforeFirstMonday;
							extraDay++
						) {
							const placeholderDate = changeDays(
								date,
								-(daysBeforeFirstMonday - extraDay)
							);
							const placeholderDateFriendly = getDateFriendly(
								placeholderDate,
								true
							);

							calendar[$store.year][month].push({
								label: placeholderDateFriendly,
								date: placeholderDate,
								isPlaceholder: true
							});
						}
					}
				}

				calendar[$store.year][month].push({
					date,
					isToday: isToday(date),
					isWeekend: isWeekend(date),
					label,
					text,
					textRed
				});
			}
		}
	}
</script>

<!-- <pre>
{JSON.stringify(calendar,null,2)}
</pre> -->

<button
	class="settings-button"
	on:click={() => ($store.settingsOpen = !$store.settingsOpen)}
>
	{#if $store.settingsOpen}
		<img
			src="/images/close.svg"
			alt="Stäng inställningar"
			transition:fade={{ duration: 250 }}
		/>
	{:else}
		<img
			src="/images/menu.svg"
			alt="Öppna inställningar"
			transition:fade={{ duration: 250 }}
		/>
	{/if}
</button>

{#if $store.settingsOpen}
	<Settings />
{/if}

{#if $store.showSliders}
	<input
		class="slider slider-month"
		type="range"
		min="0"
		max="70"
		bind:value={$store.imageHeight}
	/>
{/if}

{#each calendar[$store.year] as month, i}
	<div class="month" id={`month-${i}`}>
		{#if $store.showSliders}
			<input
				type="range"
				class="slider slider-image"
				min="-100"
				max="0"
				bind:value={$store.imageMargins[i]}
			/>
		{/if}
		<div class="image">
			<img
				src={$files[i]
					? URL.createObjectURL($files[i])
					: `/images/generic/${i + 1}.jpg`}
				style={`margin-top:${$store.imageMargins[i]}%`}
				alt=""
			/>
		</div>

		<div class="month-headline">{$store.months[i] || ''} {$store.year}</div>
		<div class="days">
			<div class="week" />
			{#each $store.weekdays as weekday}
				<div class="day headline">{weekday}</div>
			{/each}

			{#each month as day, x}
				{#if x % 7 === 0}
					<div class="week">
						{day.date && $store.showWeekNumbers ? getWeek(day.date) : ''}
					</div>
				{/if}
				<div
					class="day"
					class:placeholder={day.isPlaceholder}
					class:today={day.isToday}
					class:weekend={day.isWeekend}
				>
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
	:root {
		--padding: 40px;
		--headlines: 50px;
		--padding-and-headlines: calc(var(--padding) + var(--headlines));

		--image-height: 33%; /* 70% is max*/

		--days-percent: calc(100% - var(--image-height));
		--days-height: calc(var(--days-percent) - var(--padding-and-headlines));
	}

	.settings-button {
		position: fixed;
		z-index: 2;
		top: 20px;
		left: 20px;
		display: grid;
		justify-content: center;
		align-items: center;
		border-radius: 100%;
		border: var(--border-size) solid var(--color-grey);
		background-color: white;
		height: 40px;
		width: 40px;
	}
	.settings-button > * {
		grid-area: 1 / -1;
	}
	.month {
		position: relative;
		scroll-snap-align: start;
		max-width: 760px;
		margin: 0 auto 5rem auto;
		padding: 20px;
		height: 1090px;
	}
	.slider-image {
		position: absolute;
		top: 0;
		left: 20px;
		width: calc(100% - 40px);
	}

	.slider-month {
		position: fixed;
		top: 20px;
		right: 0;
		height: calc(100vh - 140px);
		width: 20px;
		transform: rotate(180deg);
		appearance: slider-vertical;
		-webkit-appearance: slider-vertical;
		z-index: 1;
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

	.image {
		overflow: hidden;
		max-height: var(--image-height);
	}

	.image img {
		width: 100%;
	}

	.days {
		--week-number-width: 1.2rem;
		display: grid;
		grid-template-columns: var(--week-number-width) repeat(
				7,
				calc(14.2857% - 0.171428rem)
			);
		grid-template-rows: auto repeat(6, 1fr);
		width: calc(100% + var(--week-number-width));
		transform: translateX(calc(var(--week-number-width) * -1));
		height: var(--days-height);
	}

	.day {
		margin-right: var(--border-size-negative);
		margin-top: var(--border-size-negative);
		transform: translate(var(--border-size), var(--border-size));

		border: var(--border-size) solid var(--color-grey);

		padding: 0.25rem;

		color: var(--color-text-secondary);

		overflow: hidden;
	}

	.day.weekend {
		background-color: var(--color-grey-lightest);
	}
	.day.today {
		border-color: black;
		z-index: 1;
	}

	.month-headline {
		padding: 1rem calc(0.25rem + var(--border-size));
		font-size: 3rem;
		text-transform: uppercase;
		line-height: 1;
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

	@media (max-width: 700px) {
		/* mobile styles */

		.settings-button {
			border: none;
			top: 17px;
			left: 17px;
		}
		.month {
			height: 100vh;
			padding: 28px 28px 80px 28px; /* to get around iphone bottom searchbar */
		}

		.month-headline {
			padding: 0.75rem calc(0.25rem + var(--border-size));
			font-size: 2.25rem;
		}

		.slider-image {
			width: calc(100% - 56px);
			top: 5px;
		}
		.slider-month {
			height: 58vh;
			top: 28px;
			right: 5px;
		}

		.day {
			font-size: 0.8rem;
		}
		.day.headline {
			font-size: 0.6rem;
		}
		.day:not(.headline) {
			line-height: 1;
		}
		.day-text {
			line-height: 1;
		}
	}

	@media print {
		.slider,
		.settings-button {
			display: none;
		}
		.month {
			margin: 0;
			max-width: none;
			height: 100vh;
		}

		.month {
			page-break-after: always;
		}

		.day.today {
			border-color: var(--color-grey);
			z-index: 0;
		}

		@page {
			size: auto;
			margin: 20px;
		}
	}
</style>
