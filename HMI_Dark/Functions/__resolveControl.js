// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />

(function (/** @type {globalThis.TcHmi} */ TcHmi) {
    var Functions;
    (function (/** @type {globalThis.TcHmi.Functions} */ Functions) {
        var HMI_Dark;
        (function (HMI_Dark) {
               function __resolveControl(controlOrId) {
                    try {
                        // 1) Instância TcHmi.Control
                        if (controlOrId && typeof controlOrId.getElement === 'function') {
                            var $el1 = controlOrId.getElement && controlOrId.getElement();
                            console.log('resolveControl Instancia TcHmi:', $el1);
                            if ($el1) return { ctrl: controlOrId, $el: $el1 };
                           }
                        // 2) jQuery
                        if (controlOrId && controlOrId.jquery) {
                            var idjq = controlOrId.attr('id');
                            if (idjq) {
                                var ctrljq = TcHmi.Controls.get(idjq);
                                console.log(' __resolveControl jquery:', ctrljq);
                                if (ctrljq) return { ctrl: ctrljq, $el: ctrljq.getElement() || controlOrId };
                                
                            }
                           
                            return { ctrl: null, $el: controlOrId };
                        }
                        // 3) HTMLElement
                        if (controlOrId && controlOrId.nodeType === 1) {
                            var idel = controlOrId.id;
                            console.log('__resolveControl Html:', idel);
                            if (idel) {
                                var ctrle = TcHmi.Controls.get(idel);
                                if (ctrle) return { ctrl: ctrle, $el: ctrle.getElement() || $(controlOrId) };
                            }
                            return { ctrl: null, $el: $(controlOrId) };
                        }
                        // 4) String (id)
                        if (typeof controlOrId === 'string' && controlOrId.length) {
                            var ctrl = TcHmi.Controls.get(controlOrId);
                            console.log('resolveControl String:', ctrl);
                            if (ctrl) {
                                var $el = ctrl.getElement && ctrl.getElement();
                                if ($el) return { ctrl: ctrl, $el: $el };
                            }
                        }
                    } catch (e) {
                        console.warn('__resolveControl falhou:', e);
                    }
                    console.log(' __resolveControl jquery:', ctrljq);
                    console.log('_resolveControl falhou:', $el1);
                    console.log('__resolveControl Html:', idel);
                    console.log('resolveControl String:', ctrl);
                    return $el1;
                }
            HMI_Dark.__resolveControl = __resolveControl;
        })(HMI_Dark = Functions.HMI_Dark || (Functions.HMI_Dark = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);
TcHmi.Functions.registerFunctionEx('__resolveControl', 'TcHmi.Functions.HMI_Dark', TcHmi.Functions.HMI_Dark.__resolveControl);

