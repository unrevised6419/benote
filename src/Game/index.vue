<script setup lang="ts">
import { useRoute, RouterLink } from "vue-router";
import GameDefault from "./GameDefault.vue";
import { useLocalStorage } from "@vueuse/core";
import { firstOrSelf, key, type Game } from "../utils";
import { onMounted, ref, watch } from "vue";
import invariant from "tiny-invariant";

const route = useRoute();
const gamesRecord = useLocalStorage(key("games"), {} as Record<string, Game>);
const game = ref<Game>();
const loaded = ref(false);

watch(
	game,
	(updated) => {
		if (!updated) return;
		gamesRecord.value[updated.id] = updated;
	},
	{ deep: true },
);

onMounted(() => {
	const gameId = firstOrSelf(route.params["id"]);
	invariant(gameId, "No game ID provided");
	game.value = gamesRecord.value[gameId];
	loaded.value = true;
});
</script>

<template>
	<GameDefault v-if="game && loaded" :game="game" />
	<div v-else-if="!game && loaded" class="alert alert-warning">
		<RouterLink to="/" class="btn btn-xs">Înapoi</RouterLink>
		Jocul nu există
	</div>
	<div v-else>Se încarcă</div>
</template>
