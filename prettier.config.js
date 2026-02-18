import base from "@all1ndev/prettier-config" with { type: "json" };

export default {
	...base,
	plugins: ["prettier-plugin-tailwindcss"],
};
