// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="../../Packages/Beckhoff.TwinCAT HMI.Framework.12.***.***/runtimes/native1.12-tchmi/TcHmi.d.ts" />

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
                    console.warn('[SetControlColor] __resolveControl falhou:', e);
                }
                return null;
            }

            /**
             * Converte objeto "Color" do framework em string CSS para BACKGROUND.
             * - Sólido: { color: "rgba(...)" } → retorna a string rgba
             * - Gradiente: { angle, stopPoints:[{color,stop}, ...] } → "linear-gradient(<angle>deg, c1 stop, c2 stop, ...)"
             * Fallback de gradiente incompleto: usa a primeira cor válida.
             */
            function __colorFrameworkToCssBackground(colorObj) {
                try {
                    if (!colorObj || typeof colorObj !== 'object') return null;

                    // Sólido
                    if (typeof colorObj.color === 'string' && colorObj.color.length) {
                        return colorObj.color;
                    }

                    // Gradiente
                    if (Array.isArray(colorObj.stopPoints) && colorObj.stopPoints.length > 0) {
                        var parts = [];
                        for (var i = 0; i < colorObj.stopPoints.length; i++) {
                            var sp = colorObj.stopPoints[i];
                            if (!sp || typeof sp.color !== 'string' || !sp.color.length) continue;
                            var stop = (typeof sp.stop === 'string' && sp.stop.length) ? sp.stop : null;
                            parts.push(stop ? (sp.color + ' ' + stop) : sp.color);
                        }
                        if (parts.length > 0) {
                            var angle = (typeof colorObj.angle === 'number') ? colorObj.angle : 0;
                            return 'linear-gradient(' + angle + 'deg, ' + parts.join(', ') + ')';
                        }
                        // Fallback: primeira cor válida
                        var first = colorObj.stopPoints[0];
                        if (first && typeof first.color === 'string' && first.color.length) {
                            return first.color;
                        }
                    }
                } catch (e) {
                    console.warn('[SetControlColor] __colorFrameworkToCssBackground falhou:', e);
                }
                return null;
            }

            /**
             * Converte objeto "Color" do framework em string CSS para TEXTO.
             * - Sólido: { color: "rgba(...)" } → retorna a string rgba
             * - Gradiente: usa a PRIMEIRA cor (CSS 'color' não aceita gradient).
             */
            function __colorFrameworkToCssText(colorObj) {
                try {
                    if (!colorObj || typeof colorObj !== 'object') return null;

                    // Sólido
                    if (typeof colorObj.color === 'string' && colorObj.color.length) {
                        return colorObj.color;
                    }

                    // Gradiente → primeira cor válida
                    if (Array.isArray(colorObj.stopPoints) && colorObj.stopPoints.length > 0) {
                        for (var i = 0; i < colorObj.stopPoints.length; i++) {
                            var sp = colorObj.stopPoints[i];
                            if (sp && typeof sp.color === 'string' && sp.color.length) {
                                return sp.color;
                            }
                        }
                    }
                } catch (e) {
                    console.warn('[SetControlColor] __colorFrameworkToCssText falhou:', e);
                }
                return null;
            }

            /**
             * Aplica cor de fundo (Color do framework; sólido/gradiente) e, opcionalmente, cor da fonte (Color do framework; sólido ou fallback de gradiente).
             * @param {any}    control    Control/HTMLElement/jQuery/Id do controle alvo.
             * @param {object} color      Objeto Color do framework para o FUNDO (obrigatório).
             * @param {object=} fontColor Objeto Color do framework para a FONTE (opcional).
             * @returns {boolean}
             */
            function SetControlColor(control, color, fontColor) {
                try {
                    var resolved = __resolveControl(control);
                    if (!resolved || !resolved.$el) {
                        console.warn('[SetControlColor] Não foi possível resolver o controle.');
                        return false;
                    }

                    // BACKGROUND (obrigatório)
                    var bgCss = __colorFrameworkToCssBackground(color);
                    if (typeof bgCss !== 'string' || !bgCss.length) {
                        console.warn('[SetControlColor] Parâmetro "color" inválido. Forneça Color do framework (sólido/gradiente).');
                        return false;
                    }

                    // Snapshot original (uma única vez)
                    if (typeof resolved.$el.data('orig_bg') === 'undefined') {
                        resolved.$el.data('orig_bg', resolved.$el.css('background'));
                    }
                    if (typeof resolved.$el.data('orig_fg') === 'undefined') {
                        resolved.$el.data('orig_fg', resolved.$el.css('color'));
                    }

                    // Aplica background
                    resolved.$el.css('background', bgCss);

                    // FONTE (opcional): transforma para sólido
                    if (typeof fontColor === 'object' && fontColor) {
                        var fgCss = __colorFrameworkToCssText(fontColor);
                        if (typeof fgCss === 'string' && fgCss.length) {
                            resolved.$el.css('color', fgCss);
                        } else {
                            console.warn('[SetControlColor] "fontColor" informado, mas não foi possível converter para cor sólida (usando cor de texto atual).');
                        }
                    }

                    return true;
                } catch (err) {
                    console.error('[SetControlColor] erro:', err);
                    return false;
                }
            }

            TcHmi.Functions.registerFunctionEx(
                'SetControlColor',
                'TcHmi.Functions.HMI_Dark',
                SetControlColor
            );

        })(HMI_Dark = Functions.HMI_Dark || (Functions.HMI_Dark = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);
