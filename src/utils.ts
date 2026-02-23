export type Score = {
	type: "normal" | "bolt";
	total: number;
	delta: number;
	boltCount: number;
	// hangTotal: number;
};

export type Round = {
	scores: ReadonlyArray<Score>;
};

export interface Team {
	readonly name: string;
	readonly players: ReadonlyArray<Player>;
}

export interface Player {
	readonly name: string;
}

export type Game = {
	readonly id: string;
	readonly title: string;
	readonly teams: ReadonlyArray<Team>;
	readonly createdDate: string;
	readonly totalPlayersCount: number;

	rounds: ReadonlyArray<Round>;
};

export const key = (id: string) => `wolverine1007:${id}`;

export const formatter = Intl.NumberFormat(navigator.languages, {
	signDisplay: "always",
});

export function isBolt(value: string | undefined): boolean {
	if (value == null) return false;
	value = value.toLowerCase();
	return ["bolt", "b", "bt"].includes(value);
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

export function wrap(val: number, min: number, max: number): number {
	return ((((val - min) % (max - min)) + (max - min)) % (max - min)) + min;
}
