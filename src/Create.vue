<script setup lang="ts">
import { shallowRef } from "vue";
import { id, key, type Game, type Team } from "./utils";
import { useLocalStorage } from "@vueuse/core";
import { useRouter, RouterLink } from "vue-router";
import { UserIcon } from "@heroicons/vue/24/outline";

interface Choice {
	readonly label: string;
	readonly players: number;
	readonly teams: number;
}

const router = useRouter();
const games = useLocalStorage(key("games"), {} as Record<string, Game>);

const choices: [Choice, Choice, Choice, Choice] = [
	{ teams: 2, players: 4, label: "2 vs 2" },
	{ teams: 2, players: 2, label: "1 vs 1" },
	{ teams: 3, players: 3, label: "1 vs 1 vs 1" },
	{ teams: 4, players: 4, label: "1 vs 1 vs 1 vs 1" },
];

const selectedChoice = shallowRef<Choice>(choices[0]);

const teams = shallowRef<ReadonlyArray<Team>>(
	createTeams(selectedChoice.value),
);

function createTeams(option: Choice): ReadonlyArray<Team> {
	return Array.from({ length: option.teams }, () => ({
		name: ``,
	}));
}

function addTeams(option: Choice) {
	teams.value = createTeams(option);
}

function createGame() {
	const newGameId = id();

	games.value[newGameId] = {
		id: newGameId,
		title: `Joc #${newGameId}`,
		createdDate: new Date().toISOString(),
		teams: teams.value,
		playersCount: selectedChoice.value.players,
		rounds: [],
		collected: 0,
	};

	router.push(`/${newGameId}`);
}
</script>

<template>
	<div class="grid gap-4">
		<div class="join">
			<input
				v-for="choice in choices"
				@click="addTeams(choice)"
				:value="choice"
				class="join-item btn grow"
				type="radio"
				name="choice"
				:aria-label="choice.label"
				v-model="selectedChoice"
			/>
		</div>

		<form class="grid gap-2" @submit.prevent="createGame">
			<label
				v-for="(team, index) in teams"
				class="input validator w-full"
			>
				<UserIcon class="h-[1em] opacity-50" />
				<input
					type="text"
					v-model="team.name"
					required
					:placeholder="`Nume Echipă ${index + 1}`"
					minlength="2"
					maxlength="20"
				/>
			</label>

			<div class="join flex">
				<RouterLink to="/" class="btn join-item">Înapoi</RouterLink>
				<button
					type="submit"
					:disabled="!selectedChoice"
					class="btn join-item grow"
				>
					Crează
				</button>
			</div>
		</form>
	</div>
</template>
