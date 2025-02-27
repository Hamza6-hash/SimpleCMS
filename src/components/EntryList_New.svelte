<script lang="ts">
	import { contentLanguage, categories, collection, mode, entryData, modifyEntry, handleSidebarToggle, toggleLeftSidebar } from '@src/stores/store';

	import axios from 'axios';

	// TanstackFilter
	import TanstackFilter from '@src/components/TanstackFilter.svelte';
	let globalSearchValue = '';
	let searchShow = false;
	let filterShow = false;
	let columnShow = false;
	let density = 'normal';

	// TanstackTable
	import TanstackTable from '@src/components/TanstackTable.svelte';

	import EntryListMultiButton from './EntryList_MultiButton.svelte';
	import TranslationStatus from './TranslationStatus.svelte';
	import { getFieldName } from '@src/utils/utils';

	let data: any = [];
	let tableData: any = [];

	// This function refreshes the data displayed in a table by fetching new data from an API endpoint and updating the tableData and options variables.
	let refresh = async (collection: typeof $collection) => {
		//console.log($collection);

		if ($collection.name == '') return;

		data = undefined;
		data = (await axios.get(`/api/${$collection.name}?page=${1}&length=${50}`).then((data) => data.data)) as { entryList: [any]; totalCount: number };

		//console.log(data);

		tableData = await Promise.all(
			data.entryList.map(async (entry) => {
				let obj: { [key: string]: any } = {};
				for (let field of collection.fields) {
					obj[field.label] = await field.display?.({
						data: entry[getFieldName(field)],
						collection: $collection.name,
						field,
						entry,
						contentLanguage: $contentLanguage
					});
				}
				obj._id = entry._id;
				return obj;
			})
		);

		//console.log(tableData);
	};

	// Tick Row - modify STATUS of an Entry
	let tickMap = {}; // Object to track ticked rows
	let tickAll = false;

	$modifyEntry = async (status: 'delete' | 'publish' | 'unpublish' | 'schedule' | 'clone' | 'test') => {
		// Initialize an array to store the IDs of the items to be modified
		let modifyList: Array<string> = [];

		// Loop over the tickMap object
		for (let item in tickMap) {
			// If the item is ticked, add its ID to the modifyList
			tickMap[item] && modifyList.push(tableData[item]._id);
		}

		// If no items are ticked, exit the function
		if (modifyList.length == 0) return;

		// Initialize a new FormData object
		let formData = new FormData();

		// Define a map from input status to output status
		let statusMap = {
			delete: 'deleted',
			publish: 'published',
			unpublish: 'unpublished',
			schedule: 'scheduled',
			clone: 'cloned',
			test: 'testing'
		};

		// Append the IDs of the items to be modified to formData
		formData.append('ids', JSON.stringify(modifyList));

		// Append the status to formData
		formData.append('status', statusMap[status]);

		// Use the status to determine which API endpoint to call and what HTTP method to use
		switch (status) {
			case 'delete':
				// If the status is 'Delete', call the delete endpoint
				await axios.delete(`/api/${$collection.name}`, { data: formData });
				break;
			case 'publish':
			case 'unpublish':
			case 'clone':
				await axios.post(`/api/${$collection.name}/clone`, formData);
				break;
			case 'schedule':
				await axios.post(`/api/${$collection.name}/schedule`, formData);
				break;

			case 'test':
				// If the status is 'publish', 'unpublish', 'schedule', or 'clone', call the patch endpoint
				await axios.patch(`/api/${$collection.name}/setStatus`, formData).then((res) => res.data);
				break;
		}

		// Refresh the collection
		refresh($collection);

		// Set the mode to 'view'
		mode.set('view');
	};
</script>

<!-- Header -->
<div class="mb-2 flex justify-between dark:text-white">
	<!-- Row 1 for Mobile -->
	<div class="flex items-center justify-between">
		<!-- Hamburger -->
		{#if $toggleLeftSidebar === 'closed'}
			<button
				type="button"
				on:keydown
				on:click={() => {
					// console.log('Hamburger clicked');
					toggleLeftSidebar.click();
				}}
				class="variant-ghost-surface btn-icon mt-1"
			>
				<iconify-icon icon="mingcute:menu-fill" width="24" />
			</button>
		{/if}
		<!-- Collection type with icon -->
		<!-- TODO: Translate Collection Name -->
		<div class="mr-1 flex flex-col {!$toggleLeftSidebar ? 'ml-2' : 'ml-1 sm:ml-2'}">
			{#if $categories.length}<div class="mb-2 text-xs capitalize text-surface-500 dark:text-surface-300">
					{$categories[0].name}
				</div>{/if}
			<div class="-mt-2 flex justify-start text-sm font-bold uppercase dark:text-white md:text-2xl lg:text-xl">
				{#if $collection.icon}<span> <iconify-icon icon={$collection.icon} width="24" class="mr-1 text-error-500 sm:mr-2" /></span>{/if}
				{#if $collection.name}
					<div class="flex max-w-[65px] whitespace-normal leading-3 sm:mr-2 sm:max-w-none md:mt-0 md:leading-none xs:mt-1">
						{$collection.name}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<button type="button" on:keydown on:click={() => (searchShow = !searchShow)} class="variant-ghost-surface btn-icon sm:hidden">
		<iconify-icon icon="material-symbols:filter-list-rounded" width="30" />
	</button>

	<div class="relative hidden items-center justify-center gap-2 sm:flex">
		<TanstackFilter bind:globalSearchValue bind:searchShow bind:filterShow bind:columnShow bind:density />
		<TranslationStatus />
	</div>

	<!-- MultiButton -->
	<EntryListMultiButton />
</div>

{#if tableData.length > 0}
	<TanstackTable
		data={tableData}
		items={data}
		{tableData}
		dataSourceName="EntryList"
		bind:globalSearchValue
		bind:filterShow
		bind:columnShow
		bind:density
	/>
{/if}
