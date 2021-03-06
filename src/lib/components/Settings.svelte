<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { debounce } from '$lib/utils/debounce';
	import { move } from '$lib/utils/move';
	import {
		files,
		store,
		storeDefault,
		getMonths,
		getWeekdays
	} from '$lib/store';
	import { saveFiles, saveFile } from '$lib/utils/db';

	let settings: HTMLElement | null;
	let dragElement: HTMLElement | null;

	let isResizing = false;

	onMount(() => {
		if (settings) settings.style.width = $store.settingsWidth;

		//todo: move these to body
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
		$store.customDates = target?.value;
	});

	function handleResetStoreClick() {
		if (
			confirm(
				'Är du säker på att du vill återställa alla inställningar till standard?'
			)
		) {
			store.set(storeDefault);
			$store.settingsOpen = false;
		}
	}

	function handleClick(e: MouseEvent) {
		const path = e.composedPath();
		const settingsButton = document.querySelector('.settings-button');

		const isInside = path.some(
			(node: EventTarget) => node === settings || node === settingsButton
		);
		if (!isInside) $store.settingsOpen = false;
	}

	function handleFilesChanged(e: Event) {
		const target = e.target as HTMLInputElement;
		saveFiles([...(target.files || [])]);
	}

	function handleFileChanged(e: Event, id: number) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		console.log(files);
		if (!files) return;
		saveFile(files[0], id);
	}

	function handleClearFiles() {
		saveFiles();
	}

	const handleDragStart = (e: DragEvent) =>
		(dragElement = e.target as HTMLElement);
	const handleDragEnd = (e: DragEvent) => (dragElement = null);
	const handleDragOver = (e: DragEvent) => e.preventDefault();
	const handleDragEnter = (e: DragEvent) => {
		const target = e.target as HTMLElement;
		target.style.outline = '0.25rem dashed var(--color-interactive-primary)';
	};
	const handleDragLeave = (e: DragEvent) => {
		const target = e.target as HTMLElement;
		target.style.outline = '';
	};

	function handleDrop(e: DragEvent) {
		if (!$files) return;
		const target = e.target as HTMLElement;
		target.style.outline = '';
		const draggedId = Number(dragElement?.getAttribute('data-id'));
		const targetId = Number(target?.getAttribute('data-id'));
		console.log('draggedId', draggedId);
		console.log('dragElement', targetId);

		const newFiles = move([...$files], draggedId, targetId);
		console.log(newFiles);

		saveFiles(newFiles);
	}

	function handleMouseDown(e: MouseEvent) {
		if (e.button !== 0) return; // must med left mouse click
		const target = e.target as HTMLElement;
		isResizing = target.classList.contains('resizer');
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isResizing || !settings) return;

		const newSettingsWidth = `${e.clientX + 4}px`;

		settings.style.width = newSettingsWidth;
		setSettingsWidthToStore(newSettingsWidth);
	}

	function handleMouseUp(e: MouseEvent) {
		isResizing = false;
	}

	const setSettingsWidthToStore = debounce((newSettingsWidth: string) => {
		$store.settingsWidth = newSettingsWidth;
	});

	function handleYearChange(e: InputEvent) {
		const target = e.target as HTMLInputElement;
		$store.year = Number(target.value);
	}

	function handleLangChange(e: any) {
		const target = e.target as HTMLInputElement;
		store.update((state) => {
			const months = getMonths(target.value);
			const weekdays = getWeekdays(target.value);
			return {
				...state,
				lang: target.value,
				months,
				weekdays
			};
		});
	}
</script>

<svelte:body
	on:mousedown={handleMouseDown}
	on:mousemove={handleMouseMove}
	on:mouseup={handleMouseUp} />

<div
	class="settings"
	bind:this={settings}
	transition:fly={{ duration: 250, x: -300 }}
>
	<div class="settings__inner">
		<div class="section">
			<label>
				Språk
				<select value={$store.lang} on:change={handleLangChange}>
					<option value="sv">Svenska</option>
					<option value="en">Engelska</option>
				</select>
			</label>
		</div>
		<div class="section">
			<label>
				År
				<select bind:value={$store.year}>
					{#each new Array(81) as _, index}
						<option value={2020 + index}>{2020 + index}</option>
					{/each}
				</select>
			</label>
		</div>

		<div class="section">
			<label>
				<input
					name="showWeekNumbers"
					type="checkbox"
					bind:checked={$store.showWeekNumbers}
				/>
				Visa veckonummer
			</label>
		</div>

		<div class="section">
			<label>
				<input
					name="showSliders"
					type="checkbox"
					bind:checked={$store.showSliders}
				/>
				Ändra storlek + bildposition
			</label>
		</div>

		<div class="section">
			<label for="customDates"> Egna datum</label>
			<textarea
				id="customDates"
				rows="10"
				on:input={handleCustomDatesInput}
				placeholder="2022-05-01 Första maj red_day&#13;2022-05-20 Joels födelsedag 🎉"
				>{$store.customDates}</textarea
			>

			<button class="settings__reset-button" on:click={handleResetStoreClick}>
				Återställ
			</button>
		</div>

		<div class="section">
			Ladda upp egna bilder <br />
			(12 st, en för varje månad)

			<input
				class="settings__file-upload"
				id="file-upload"
				type="file"
				accept="image/*"
				multiple
				on:change={handleFilesChanged}
			/>

			<button
				class="settings__file-upload-button"
				on:click={() => document.getElementById('file-upload')?.click()}
			>
				Ladda upp bilder
			</button>

			{#each Array.from({ length: 12 }, (_, i) => i) as index}
				<div class="settings__image-wrapper">
					<div>
						<span class="settings__image-name">{$store.months[index]}</span>

						<input
							id={`single-file-upload-${index}`}
							class="settings__file-upload"
							type="file"
							accept="image/*"
							on:change={(e) => handleFileChanged(e, index)}
						/>

						<button
							class="settings__image-button"
							on:click={() =>
								document.getElementById(`single-file-upload-${index}`)?.click()}
							>Ändra</button
						>
					</div>
					<div
						data-id={index}
						style="width:100%"
						on:dragend={handleDragEnd}
						on:dragenter={handleDragEnter}
						on:dragleave={handleDragLeave}
						on:drop={handleDrop}
						on:dragover={handleDragOver}
					/>
					{#if $files[index]}
						<img
							src={URL.createObjectURL($files[index])}
							class="settings__image"
							alt={$files[index].name}
							width="64px"
							height="64px"
							draggable="true"
							data-id={index}
							on:dragstart={handleDragStart}
							on:dragend={handleDragEnd}
							on:dragenter={handleDragEnter}
							on:dragleave={handleDragLeave}
							on:drop={handleDrop}
							on:dragover={handleDragOver}
						/>
					{/if}
				</div>
			{/each}

			<button disabled={!$files.length} on:click={handleClearFiles}>
				Rensa bilder
			</button>
		</div>
	</div>
	<div class="resizer" />
</div>

<style>
	.settings {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 2;
		height: 100vh;
		width: 33vw;
		display: grid;
		grid-template-columns: 1fr auto;
	}

	.settings__inner {
		background-color: white;
		border-right: 1px solid var(--color-grey);
		box-shadow: var(--shadow);
		height: 100vh;
		padding: 80px 20px;
		overflow-x: auto;
	}

	@media (max-width: 700px) {
		.settings {
			width: 90vw !important;
		}

		.settings__inner {
			padding-top: 20px;
		}
	}

	.resizer {
		opacity: 0.5;
		width: 8px;
		cursor: ew-resize;
	}

	.section {
		padding-bottom: 1rem;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--color-grey);
	}

	.section button {
		width: 100%;
	}

	.settings__file-upload-button {
		margin: 0.5rem 0;
	}

	.settings__file-upload {
		display: block;
		width: 0.01px;
		height: 0;
	}

	.settings__image {
		display: block;
		width: 64px;
		height: 64px;
		cursor: move;
	}

	.settings__image-wrapper {
		display: flex;
		flex-direction: row;
		margin-bottom: 0.5rem;
	}

	.settings__image-name {
		white-space: nowrap;
	}

	button.settings__image-button {
		width: auto;
		display: block;
		padding: 0 0.75rem;
		height: 30px;
		font-size: 0.9rem;
	}

	textarea {
		height: 20%;
		width: 100%;
		border: var(--border-size) solid var(--color-grey);

		font-size: 1rem;
	}

	@media print {
		.settings {
			display: none;
		}
	}
</style>
