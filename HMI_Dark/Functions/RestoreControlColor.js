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
                    console.warn('[RestoreControlColor] __resolveControl falhou:', e);
                }
                return null;
            }

            /**
             * Restaura a cor de fundo e a cor de texto originais
             * (salvas por SetControlColor em data('orig_bg') e data('orig_fg')).
             * @param {any} control  Control/HTMLElement/jQuery/Id do controle alvo.
             * @returns {boolean}
             */
            function RestoreControlColor(control) {
                try {
                    var resolved = __resolveControl(control);
                    if (!resolved || !resolved.$el) {
                        console.warn('[RestoreControlColor] Não foi possível resolver o controle.');
                        return false;
                    }

                    var $el = resolved.$el;

                    // Restaura BACKGROUND, se salvo
                    var origBg = $el.data('orig_bg');
                    if (typeof origBg !== 'undefined') {
                        $el.css('background', origBg);
                    }

                    // Restaura FONTE (texto), se salva
                    var origFg = $el.data('orig_fg');
                    if (typeof origFg !== 'undefined') {
                        $el.css('color', origFg);
                    }

                    // (Opcional) Se quiser "esquecer" os snapshots após restaurar:
                    // $el.removeData('orig_bg');
                    // $el.removeData('orig_fg');

                    return true;
                } catch (err) {
                    console.error('[RestoreControlColor] erro:', err);
                    return false;
                }
            }

            TcHmi.Functions.registerFunctionEx(
                'RestoreControlColor',
                'TcHmi.Functions.HMI_Dark',
                RestoreControlColor
            );

        })(HMI_Dark = Functions.HMI_Dark || (Functions.HMI_Dark = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);
