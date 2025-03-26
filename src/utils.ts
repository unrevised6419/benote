export type ScoreNormal = {
	type: "normal";
	total: number;
	delta: number;
};

export type ScoreBolt = {
	type: "bolt";
	total: number;
	delta: 1 | 2 | 3;
};

export type ScoreEgg = {
	type: "egg";
	total: number;
	delta: number;
};

export type Score = ScoreNormal | ScoreBolt | ScoreEgg;
export type Round = {
	id: string;
	scores: ReadonlyArray<Score>;
};
export type Game = {
	readonly id: string;
	readonly title: string;
	readonly players: ReadonlyArray<string>;
	collected: number;
	rounds: ReadonlyArray<Round>;
};

export const key = (id: string) => `wolverine1003:${id}`;

export const formatter = Intl.NumberFormat(navigator.languages, {
	signDisplay: "always",
});

export function isBolt(value: string): boolean {
	value = value.toLowerCase();
	return ["bolt", "b", "bt"].includes(value);
}

export function isBoltScore(score: Score): score is ScoreBolt {
	return score.type === "bolt";
}

export const id = () => {
	return Math.random().toString(36).slice(2);
};

export function firstOrSelf<T>(
	value: T | T[] | null | undefined,
): T | undefined {
	if (value == null) return;
	return Array.isArray(value) ? value.at(0) : value;
}
