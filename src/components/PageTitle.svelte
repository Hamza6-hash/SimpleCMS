<script lang="ts">
	import { toggleLeftSidebar } from '@src/stores/store';

	interface PageTitleProps {
		name: string;
		icon?: string | undefined;
		iconColor?: string | undefined;
		iconSize?: string | undefined;
	}

	export let name: PageTitleProps['name'];
	export let icon: PageTitleProps['icon'];
	export let iconColor: PageTitleProps['iconColor'] = 'text-error-500';
	export let iconSize: PageTitleProps['iconSize'] = '30';
</script>

<div class="flex items-center">
	<!-- Hamburger -->
	{#if $toggleLeftSidebar === 'closed'}
		<button
			type="button"
			on:click={() => toggleLeftSidebar.click()}
			class="variant-ghost-surface btn-icon mt-1"
		>
			<iconify-icon icon="mingcute:menu-fill" width="24" />
		</button>
	{/if}

	<h1 class="h1 ml-2 flex items-center gap-1 font-bold">
		<!-- Icon -->
		{#if icon}
			<iconify-icon {icon} width={iconSize} class={`mr-1 ${iconColor} sm:mr-2`} />
		{/if}
		<!-- Page Title -->
		{name}
	</h1>
</div>
