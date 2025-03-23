<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";

type Scores = [number, number, number, number];

type Round = {
	id: number;
	scores: Scores;
};

const key = (id: string) => `wolverine4918:${id}`;

const rounds = useLocalStorage<Round[]>(key("rounds"), []);
const scores = useLocalStorage(key("scores"), ["", "", "", ""]);

function addScores() {
	rounds.value.push({
		id: rounds.value.length + 1,
		scores: [
			parseInt(scores.value[0] || "0"),
			parseInt(scores.value[1] || "0"),
			parseInt(scores.value[2] || "0"),
			parseInt(scores.value[3] || "0"),
		],
	});
	scores.value = ["", "", "", ""];
}

function removeRound(id: number) {
	if (rounds.value.length === 0) return;
	if (!confirm("Sigur?")) return;
	const index = rounds.value.findIndex((round) => round.id === id);
	rounds.value.splice(index, 1);
}

function sumScoreUntilRound(index: number, roundId: number) {
	const roundIndex = rounds.value.findIndex((round) => round.id === roundId);
	return rounds.value
		.slice(0, roundIndex + 1)
		.reduce((acc, round) => acc + round.scores[index], 0);
}

function sumScore(index: number) {
	return rounds.value.reduce((acc, round) => acc + round.scores[index], 0);
}

function resetGame() {
	if (!confirm("Sigur?")) return;
	rounds.value = [];
	scores.value = ["", "", "", ""];
}

const formatter = Intl.NumberFormat(navigator.languages, {
	signDisplay: "always",
});
</script>

<template>
	<div class="container mx-auto grid max-w-md gap-4 px-4 py-4">
		<button type="button" @click="resetGame" class="btn block w-full">
			Resetează jocul
		</button>
		<div class="border-base-content/5 bg-base-100 rounded border">
			<table class="table text-center">
				<thead class="bg-base-200 text-xs">
					<tr>
						<th>#1</th>
						<th>#2</th>
						<th>#3</th>
						<th>#4</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="rounds.length === 0">
						<td colspan="4" class="text-center">Fără runde</td>
					</tr>
					<tr v-for="round in rounds" :key="round.id" class="list-row">
						<td>
							<div class="flex items-center justify-center gap-1">
								{{ sumScoreUntilRound(0, round.id) }}
								<span class="badge badge-xs badge-ghost opacity-50">
									{{ formatter.format(round.scores[0]) }}
								</span>
							</div>
						</td>
						<td>
							<div class="flex items-center justify-center gap-1">
								{{ sumScoreUntilRound(1, round.id) }}
								<span class="badge badge-xs badge-ghost opacity-50">
									{{ formatter.format(round.scores[1]) }}
								</span>
							</div>
						</td>
						<td>
							<div class="flex items-center justify-center gap-1">
								{{ sumScoreUntilRound(2, round.id) }}
								<span class="badge badge-xs badge-ghost opacity-50">
									{{ formatter.format(round.scores[2]) }}
								</span>
							</div>
						</td>
						<td>
							<div class="flex items-center justify-center gap-1">
								{{ sumScoreUntilRound(3, round.id) }}
								<span class="badge badge-xs badge-ghost opacity-50">
									{{ formatter.format(round.scores[3]) }}
								</span>
							</div>
						</td>
					</tr>
				</tbody>
				<tfoot class="bg-base-200 text-xs">
					<tr>
						<th colspan="4">
							<div class="flex items-center justify-between">
								<div class="inline-flex gap-1">
									<span>{{ sumScore(0) }}</span>
									<span>/</span>
									<span>{{ sumScore(1) }}</span>
									<span>/</span>
									<span>{{ sumScore(2) }}</span>
									<span>/</span>
									<span>{{ sumScore(3) }}</span>
								</div>

								<button
									type="button"
									@click="removeRound(rounds[rounds.length - 1].id)"
									class="btn btn-xs"
									:disabled="rounds.length === 0"
								>
									Șterge ultima rundă
								</button>
							</div>
						</th>
					</tr>
				</tfoot>
			</table>
		</div>

		<form @submit.prevent="addScores" class="grid gap-4">
			<div class="join">
				<input
					v-model="scores[0]"
					class="input join-item focus:z-10"
					placeholder="#1"
				/>
				<input
					v-model="scores[1]"
					class="input join-item focus:z-10"
					placeholder="#2"
				/>
				<input
					v-model="scores[2]"
					class="input join-item focus:z-10"
					placeholder="#3"
				/>
				<input
					v-model="scores[3]"
					class="input join-item focus:z-10"
					placeholder="#4"
				/>
			</div>

			<button type="submit" class="btn block w-full">Adaugă</button>
		</form>
	</div>
</template>
