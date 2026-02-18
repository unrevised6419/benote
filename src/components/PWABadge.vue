<script setup lang="ts">
import { computed, ref } from "vue";
import { useRegisterSW } from "virtual:pwa-register/vue";

// check for updates every hour
const period = 60 * 60 * 1000;

const swActivated = ref(false);

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(swUrl: string, r: ServiceWorkerRegistration) {
	if (period <= 0) return;

	setInterval(async () => {
		if ("onLine" in navigator && !navigator.onLine) return;

		const resp = await fetch(swUrl, {
			cache: "no-store",
			headers: {
				"cache": "no-store",
				"cache-control": "no-cache",
			},
		});

		if (resp?.status === 200) await r.update();
	}, period);
}

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
	immediate: true,
	onRegisteredSW(swUrl, r) {
		if (period <= 0) return;
		if (r?.active?.state === "activated") {
			swActivated.value = true;
			registerPeriodicSync(swUrl, r);
		} else if (r?.installing) {
			r.installing.addEventListener("statechange", (e) => {
				const sw = e.target as ServiceWorker;
				swActivated.value = sw.state === "activated";
				if (swActivated.value) registerPeriodicSync(swUrl, r);
			});
		}
	},
});

const title = computed(() => {
	if (offlineReady.value) return "Benote gata de offline";
	if (needRefresh.value) return "Există conținut nou";
	return "";
});

function close() {
	offlineReady.value = false;
	needRefresh.value = false;
}
</script>

<template>
	<div v-if="offlineReady || needRefresh" class="toast">
		<div class="alert alert-info">
			{{ title }}
			<div class="flex gap-1">
				<button
					v-if="needRefresh"
					type="button"
					class="btn btn-sm"
					@click="updateServiceWorker()"
				>
					Reâncarcă
				</button>
				<button type="button" class="btn btn-sm" @click="close">
					&times;
				</button>
			</div>
		</div>
	</div>
</template>
