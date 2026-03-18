export type Score = {
	type: "normal" | "bolt" | "hang" | "hang-win";
	total: number;
	delta: number;
	boltCount: number;
};

export type Round = {
	scores: ReadonlyArray<Score>;
	roundTotal: number;
	hangTotal: number;
	createdDate: string;
	duration: number;
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

export const key = (id: string) => `wolverine1010:${id}`;

export const formatter = Intl.NumberFormat(navigator.languages, {
	signDisplay: "always",
});

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

export function formatDuration(duration: number): string {
	if (duration < 1000 * 60) {
		const seconds = Math.ceil(duration / 1000);
		return `${seconds}s`;
	} else {
		return `${Math.ceil(duration / 1000 / 60)}m`;
	}
}
