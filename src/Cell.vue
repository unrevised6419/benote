<script setup lang="ts">
import { formatter, isBoltScore, type Score } from "./utils";

defineProps<{
	score: Score;
}>();
</script>

<template>
	<div class="flex items-center justify-center gap-1">
		<template v-if="isBoltScore(score)">
			{{ score.total }}
			<span v-if="score.delta !== 3" class="badge badge-warning badge-xs">
				&times;{{ score.delta }}
			</span>
			<span v-else class="badge badge-error badge-xs">-10</span>
		</template>
		<template v-else>
			{{ score.total }}
			<span class="badge badge-xs badge-ghost">
				{{ formatter.format(score.delta) }}
			</span>
		</template>
	</div>
</template>
