<script setup lang="ts">
import { RouterView } from "vue-router";
import { Analytics } from "@vercel/analytics/vue";
import PWABadge from "./components/PWABadge.vue";
</script>

<template>
	<Analytics />
	<div
		class="border-base-300 container mx-auto min-h-dvh sm:max-w-md sm:border-x"
	>
		<RouterView />
	</div>
	<PWABadge />
</template>
