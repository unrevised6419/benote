<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useLocalStorage } from "@vueuse/core";
import { key, type Game } from "./utils";
import { computed } from "vue";
import { LocalScope } from "@allindevelopers/vue-local-scope";

const gamesRecord = useLocalStorage(key("games"), {} as Record<string, Game>);
const games = computed(() => Object.values(gamesRecord.value));

function deleteGame(gameId: string) {
	if (!confirm("Sigur?")) return;
	delete gamesRecord.value[gameId];
}
</script>
<template>
	<div class="grid gap-4">
		<RouterLink to="/create" class="btn w-full">Crează Joc Nou</RouterLink>

		<ul class="list bg-base-100 rounded-box shadow-md">
			<li class="p-4 pb-2 text-xs tracking-wide opacity-60">
				{{ games.length ? "Ultimele jocuri" : "Lipsă jocuri" }}
			</li>

			<li v-for="game in games" class="list-row">
				<div class="avatar avatar-placeholder">
					<div class="bg-neutral text-neutral-content rounded-box size-10">
						{{ game.players.length }}
					</div>
				</div>
				<div>
					<div>{{ game.title }}</div>
					<div class="text-xs font-semibold uppercase opacity-60">
						<LocalScope :round="game.rounds.at(-1)" #default="{ round }">
							<template v-if="round">
								{{ round.scores.map((s) => s.total).join(" | ") }}
							</template>
							<template v-else> Fără runde </template>
						</LocalScope>
					</div>
				</div>
				<RouterLink :to="`/${game.id}`" class="btn btn-square btn-ghost">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
						/>
					</svg>
				</RouterLink>
				<button class="btn btn-square btn-ghost" @click="deleteGame(game.id)">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
						/>
					</svg>
				</button>
			</li>
		</ul>
	</div>
</template>
