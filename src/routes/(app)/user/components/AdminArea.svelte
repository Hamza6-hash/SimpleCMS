<script lang="ts">
	import Multibutton from './Multibutton.svelte';
	import type { PageData } from '../$types';

	// typesafe-i18n
	import LL from '@src/i18n/i18n-svelte';

	// Skeleton
	import { Avatar } from '@skeletonlabs/skeleton';
	import ModalTokenUser from './ModalTokenUser.svelte';
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { Toast, getToastStore, getModalStore } from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();
	const toastStore = getToastStore();

	export let data: PageData;
	//console.log(data);

	// Modal Trigger - Generate User Registration email Token
	function modalTokenUser(): void {
		const modalComponent: ModalComponent = {
			// Pass a reference to your custom component
			ref: ModalTokenUser,

			// Provide default slot content as a template literal
			slot: '<p>Edit Form</p>'
		};
		const d: ModalSettings = {
			type: 'component',
			// NOTE: title, body, response, etc are supported!
			title: $LL.MODAL_UserToken_Title(),
			body: $LL.MODAL_UserToken_Body(),
			component: modalComponent,

			// Pass arbitrary data to the component
			response: (r: any) => {
				if (r) console.log('response:', r);

				// Trigger the toast
				const t = {
					message: '<iconify-icon icon="mdi:email-fast-outline" color="white" width="24" class="mr-1"></iconify-icon> Email Invite Send',
					// Provide any utility or variant background style:
					background: 'gradient-tertiary',
					timeout: 3000,
					// Add your custom classes here:
					classes: 'border-1 !rounded-md'
				};
				toastStore.trigger(t);
				return;
			}
		};
		modalStore.trigger(d);
	}

	let showUserList = false;
	let showMoreUserList = false;
	let showUsertoken = false;
	let showMoreUserToken = false;

	function toggleUserList() {
		showUserList = !showUserList;
		if (showUsertoken) showUsertoken = false;
	}

	function toggleUserToken() {
		showUsertoken = !showUsertoken;
		if (showUserList) showUserList = false;
	}

	// TanstackFilter
	import TanstackFilter from '@src/components/TanstackFilter.svelte';
	let globalSearchValue = '';
	let searchShow = false;
	let filterShow = false;
	let columnShow = false;
	let density = 'normal';

	// TanstackTable
	import TanstackTable from '@src/components/TanstackTable.svelte';
	import { flexRender } from '@tanstack/svelte-table';
	import moment from 'moment';

	// AdminUser Data
	import { onMount } from 'svelte';
	import Role from './Role.svelte';
	import Boolean from './Boolean.svelte';
	import MultibuttonToken from './MultibuttonToken.svelte';

	let tableData = [];
	let tableDataUserToken = [];
	export let selectedRows: any[] = [];
	//Load Table data
	onMount(async () => {
		// Load All available Users
		tableData = data.allUsers;

		// Load all Send Registration Tokens
		tableDataUserToken = data.tokens;
	});
	// console.log(tableData);

	// Display User Columns
	let items = [
		{
			header: $LL.USER_AdminArea_Blocked(),
			accessorKey: 'blocked',
			id: 'blocked',
			// cell: (info: any) => (info.getValue() ? 'Yes' : 'No')
			cell: (info: any) => flexRender(Boolean, { value: info.getValue() })
		},
		{
			header: $LL.USER_AdminArea_Avatar(),
			accessorKey: 'avatar',
			id: 'avatar',
			//TODO: update Avatar size if density changes as table does not refresh)
			cell: (info: any) =>
				flexRender(Avatar, {
					src: info.row.original.avatar || '/Default_User.svg', // Use default avatar if avatar is empty
					width: density === 'comfortable' ? 'w-12' : 'w-8'
				})
		},
		{ header: 'ID', accessorKey: 'id', id: 'id' },
		{ header: $LL.USER_AdminArea_Username(), accessorKey: 'username', id: 'username' },
		{
			header: $LL.USER_AdminArea_Role(),
			accessorKey: 'role',
			id: 'role',
			cell: (info: any) => flexRender(Role, { value: info.getValue() })
		},

		{ header: $LL.USER_AdminArea_Email(), accessorKey: 'email', id: 'email' },
		{
			header: $LL.USER_AdminArea_Access(),
			accessorKey: 'updatedAt',
			id: 'updatedAt',
			accessorFn: (cell: any) => moment(cell.updatedAt).fromNow()
		},

		{
			header: $LL.USER_AdminArea_Sessions(),
			accessorKey: 'activeSessions',
			id: 'activeSessions'
		},
		{
			header: $LL.USER_AdminArea_ExpiresIn(),
			accessorKey: 'lastAccess',
			id: 'lastAccess',
			accessorFn: (cell: any) => (cell.lastAccess ? moment(cell.lastAccess.active_expires).fromNow() : 'N/A')
		},
		{
			header: $LL.USER_AdminArea_MemberFor(),
			accessorKey: 'createdAt',
			id: 'createdAt',
			accessorFn: (cell: any) => moment(cell.createdAt).fromNow()
		}
	];

	// Display Active User Registration Tokens
	let itemsUserToken = [
		{ header: $LL.USER_AdminArea_UserID(), accessorKey: 'userID', id: 'id' },
		{ header: $LL.USER_AdminArea_Email(), accessorKey: 'email', id: 'email' },
		{ header: $LL.USER_AdminArea_Token(), accessorKey: 'token', id: 'token' },
		{
			header: $LL.USER_AdminArea_Role(),
			accessorKey: 'role',
			id: 'role',
			cell: (info: any) => flexRender(Role, { value: info.getValue() })
		},
		{
			header: $LL.USER_AdminArea_CreatedAt(),
			accessorKey: 'createdAt',
			id: 'createdAt',
			accessorFn: (cell: any) => moment(cell.createdAt).fromNow()
		},
		{
			header: $LL.USER_AdminArea_UpdatedAt(),
			accessorKey: 'updatedAt',
			id: 'updatedAt',
			accessorFn: (cell: any) => moment(cell.updatedAt).fromNow()
		}
	];

	// Define a reactive variable to hold the current action
	let currentAction = null;

	// Define the function to handle the CRUD action
	function handleCRUDAction(action) {
		currentAction = action;
	}
</script>

<div class="border-td mt-2 flex flex-col border-t-2">
	<p class="h2 my-2 text-center text-3xl font-bold dark:text-white">{$LL.USER_AdminArea_title()}</p>
	<div class=" flex flex-col flex-wrap items-center justify-evenly gap-2 sm:flex-row xl:justify-between">
		<!-- Email Token -->
		<button on:click={modalTokenUser} class="gradient-primary btn w-full text-white sm:max-w-xs">
			<iconify-icon icon="material-symbols:mail" color="white" width="18" class="mr-1" />
			<span class="whitespace-normal break-words">{$LL.USER_AdminArea_EmailToken()}</span>
		</button>

		{#if tableDataUserToken}
			<!-- Show User Token -->

			<button on:click={toggleUserToken} class="gradient-tertiary btn w-full text-white sm:max-w-xs">
				<iconify-icon icon="material-symbols:key-outline" color="white" width="18" class="mr-1" />
				{showUsertoken ? $LL.USER_AdminArea_ShowToken() : $LL.USER_AdminArea_TokenCollapse()}
			</button>
		{/if}

		<!-- Show User List -->
		<button on:click={toggleUserList} class="gradient-secondary btn w-full text-white sm:max-w-xs">
			<iconify-icon icon="mdi:account-circle" color="white" width="18" class="mr-1" />
			{showUserList ? $LL.USER_AdminArea_UserCollapse() : $LL.USER_AdminArea_ShowUser()}
		</button>
	</div>

	{#if showUserList}
		<!-- <UserList /> -->
		<div class="my-2 flex flex-col items-center justify-between sm:flex-row">
			<h2 class="font-bold text-primary-500">{$LL.USER_AdminArea_ListUser()}</h2>
			<div class="hidden sm:flex">
				<TanstackFilter bind:globalSearchValue bind:searchShow bind:filterShow bind:columnShow bind:density />
			</div>

			<div class="flex items-center justify-between gap-2">
				<button type="button" on:keydown on:click={() => (showMoreUserList = !showMoreUserList)} class="variant-ghost-surface btn-icon sm:hidden">
					<iconify-icon icon="material-symbols:filter-list-rounded" width="30" />
				</button>
				<!-- {JSON.stringify(selectedRows)} -->
				<Multibutton {selectedRows} on:crudAction={handleCRUDAction} />
			</div>

			{#if showMoreUserList}
				<div class="sm:hidden">
					<TanstackFilter bind:globalSearchValue bind:searchShow bind:filterShow bind:columnShow bind:density />
				</div>
			{/if}
		</div>
		{#if tableData.length > 0}
			<TanstackTable
				data={tableData}
				{items}
				{tableData}
				dataSourceName="AdminArea"
				bind:selectedRows
				bind:globalSearchValue
				bind:filterShow
				bind:columnShow
				bind:density
			/>
		{/if}
	{/if}

	{#if showUsertoken}
		<!-- User Token invites -->
		<div class="my-2 flex flex-col items-center justify-between sm:flex-row">
			<h2 class="font-bold text-black dark:text-primary-500">{$LL.USER_AdminArea_ListToken()}</h2>
			<div class="hidden sm:flex">
				<TanstackFilter bind:globalSearchValue bind:searchShow bind:filterShow bind:columnShow bind:density />
			</div>

			<div class="flex items-center justify-between gap-2">
				<button type="button" on:keydown on:click={() => (showMoreUserToken = !showMoreUserToken)} class="variant-ghost-surface btn-icon sm:hidden">
					<iconify-icon icon="material-symbols:filter-list-rounded" width="30" />
				</button>

				<MultibuttonToken {selectedRows} />
				<!-- <Multibutton on:crudAction={handleCRUDAction} /> -->
			</div>

			{#if showMoreUserToken}
				<div class="sm:hidden">
					<TanstackFilter bind:globalSearchValue bind:searchShow bind:filterShow bind:columnShow bind:density />
				</div>
			{/if}
		</div>

		{#if tableDataUserToken.length > 0}
			<TanstackTable
				data={tableDataUserToken}
				items={itemsUserToken}
				tableData={tableDataUserToken}
				dataSourceName="AdminArea"
				bind:selectedRows
				bind:globalSearchValue
				bind:filterShow
				bind:columnShow
				bind:density
				on:rowSelect={handleCRUDAction}
			/>
		{/if}
	{/if}
</div>
