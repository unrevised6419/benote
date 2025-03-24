<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import {
	type Round,
	key,
	type Score,
	isBolt,
	isBoltScore,
	type Scores,
} from "./utils";
import Cell from "./Cell.vue";

const rounds = useLocalStorage<Round[]>(key("rounds"), []);
const scores = useLocalStorage<[string, string, string, string]>(
	key("scores"),
	["", "", "", ""],
);

function valueToScore(index: 0 | 1 | 2 | 3): Score {
	const scoreIsBolt = isBolt(scores.value[index]);
	const lastRound = rounds.value[rounds.value.length - 1];
	const lastRoundTotal = lastRound ? lastRound.scores[index].total : 0;

	if (!scoreIsBolt) {
		const value = Number(scores.value[index] || "0");
		return {
			type: "normal",
			total: lastRoundTotal + value,
			delta: value,
		};
	}

	const lastBoltScore = rounds.value
		.findLast((round) => isBoltScore(round.scores[index]))
		?.scores.find(isBoltScore);

	if (!lastBoltScore || lastBoltScore.delta === 3) {
		return {
			type: "bolt",
			total: lastRoundTotal,
			delta: 1,
		};
	}

	if (lastBoltScore.delta === 1) {
		return {
			type: "bolt",
			total: lastRoundTotal,
			delta: 2,
		};
	}

	if (lastBoltScore.delta === 2) {
		return {
			type: "bolt",
			total: lastRoundTotal - 10,
			delta: 3,
		};
	}

	alert("Invalid bolt score");
	throw new Error("Invalid bolt score");
}

function addScores() {
	const boltCount = scores.value.filter(isBolt).length;

	if (boltCount > 1) {
		alert("Prea multe bolturi");
		return;
	}

	const invalidScores = scores.value.filter(
		(s) => !isBolt(s) && Number.isNaN(Number(s)),
	).length;

	if (invalidScores > 0) {
		alert("Scoruri invalide");
		return;
	}

	const newScores: Scores = [
		valueToScore(0),
		valueToScore(1),
		valueToScore(2),
		valueToScore(3),
	];

	rounds.value.push({
		id: rounds.value.length + 1,
		scores: newScores,
	});
	scores.value = ["", "", "", ""];
}

function removeRound(id: number | undefined) {
	if (rounds.value.length === 0) return;
	if (!confirm("Sigur?")) return;
	const index = rounds.value.findIndex((round) => round.id === id);
	rounds.value.splice(index, 1);
}

function resetGame() {
	if (!confirm("Sigur?")) return;
	rounds.value = [];
	scores.value = ["", "", "", ""];
}
</script>

<template>
	<div class="container mx-auto grid max-w-md gap-4 px-4 py-4">
		<button type="button" @click="resetGame" class="btn">
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
							<Cell :score="round.scores[0]" />
						</td>
						<td>
							<Cell :score="round.scores[1]" />
						</td>
						<td>
							<Cell :score="round.scores[2]" />
						</td>
						<td>
							<Cell :score="round.scores[3]" />
						</td>
					</tr>
				</tbody>
				<tfoot class="bg-base-200 text-xs">
					<tr>
						<th colspan="4">
							<div class="flex items-center justify-between">
								<div class="inline-flex gap-1">
									<span>
										{{ rounds[rounds.length - 1]?.scores[0].total ?? 0 }}
									</span>
									<span>/</span>
									<span>
										{{ rounds[rounds.length - 1]?.scores[1].total ?? 0 }}
									</span>
									<span>/</span>
									<span>
										{{ rounds[rounds.length - 1]?.scores[2].total ?? 0 }}
									</span>
									<span>/</span>
									<span>
										{{ rounds[rounds.length - 1]?.scores[3].total ?? 0 }}
									</span>
								</div>

								<button
									type="button"
									@click="removeRound(rounds[rounds.length - 1]?.id)"
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
			<fieldset class="fieldset">
				<div class="join">
					<input
						v-model="scores[0]"
						class="input join-item focus:z-10"
						placeholder="#1"
						inputmode="numeric"
					/>
					<input
						v-model="scores[1]"
						class="input join-item focus:z-10"
						placeholder="#2"
						inputmode="numeric"
					/>
					<input
						v-model="scores[2]"
						class="input join-item focus:z-10"
						placeholder="#3"
						inputmode="numeric"
					/>
					<input
						v-model="scores[3]"
						class="input join-item focus:z-10"
						placeholder="#4"
						inputmode="numeric"
					/>
				</div>
				<p class="fieldset-label">
					<kbd class="kbd kbd-xs">b</kbd>
					<kbd class="kbd kbd-xs">bt</kbd>
					sau <kbd class="kbd kbd-xs">bolt</kbd> pentru bolt
				</p>
			</fieldset>

			<button type="submit" class="btn block w-full">Adaugă</button>
		</form>
	</div>
</template>
