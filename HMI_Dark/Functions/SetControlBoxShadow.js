// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.***.***/runtimes/native1.12-tchmi/TcHmi.d.ts" />

(function (/** @type {globalThis.TcHmi} */ TcHmi) {
    "use strict";
    var Functions;
    (function (Functions) {
        var HMI_Dark;
        (function (HMI_Dark) {

            function __resolveControl(controlOrId) {
                try {
                    // 1) Instância TcHmi.Control
                    if (controlOrId && typeof controlOrId.getElement === 'function') {
                        var $el1 = controlOrId.getElement && controlOrId.getElement();
                        if ($el1) return { ctrl: controlOrId, $el: $el1 };
                    }
                    // 2) jQuery
                    if (controlOrId && controlOrId.jquery) {
                        var idjq = controlOrId.attr('id');
                        if (idjq) {
                            var ctrljq = TcHmi.Controls.get(idjq);
                            if (ctrljq) return { ctrl: ctrljq, $el: ctrljq.getElement() || controlOrId };
                        }
                        return { ctrl: null, $el: controlOrId };
                    }
                    // 3) HTMLElement
                    if (controlOrId && controlOrId.nodeType === 1) {
                        var idel = controlOrId.id;
                        if (idel) {
                            var ctrle = TcHmi.Controls.get(idel);
                            if (ctrle) return { ctrl: ctrle, $el: ctrle.getElement() || $(controlOrId) };
                        }
                        return { ctrl: null, $el: $(controlOrId) };
                    }
                    // 4) String (id)
                    if (typeof controlOrId === 'string' && controlOrId.length) {
                        var ctrl = TcHmi.Controls.get(controlOrId);
                        if (ctrl) {
                            var $el = ctrl.getElement && ctrl.getElement();
                            if ($el) return { ctrl: ctrl, $el: $el };
                        }
                    }
                } catch (e) {
                    console.warn('[SetControlBoxShadow] __resolveControl falhou:', e);
                }
                return null;
            }

            // Converte valor + unidade (ex.: 8 + "px") em string. Se unidade faltar, assume "px".
            function __valUnit(val, unit) {
                if (typeof val !== 'number') return '0px';
                var u = (typeof unit === 'string' && unit.length) ? unit : 'px';
                return String(val) + u;
            }

            // Converte um item de BoxShadow do framework em CSS:
            // CSS: [inset] offset-x offset-y blur-radius spread-radius color
            function __oneShadowToCss(sh) {
                if (!sh || typeof sh !== 'object') return null;

                var inset = sh.inset ? 'inset ' : '';
                var ox = __valUnit(sh.offsetX, sh.offsetXUnit);
                var oy = __valUnit(sh.offsetY, sh.offsetYUnit);
                var blur = __valUnit(sh.blur, sh.blurUnit);
                var spread = __valUnit(sh.spread, sh.spreadUnit);

                // cor pode vir como objeto { color: "rgba(...)" }
                var color = '';
                if (sh.color && typeof sh.color === 'object' && typeof sh.color.color === 'string') {
                    color = sh.color.color;
                } else if (typeof sh.color === 'string') {
                    color = sh.color; // fallback se vier direto
                } else {
                    color = 'rgba(0,0,0,0.5)'; // fallback de segurança
                }

                return inset + ox + ' ' + oy + ' ' + blur + ' ' + spread + ' ' + color;
            }

            /**
             * Aplica uma lista de box-shadows (BoxShadowList do framework) ao controle.
             * @param {any} control         Control/HTMLElement/jQuery/Id do controle alvo.
             * @param {Array} boxShadowList BoxShadowList do framework (array de objetos de sombra).
             * @returns {boolean}
             */
            function SetControlBoxShadow(control, boxShadowList) {
                try {
                    var resolved = __resolveControl(control);
                    if (!resolved || !resolved.$el) {
                        console.warn('[SetControlBoxShadow] Não foi possível resolver o controle.');
                        return false;
                    }

                    if (!Array.isArray(boxShadowList)) {
                        console.warn('[SetControlBoxShadow] boxShadowList inválido; forneça um array (BoxShadowList).');
                        return false;
                    }

                    var cssParts = [];
                    for (var i = 0; i < boxShadowList.length; i++) {
                        var part = __oneShadowToCss(boxShadowList[i]);
                        if (typeof part === 'string' && part.length) cssParts.push(part);
                    }

                    // Se não há partes válidas, zera a sombra
                    var css = (cssParts.length > 0) ? cssParts.join(', ') : 'none';

                    // Snapshot: salva o original apenas uma vez
                    if (typeof resolved.$el.data('orig_boxshadow') === 'undefined') {
                        resolved.$el.data('orig_boxshadow', resolved.$el.css('box-shadow'));
                    }

                    resolved.$el.css('box-shadow', css);
                    return true;
                } catch (err) {
                    console.error('[SetControlBoxShadow] erro:', err);
                    return false;
                }
            }

            TcHmi.Functions.registerFunctionEx(
                'SetControlBoxShadow',
                'TcHmi.Functions.HMI_Dark',
                SetControlBoxShadow
            );

        })(HMI_Dark = Functions.HMI_Dark || (Functions.HMI_Dark = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);
