import { MonksLittleDetails, i18n, log, setting } from "../monks-little-details.js";

export class HUDChanges {
    static init() {
        if (game.settings.get("monks-little-details", "alter-hud")) {
            let tokenHUDRender = function (wrapped, ...args) {
                let result = wrapped(...args).then((a, b) => {
                    HUDChanges.alterHUD.call(this, this.element);
                    CONFIG.statusEffects = CONFIG.statusEffects.filter(e => e.id != "");
                });

                return result;
            }
            if (game.modules.get("lib-wrapper")?.active) {
                libWrapper.register("monks-little-details", "TokenHUD.prototype._render", tokenHUDRender, "WRAPPER");
            } else {
                const oldTokenHUDRender = TokenHUD.prototype._render;
                TokenHUD.prototype._render = function (event) {
                    return tokenHUDRender.call(this, oldTokenHUDRender.bind(this), ...arguments);
                }
            }

            let getStatusEffectChoices = function (wrapped, ...args) {
                if (setting('sort-statuses') != 'none') {
                    CONFIG.statusEffects = CONFIG.statusEffects.sort(function (a, b) {
                        let aid = (a.label != undefined ? i18n(a.label).toLowerCase() : a.id);
                        let bid = (b.label != undefined ? i18n(b.label).toLowerCase() : b.id);
                        return (aid > bid ? 1 : (aid < bid ? -1 : 0));
                    });
                }

                if (setting('sort-statuses') == 'columns') {
                    let effects = [];
                    let tempSet = new Set();
                    let temp = [];
                    CONFIG.statusEffects.filter(e => e.id != "").forEach(effect => {
                        const val = `${effect.icon}-${i18n(effect.label).toLowerCase()}`
                        if (!tempSet.has(val)) {
                            tempSet.add(val);
                            temp.push(effect);
                        }
                    })

                    let mid = Math.ceil(temp.length / 4);
                    for (let i = 0; i < mid; i++) {
                        for (let j = 0; j < 4; j++) {
                            let spot = i + (j * mid)
                            const item = (spot < temp.length ? temp[spot] : { id: '', icon: `//:${spot}`, label: `` })
                            effects.push(item);
                        }
                    }
                    CONFIG.statusEffects = effects;
                }

                return wrapped(...args);
            }

            if (game.modules.get("lib-wrapper")?.active) {
                libWrapper.register("monks-little-details", "TokenHUD.prototype._getStatusEffectChoices", getStatusEffectChoices, "WRAPPER");
            } else {
                const oldGetStatusEffectChoices = TokenHUD.prototype._getStatusEffectChoices;
                TokenHUD.prototype._getStatusEffectChoices = function () {
                    return getStatusEffectChoices.call(this, oldGetStatusEffectChoices.bind(this), ...arguments);
                }
            }

            let refreshStatusIcons = function () {
                const effects = this.element.find(".status-effects")[0];
                const statuses = this._getStatusEffectChoices();
                for (let img of $('[src]', effects)) {
                    const status = statuses[img.getAttribute("src")] || {};
                    img.classList.toggle("overlay", !!status.isOverlay);
                    img.classList.toggle("active", !!status.isActive);
                }
            }

            if (game.modules.get("lib-wrapper")?.active) {
                libWrapper.register("monks-little-details", "TokenHUD.prototype.refreshStatusIcons", refreshStatusIcons, "OVERRIDE");
            } else {
                TokenHUD.prototype.refreshStatusIcons = function (event) {
                    return refreshStatusIcons.call(this);
                }
            }
        }
    }

    static ready() {
        if (setting('sort-by-columns'))
            game.settings.settings.get("monks-little-details.sort-statuses").default = 'columns';
    }

    static async alterHUD(html) {
        if (MonksLittleDetails.canDo("alter-hud") && setting("alter-hud")) {
            $('#token-hud').addClass('monks-little-details').toggleClass('highlight-image', setting('alter-hud-colour'));
            const statuses = this._getStatusEffectChoices();

            for (let img of $('.col.right .control-icon[data-action="effects"] .status-effects > img')) {
                let src = $(img).attr('src');
                if (src == '') {
                    $(img).css({ 'visibility': 'hidden' });
                } else {
                    //const status = statuses[img.getAttribute("src")] || {};
                    let title = $(img).attr('title') || $(img).attr('data-condition');
                    let div = $('<div>')
                        .addClass('effect-container')//$(img).attr('class'))
                        //.toggleClass('active', !!status.isActive)
                        .attr('title', title)
                        //.attr('src', $(img).attr('src'))
                        .insertAfter(img)
                        .append(img)//.removeClass('effect-control'))
                        .append($('<div>').addClass('effect-name').html(title)
                        );
                }
            };

            $('.col.right .control-icon[data-action="effects"] .status-effects > div.pf2e-effect-img-container', html).each(function () {
                let img = $('img', this);
                let title = img.attr('data-condition');
                let div = $('<div>').addClass('effect-name').attr('title', title).html(title).insertAfter(img);
                //$(this).append(div);
                //const status = statuses[img.attr('src')] || {};
                //$(this).attr('src', img.attr('src')).toggleClass('active', !!status.isActive);
            });

            if (game.system.id !== 'pf2e') {
                $('.col.right .control-icon[data-action="effects"] .status-effects', html).append(
                    $('<div>').addClass('clear-all').html('<i class="fas fa-times-circle"></i> clear all').click($.proxy(HUDChanges.clearAll, this))
                );
            }
        }
    }

    static async clearAll(e) {
        //find the tokenhud, get the TokenHUD.object  ...assuming it's a token?
        const statuses = this._getStatusEffectChoices();

        for (const [k, status] of Object.entries(statuses)) {
            if (status.isActive) {
                await this.object.toggleEffect({ id: status.id, icon: status.src });
            }
        }

        e.preventDefault();
    }
}