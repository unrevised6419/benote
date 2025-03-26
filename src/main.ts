import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createWebHistory, createRouter } from "vue-router";
import "./style.css";
import App from "./App.vue";
import Create from "./Create.vue";
import Game from "./Game/index.vue";
import Lobby from "./Lobby.vue";

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: "/", component: Lobby },
		{ path: "/create", component: Create },
		{ path: "/:id", component: Game },
	],
});

createApp(App).use(router).use(VueQueryPlugin).mount("#app");
