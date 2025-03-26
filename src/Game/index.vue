<script setup lang="ts">
import { useRoute } from "vue-router";
import GameDefault from "./GameDefault.vue";
import { useLocalStorage } from "@vueuse/core";
import { firstOrSelf, key, type Game } from "../utils";
import { onMounted, ref, watch } from "vue";
import invariant from "tiny-invariant";

const route = useRoute();
const gamesRecord = useLocalStorage(key("games"), {} as Record<string, Game>);
const game = ref<Game>();

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
});
</script>

<template>
	<GameDefault v-if="game" :game="game" />
</template>
