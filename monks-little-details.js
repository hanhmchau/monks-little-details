import { registerSettings } from "./settings.js";
import { HUDChanges } from "./js/hud-changes.js";

export let debugEnabled = 0;

export let debug = (...args) => {
    if (debugEnabled > 1) console.log("DEBUG: monks-little-details | ", ...args);
};
export let log = (...args) => console.log("monks-little-details | ", ...args);
export let warn = (...args) => {
    if (debugEnabled > 0) console.warn("WARN: monks-little-details | ", ...args);
};
export let error = (...args) => console.error("monks-little-details | ", ...args);

export const setDebugLevel = (debugText) => {
    debugEnabled = { none: 0, warn: 1, debug: 2, all: 3 }[debugText] || 0;
    // 0 = none, warnings = 1, debug = 2, all = 3
    if (debugEnabled >= 3)
        CONFIG.debug.hooks = true;
};

export let i18n = key => {
    return game.i18n.localize(key);
};
export let setting = key => {
    return game.settings.get("monks-little-details", key);
};
export let combatposition = () => {
    return game.settings.get("monks-little-details", "combat-position");
};

export class MonksLittleDetails {
    static tracker = false;
    static tokenHUDimages = {};

    static canDo(setting) {
        //needs to not be on the reject list, and if there is an only list, it needs to be on it.
        if (MonksLittleDetails._rejectlist[setting] != undefined && MonksLittleDetails._rejectlist[setting].includes(game.system.id))
            return false;
        if (MonksLittleDetails._onlylist[setting] != undefined && !MonksLittleDetails._onlylist[setting].includes(game.system.id))
            return false;
        return true;
    };

    static init() {
        if (game.MonksLittleDetails == undefined)
            game.MonksLittleDetails = MonksLittleDetails;

        MonksLittleDetails.READY = true;

        MonksLittleDetails._rejectlist = {
            //"alter-hud": ["pf2e"]
        }
        MonksLittleDetails._onlylist = {
            "sort-by-columns": ["dnd5e"],
            "show-combat-cr": ["dnd5e", "pf2e"]
        }

        registerSettings();

        if (MonksLittleDetails.canDo("add-extra-statuses") && setting("add-extra-statuses")) {
            CONFIG.statusEffects = CONFIG.statusEffects.concat(
                [
                    { "id": "charmed", "label": "MonksLittleDetails.StatusCharmed", "icon": "modules/monks-little-details/icons/smitten.svg" },
                    { "id": "exhausted", "label": "MonksLittleDetails.StatusExhausted", "icon": "modules/monks-little-details/icons/oppression.svg" },
                    { "id": "grappled", "label": "MonksLittleDetails.StatusGrappled", "icon": "modules/monks-little-details/icons/grab.svg" },
                    { "id": "incapacitated", "label": "MonksLittleDetails.StatusIncapacitated", "icon": "modules/monks-little-details/icons/internal-injury.svg" },
                    { "id": "invisible", "label": "MonksLittleDetails.StatusInvisible", "icon": "modules/monks-little-details/icons/invisible.svg" },
                    { "id": "petrified", "label": "MonksLittleDetails.StatusPetrified", "icon": "modules/monks-little-details/icons/stone-pile.svg" },
                    { "id": "hasted", "label": "MonksLittleDetails.StatusHasted", "icon": "modules/monks-little-details/icons/running-shoe.svg" },
                    { "id": "slowed", "label": "MonksLittleDetails.StatusSlowed", "icon": "modules/monks-little-details/icons/turtle.svg" },
                    { "id": "concentration", "label": "MonksLittleDetails.StatusConcentrating", "icon": "modules/monks-little-details/icons/beams-aura.svg" },
                    { "id": "rage", "label": "MonksLittleDetails.StatusRage", "icon": "modules/monks-little-details/icons/enrage.svg" },
                    { "id": "distracted", "label": "MonksLittleDetails.StatusDistracted", "icon": "modules/monks-little-details/icons/distraction.svg" },
                    { "id": "dodging", "label": "MonksLittleDetails.StatusDodging", "icon": "modules/monks-little-details/icons/dodging.svg" },
                    { "id": "disengage", "label": "MonksLittleDetails.StatusDisengage", "icon": "modules/monks-little-details/icons/journey.svg" },
                    { "id": "cover", "label": "MonksLittleDetails.StatusCover", "icon": "modules/monks-little-details/icons/push.svg" }
                ]
            );
        }

        if (setting("alter-hud"))
            HUDChanges.init();
    }

    static ready() {
        HUDChanges.ready();
    }
    
    static repositionCombat(app) {
        //we want to start the dialog in a different corner
        let sidebar = document.getElementById("sidebar");
        let players = document.getElementById("players");

        app.position.left = (combatposition().endsWith('left') ? 120 : (sidebar.offsetLeft - app.position.width));
        app.position.top = (combatposition().startsWith('top') ?
            (combatposition().endsWith('left') ? 70 : (sidebar.offsetTop - 3)) :
            (combatposition().endsWith('left') ? (players.offsetTop - app.position.height - 3) : (sidebar.offsetTop + sidebar.offsetHeight - app.position.height - 3)));

        $(app._element).css({ top: app.position.top, left: app.position.left });
    }

    static checkPopout(combat, delta) {
        let combatStarted = (combat && combat.started === true && ((delta.round === 1 && combat.turn === 0 ) || delta.bypass));

        //log("update combat", combat);
        let opencombat = setting("opencombat");

        //popout combat (if gm and opencombat is everyone or gm only), (if player and opencombat is everyone or players only and popout-combat)
        if (((game.user.isGM && ['everyone', 'gmonly'].includes(opencombat)) ||
            (!game.user.isGM && ['everyone', 'playersonly'].includes(opencombat) && game.settings.get("monks-little-details", "popout-combat")))
            && combatStarted) {
            //new combat, pop it out
            const tabApp = ui["combat"];
            tabApp.renderPopout(tabApp);

            if (ui.sidebar.activeTab !== "chat")
                ui.sidebar.activateTab("chat");
        }

        if (combatposition() !== '' && delta.active === true) {
            //+++ make sure if it's not this players turn and it's not the GM to add padding for the button at the bottom
            MonksLittleDetails.tracker = false;   //delete this so that the next render will reposition the popout, changing between combats changes the height
        }
    }
}

Hooks.once('init', async function () {
    MonksLittleDetails.init();
});

Hooks.on("createCombat", function (data, delta) {
    //when combat is created, switch to combat tab
    if (game.user.isGM && ui.sidebar.activeTab !== "combat")
        ui.sidebar.activateTab("combat");
});

Hooks.on("deleteCombat", function (combat) {
    MonksLittleDetails.tracker = false;   //if the combat gets deleted, make sure to clear this out so that the next time the combat popout gets rendered it repositions the dialog

    //if there are no more combats left, then close the combat window
    if (game.combats.combats.length == 0 && game.settings.get("monks-little-details", 'close-combat-when-done')) {
        const tabApp = ui["combat"];
        if (tabApp._popout != undefined) {
            MonksLittleDetails.closeCount = 0;
            MonksLittleDetails.closeTimer = setInterval(function () {
                MonksLittleDetails.closeCount++;
                const tabApp = ui["combat"];
                if (MonksLittleDetails.closeCount > 100 || tabApp._popout == undefined) {
                    clearInterval(MonksLittleDetails.closeTimer);
                    return;
                }

                const states = tabApp?._popout.constructor.RENDER_STATES;
                if (![states.CLOSING, states.RENDERING].includes(tabApp?._popout._state)) {
                    tabApp?._popout.close();
                    clearInterval(MonksLittleDetails.closeTimer);
                }
            }, 100);
        }
    }
});

Hooks.on("updateCombat", async function (combat, delta) {
    MonksLittleDetails.checkPopout(combat, delta);
});

Hooks.on("createCombatant", async function (combatant, delta, userId) {
    MonksLittleDetails.checkPopout(combatant.combat, {active: true, bypass: true});
});

Hooks.on("ready", MonksLittleDetails.ready);

Hooks.on('closeCombatTracker', async (app, html) => {
    MonksLittleDetails.tracker = false;
});

Hooks.on('renderTokenHUD', async (app, html, options) => {
    MonksLittleDetails.element = html;
    //MonksLittleDetails.tokenHUD = app;
});

Hooks.on('renderCombatTracker', async (app, html, data) => {
    if (!MonksLittleDetails.tracker && app.options.id == "combat-popout") {
        MonksLittleDetails.tracker = true;

        if (combatposition() !== '') {
            MonksLittleDetails.repositionCombat(app);
        }
    }

    //don't show the previous or next turn if this isn't the GM
    if (!game.user.isGM && data.combat && data.combat.started) {
        $('.combat-control[data-control="previousTurn"],.combat-control[data-control="nextTurn"]:last').css({visibility:'hidden'});
    }
});
