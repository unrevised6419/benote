<script setup lang="ts">
import { ref } from "vue";
import Warning from "./components/Warning.vue";
import { id, key, type Game } from "./utils";
import { useLocalStorage } from "@vueuse/core";
import { useRouter } from "vue-router";

const router = useRouter();
const jucatori = ref(2);
const games = useLocalStorage(key("games"), {} as Record<string, Game>);

function createGame() {
	const newGameId = id();

	games.value[newGameId] = {
		id: newGameId,
		title: `Joc #${newGameId}`,
		players: Array.from({ length: jucatori.value }, (_, i) => `#${i + 1}`),
		rounds: [],
	};

	router.push(`/${newGameId}`);
}
</script>

<template>
	<div class="grid gap-4">
		<div role="alert" class="alert alert-warning">
			<Warning />
			<span>Atenție: Pagină în dezvoltare!</span>
		</div>

		<select class="select w-full" v-model="jucatori">
			<option value="2">2 jucători</option>
			<option value="3">3 jucători</option>
			<option value="4">4 jucători</option>
		</select>

		<button @click="createGame" class="btn w-full">Crează</button>
	</div>
</template>
