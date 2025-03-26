<script setup lang="ts">
import { ref } from "vue";
import { id, key, type Game } from "./utils";
import { useLocalStorage } from "@vueuse/core";
import { useRouter, RouterLink } from "vue-router";
import { UserIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
const players = ref([{ name: "Noi" }, { name: "Voi" }]);
const games = useLocalStorage(key("games"), {} as Record<string, Game>);

function createGame() {
	const newGameId = id();

	games.value[newGameId] = {
		id: newGameId,
		title: `Joc #${newGameId}`,
		players: players.value.map((player) => player.name),
		rounds: [],
		collected: 0,
	};

	router.push(`/${newGameId}`);
}
</script>

<template>
	<div class="grid gap-4">
		<form class="grid gap-2" @submit.prevent="createGame">
			<div class="join" v-for="player in players">
				<label class="input validator join-item grow">
					<UserIcon class="h-[1em] opacity-50" />
					<input
						type="text"
						v-model="player.name"
						required
						placeholder="Nume Jucător"
						minlength="2"
						maxlength="20"
					/>
				</label>
				<button
					type="button"
					@click="players.splice(players.indexOf(player), 1)"
					:disabled="players.length < 3"
					class="btn btn-neutral join-item"
				>
					&times;
				</button>
			</div>

			<button
				@click="players.push({ name: '' })"
				:disabled="players.length >= 4"
				type="button"
				class="btn join-item grow"
			>
				Adaugă
			</button>

			<div class="join flex">
				<RouterLink to="/" class="btn join-item">Înapoi</RouterLink>
				<button type="submit" class="btn join-item grow">Crează</button>
			</div>
		</form>
	</div>
</template>
