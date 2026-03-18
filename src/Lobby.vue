<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useLocalStorage } from "@vueuse/core";
import { key, type Game } from "./utils";
import { computed } from "vue";
import { LocalScope } from "@all1ndev/vue-local-scope";
import { PlayIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { useRegisterSW } from "virtual:pwa-register/vue";

const { updateServiceWorker } = useRegisterSW({
	immediate: true,
});

const gamesRecord = useLocalStorage<Record<string, Game>>(key("games"), {});
const games = computed(() => Object.values(gamesRecord.value).toReversed());

function deleteGame(gameId: string) {
	if (!confirm("Sigur?")) return;
	delete gamesRecord.value[gameId];
}
</script>
<template>
	<div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-4 p-4">
		<RouterLink to="/create" class="btn w-full">Crează Joc Nou</RouterLink>

		<div>
			<ul class="list bg-base-100 rounded-box shadow-md">
				<li class="p-4 pb-2 text-xs tracking-wide opacity-60">
					{{ games.length ? "Ultimele jocuri" : "Lipsă jocuri" }}
				</li>

				<li v-for="game in games" class="list-row">
					<div class="avatar avatar-placeholder">
						<div
							class="bg-neutral text-neutral-content rounded-box size-10"
						>
							{{ game.teams.length }}
						</div>
					</div>
					<div>
						<div>
							{{ game.title }}
						</div>
						<div
							v-if="game.createdDate"
							class="text-base-content/50 text-xs"
						>
							{{ new Date(game.createdDate).toLocaleString() }}
						</div>
						<div class="text-xs font-semibold uppercase opacity-60">
							<LocalScope
								:round="game.rounds.at(-1)"
								#default="{ round }"
							>
								<template v-if="round">
									{{
										round.scores
											.map((s) => s.total)
											.join(" | ")
									}}
								</template>
								<template v-else> Fără runde </template>
							</LocalScope>
						</div>
					</div>
					<RouterLink
						:to="`/${game.id}`"
						class="btn btn-square btn-ghost"
					>
						<PlayIcon class="size-6" />
					</RouterLink>
					<button
						class="btn btn-square btn-ghost"
						@click="deleteGame(game.id)"
					>
						<TrashIcon class="size-6" />
					</button>
				</li>
			</ul>
		</div>

		<button class="btn btn-sm" @click="updateServiceWorker(true)">
			Update App
		</button>
	</div>
</template>
