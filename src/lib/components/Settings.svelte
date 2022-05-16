<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { debounce } from '$lib/utils/debounce';
	import { defaultCustomDates } from '$lib/defaultCustomDates';
	import { createEventDispatcher } from 'svelte';
	import {
		customDates,
		imageHeight,
		defaultImageHeight,
		imageMargins,
		defaultImageMargins
	} from '$lib/store';

	const dispatch = createEventDispatcher();

	let settings: EventTarget;

	onMount(() => {
		addClickListener();
		return removeClickListener;
	});

	const addClickListener = () => {
		document.addEventListener('click', handleClick, true);
	};

	const removeClickListener = () => {
		document.removeEventListener('click', handleClick, true);
	};

	const handleCustomDatesInput = debounce((e: Event) => {
		const target = e.target as HTMLInputElement;
		customDates.set(target?.value);
		localStorage.setItem('customDates', target?.value);
	});

	function handleResetCustomDatesClick() {
		if (
			confirm(
				'Är du säker på att du vill återställa datumen och storlek till standard?'
			)
		) {
			customDates.set(defaultCustomDates);
			localStorage.setItem('customDates', defaultCustomDates);

			imageHeight.set(defaultImageHeight);
			localStorage.setItem('imageHeight', defaultImageHeight.toString());

			imageMargins.set(defaultImageMargins);
			localStorage.setItem('imageMargins', JSON.stringify(defaultImageMargins));

			dispatch('clickoutside');
		}
	}

	function handleClick(e: MouseEvent) {
		const path = e.composedPath();
		const settingsButton = document.querySelector('.settings-button');

		const isInside = path.some(
			(node: EventTarget) => node === settings || node === settingsButton
		);
		if (!isInside) dispatch('clickoutside');
	}
</script>

<div
	class="settings"
	bind:this={settings}
	transition:fly={{ duration: 250, x: -300 }}
>
	<label for="customDates">Egna datum</label>
	<textarea
		id="customDates"
		rows="20"
		on:input={handleCustomDatesInput}
		placeholder="2022-05-01 Första maj red_day&#13;2022-05-20 Joels födelsedag 🎉"
		>{$customDates}</textarea
	>
	<button on:click={handleResetCustomDatesClick}>Återställ</button>
</div>

<style>
	.settings {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1;
		background-color: white;
		border-right: 1px solid var(--color-grey);
		height: 100vh;
		width: 33vw;
		max-width: 400px;
		box-shadow: var(--shadow);

		padding: 80px 20px;
		overflow-x: auto;
	}

	textarea {
		height: 50%;
		width: 100%;
		border: var(--border-size) solid var(--color-grey);

		font-size: 0.8em;
	}

	@media print {
		.settings {
			display: none;
		}
	}
</style>
