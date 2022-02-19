import { MonksLittleDetails, i18n } from "./monks-little-details.js";

export const registerSettings = function () {
    // Register any custom module settings here
	let modulename = "monks-little-details";

	const debouncedReload = foundry.utils.debounce(function () { window.location.reload(); }, 100);
	
	let dialogpositions = {
		'': '—',
		'topleft': 'Top Left',
		'topright': 'Top Right',
		'bottomleft': 'Bottom Left',
		'bottomright': 'Bottom Right'
	};

	let opencombatoptions = {
		'none': i18n("MonksLittleDetails.combatopen.none"),
		'everyone': i18n("MonksLittleDetails.combatopen.everyone"),
		'gmonly': i18n("MonksLittleDetails.combatopen.gm"),
		'playersonly': i18n("MonksLittleDetails.combatopen.players")
	};

	let sortstatus = {
		'none': i18n("MonksLittleDetails.sortstatus.none"),
		'rows': i18n("MonksLittleDetails.sortstatus.rows"),
		'columns': i18n("MonksLittleDetails.sortstatus.columns")
	};

	//System changes
	game.settings.register(modulename, "swap-buttons", {
		name: i18n("MonksLittleDetails.swap-buttons.name"),
		hint: i18n("MonksLittleDetails.swap-buttons.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
	});
	game.settings.register(modulename, "alter-hud", {
		name: i18n("MonksLittleDetails.alter-hud.name"),
		hint: i18n("MonksLittleDetails.alter-hud.hint"),
		scope: "world",
		config: MonksLittleDetails.canDo("alter-hud"),
		default: true,
		type: Boolean,
		onChange: debouncedReload
	});
	game.settings.register(modulename, "sort-by-columns", {
		name: i18n("MonksLittleDetails.sort-by-columns.name"),
		hint: i18n("MonksLittleDetails.sort-by-columns.hint"),
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});
	game.settings.register(modulename, "sort-statuses", {
		name: i18n("MonksLittleDetails.sort-statuses.name"),
		hint: i18n("MonksLittleDetails.sort-statuses.hint"),
		scope: "world",
		config: MonksLittleDetails.canDo("sort-statuses"),
		default: 'rows',
		type: String,
		choices: sortstatus,
		onChange: debouncedReload
	});
	game.settings.register(modulename, "alter-hud-colour", {
		name: i18n("MonksLittleDetails.alter-hud-colour.name"),
		hint: i18n("MonksLittleDetails.alter-hud-colour.hint"),
		scope: "world",
		config: MonksLittleDetails.canDo("alter-hud"),
		default: true,
		type: Boolean,
	});
	game.settings.register(modulename, "add-extra-statuses", {
		name: i18n("MonksLittleDetails.add-extra-statuses.name"),
		hint: i18n("MonksLittleDetails.add-extra-statuses.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
	});
	game.settings.register(modulename, "popout-combat", {
		name: i18n("MonksLittleDetails.opencombat.name"),
		hint: i18n("MonksLittleDetails.opencombat.hint"),
		scope: "client",
		config: true,
		default: true,
		type: Boolean
	});
	game.settings.register(modulename, "opencombat", {
		name: i18n("MonksLittleDetails.opencombat.name"),
		hint: i18n("MonksLittleDetails.opencombat.hint"),
		scope: "world",
		config: true,
		choices: opencombatoptions,
		default: "everyone",
		type: String
	});
	game.settings.register(modulename, "combat-position", {
		name: i18n("MonksLittleDetails.combat-position.name"),
		hint: i18n("MonksLittleDetails.combat-position.hint"),
		scope: "world",
		default: null,
		type: String,
		choices: dialogpositions,
		config: true
	});
	game.settings.register(modulename, "close-combat-when-done", {
		name: i18n("MonksLittleDetails.close-combat-when-done.name"),
		hint: i18n("MonksLittleDetails.close-combat-when-done.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
	});
};
