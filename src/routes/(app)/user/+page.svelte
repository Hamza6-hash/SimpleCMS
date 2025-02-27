<script lang="ts">
	import type { PageData } from './$types';
	import '@src/stores/store';

	import PageTitle from '@src/components/PageTitle.svelte';

	export let data: PageData;

	// typesafe-i18n
	import LL from '@src/i18n/i18n-svelte';

	// Lucia
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	const user = $page.data.user;
	const { isFirstUser } = $page.data;

	// Skeleton
	import { Avatar } from '@skeletonlabs/skeleton';
	import ModalEditAvatar from './components/ModalEditAvatar.svelte';
	import ModalEditForm from './components/ModalEditForm.svelte';
	import { Toast, getToastStore, getModalStore } from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();
	const toastStore = getToastStore();

	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import AdminArea from './components/AdminArea.svelte';
	import { avatarSrc } from '@src/stores/store';
	import { roles } from '@src/collections/types';

	// let avatarSrc = writable(user?.avatar);
	avatarSrc.set(user?.avatar);

	let id = user?.id;
	let username = user?.username;
	let role = user?.role;
	let email = user?.email;

	// TODO  Get hashed password
	let password = 'hash-password';

	// Modal Trigger - User Form
	function modalUserForm(): void {
		const modalComponent: ModalComponent = {
			// Pass a reference to your custom component
			ref: ModalEditForm,

			// Provide default slot content as a template literal
			slot: '<p>Edit Form</p>'
		};

		const d: ModalSettings = {
			type: 'component',
			// NOTE: title, body, response, etc are supported!
			title: $LL.MODAL_UserEdit_Title(),
			body: $LL.MODAL_UserEdit_Body(),
			component: modalComponent,

			// Pass arbitrary data to the component
			response: async (r: any) => {
				if (r) {
					const res = await fetch('/api/user/editUser', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ ...r, id })
					});

					// Trigger the toast
					const t = {
						message: '<iconify-icon icon="mdi:check-outline" color="white" width="26" class="mr-1"></iconify-icon> User Data Updated',
						// Provide any utility or variant background style:
						background: 'gradient-tertiary',
						timeout: 3000,
						// Add your custom classes here:
						classes: 'border-1 !rounded-md'
					};
					toastStore.trigger(t);

					if (res.status === 200) {
						await invalidateAll();
					}
				}
			}
		};
		modalStore.trigger(d);
	}

	// Modal Trigger - Edit Avatar
	function modalEditAvatar(): void {
		const modalComponent: ModalComponent = {
			// Pass a reference to your custom component
			ref: ModalEditAvatar,
			props: { avatarSrc },

			// Add your props as key/value pairs
			// props: { background: 'bg-pink-500' },
			// Provide default slot content as a template literal
			slot: '<p>Edit Form</p>'
		};
		const d: ModalSettings = {
			type: 'component',
			// NOTE: title, body, response, etc are supported!
			title: $LL.MODAL_UserAvatar_Title(),
			body: $LL.MODAL_UserAvatar_Body(),
			component: modalComponent,
			// Pass arbitrary data to the component
			response: (r: { dataURL: string }) => {
				if (r) {
					avatarSrc.set(r.dataURL); // Update the avatarSrc store with the new URL

					// Trigger the toast
					const t = {
						message: '<iconify-icon icon="radix-icons:avatar" color="white" width="26" class="mr-1"></iconify-icon> Avatar Updated',

						// Provide any utility or variant background style:
						background: 'gradient-primary',
						timeout: 3000,
						// Add your custom classes here:
						classes: 'border-1 !rounded-md'
					};
					toastStore.trigger(t);
				}
			}
		};
		modalStore.trigger(d);
	}

	// Modal Confirm
	function modalConfirm(): void {
		const d: ModalSettings = {
			type: 'confirm',
			title: $LL.MODAL_UserConfirm_Title(),
			body: $LL.MODAL_UserConfirm_Body(),

			// TRUE if confirm pressed, FALSE if cancel pressed
			response: async (r: boolean) => {
				if (!r) return;
				const res = await fetch(`/api/user/deleteUsers`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify([user])
				});

				if (res.status === 200) {
					await invalidateAll();
				}
			},
			// Optionally override the button text
			// TODO: fix light background and change Delete button to red
			//backdropClasses: 'bg-white',
			buttonTextCancel: $LL.MODAL_UserConfirm_Cancel(),
			buttonTextConfirm: $LL.MODAL_UserConfirm_Delete()
		};
		modalStore.trigger(d);
	}
</script>

<div class="flex flex-col gap-1">
	<!-- TODO: fix TypeScript, as Icon is already optional? -->
	<PageTitle name={$LL.USER_PageTitle()} icon="" />

	<div class="grid grid-cols-1 grid-rows-2 gap-1 overflow-hidden md:grid-cols-2 md:grid-rows-1">
		<!-- Avatar with user info -->
		<div class="relative flex flex-col items-center justify-center gap-1">
			<Avatar src={$avatarSrc ? $avatarSrc : '/Default_User.svg'} initials="AV" rounded-none class="w-32" />

			<!-- edit button -->
			<button on:click={modalEditAvatar} class="gradient-primary w-30 badge absolute top-8 text-white sm:top-4">{$LL.USER_Edit_Avatar()}</button>
			<!--User ID -->
			<div class="gradient-secondary badge mt-1 w-full max-w-xs text-white">
				{$LL.USER_ID()}:<span class="ml-2">{id}</span>
			</div>
			<!-- Role -->
			<div class="gradient-tertiary badge w-full max-w-xs text-white">
				{$LL.USER_Role()}:<span class="ml-2">{role}</span>
			</div>
		</div>

		<!-- user fields -->
		<form>
			<label
				>{$LL.USER_Username()}:
				<input bind:value={username} name="username" type="text" disabled class="input" />
			</label>
			<label
				>{$LL.USER_Email()}:
				<input bind:value={email} name="email" type="email" disabled class="input" />
			</label>
			<label
				>{$LL.USER_Password()}:
				<input bind:value={password} name="password" type="password" disabled class="input" />
			</label>
			<div class="mt-4 flex flex-col justify-between gap-2 sm:flex-row sm:gap-1">
				<!-- Edit Modal Button -->
				<button class="gradient-secondary btn w-full max-w-sm text-white" on:click={modalUserForm}>
					<iconify-icon icon="bi:pencil-fill" color="white" width="18" class="mr-1" />{$LL.USER_Edit()}:
				</button>

				<!-- Delete Modal Button -->
				{#if !isFirstUser}
					<button on:click={modalConfirm} class="gradient-error btn w-full max-w-sm text-white">
						<iconify-icon icon="bi:trash3-fill" color="white" width="18" class="mr-1" />
						{$LL.USER_Delete()}
					</button>
				{/if}
			</div>
		</form>
	</div>

	<!-- admin area -->
	{#if user?.role == roles.admin}
		<AdminArea {data} />
	{/if}
</div>
