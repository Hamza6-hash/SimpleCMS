<script lang="ts">
	import type { FieldType } from '.';
	import { entryData, mode, contentLanguage, collection, collections } from '@src/stores/store';
	import { extractData, find, findById, getFieldName, saveFormData } from '@src/utils/utils';
	import DropDown from './DropDown.svelte';
	import Fields from '@src/components/Fields.svelte';

	export let field: FieldType | undefined;
	let fieldName = getFieldName(field);
	export const value = $entryData[fieldName];
	export let expanded = false;

	let dropDownData: any;
	let selected: { display: any; _id: any } | undefined = undefined;
	let fieldsData = {};
	let showDropDown = false;
	let entryMode: 'create' | 'edit' | 'choose' = 'choose';
	let relation_entry: any;
	let relationCollection = $collections.find((x) => x.name == field?.relation);

	export const WidgetData = async () => {
		let relation_id = '';
		if (!field) return;
		if (entryMode == 'create') {
			relation_id = (await saveFormData({ data: fieldsData, _collection: relationCollection, _mode: 'create' }))[0]?._id;
			console.log(relation_id);
		} else if (entryMode == 'choose') {
			relation_id = selected?._id;
		} else if (entryMode == 'edit') {
			relation_id = (await saveFormData({ data: fieldsData, _collection: relationCollection, _mode: 'edit', id: relation_entry._id }))[0]?._id;
		}
		return relation_id;
	};

	async function openDropDown() {
		if (!field) return;
		dropDownData = await find({}, field.relation);
		showDropDown = true;
		entryMode = 'choose';
	}

	let display = '';

	$: (async (_) => {
		let data;
		if ($mode == 'edit' && field) {
			if (entryMode == 'edit' || entryMode == 'create') {
				data = await extractData(fieldsData);
			} else if (entryMode == 'choose') {
				data = await findById($entryData[getFieldName(field)], field.relation);
			}
			!relation_entry && (relation_entry = data);
		} else {
			data = await extractData(fieldsData);
		}
		display = await field?.display({ data, field, collection: $collection, entry: $entryData, contentLanguage: $contentLanguage });
	})(expanded);
</script>

{#if !expanded && !showDropDown}
	<div class="mt-2 flex gap-2">
		<button class="variant-outline-primary rounded px-2" type="button" on:keydown on:click={openDropDown}
			>{selected?.display || display || 'Select New Relation'}</button
		>

		<button
			type="button"
			on:click={() => {
				expanded = !expanded;
				entryMode = 'edit';
				fieldsData = {};
				selected = undefined;
			}}
			class="variant-ghost-primary btn-icon"
		>
			<iconify-icon icon="bi:pencil-fill" width="24" />
		</button>

		<button
			type="button"
			on:click={() => {
				expanded = !expanded;
				entryMode = 'create';
				fieldsData = {};
				selected = undefined;
			}}
			class="variant-ghost-primary btn-icon"
		>
			<iconify-icon icon="ic:baseline-plus" width="24" />
		</button>
	</div>
{:else if !expanded && showDropDown}
	<DropDown {dropDownData} {field} bind:selected bind:showDropDown />
{:else}
	<Fields fields={relationCollection?.fields} root={false} bind:fieldsData customData={relation_entry} />

	<button type="button" on:click={() => (expanded = false)} class="variant-filled-primary btn">
		<iconify-icon icon="material-symbols:save" width="24" />Save
	</button>
{/if}
