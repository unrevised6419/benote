<script setup lang="ts">
import { RouterView } from "vue-router";
import { Analytics } from "@vercel/analytics/vue";
import PWABadge from "./components/PWABadge.vue";
</script>

<template>
	<Analytics />
	<div
		class="border-base-300 container mx-auto min-h-screen max-w-md border-x px-4 py-4"
	>
		<RouterView />
	</div>
	<PWABadge />
</template>
