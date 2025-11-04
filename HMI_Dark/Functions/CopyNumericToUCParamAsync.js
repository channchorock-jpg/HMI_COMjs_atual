// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />

(function (/** @type {globalThis.TcHmi} */TcHmi) {
    var Functions;
    (function (Functions) {
        var HMI_Dark;
        (function (HMI_Dark) {

            /**
             * @param {TcHmi.Context} __context   Contexto assíncrono injetado pelo framework (A&C com waitMode=Asynchronous)
             * @param {string} numericInputId     ID do TcHmiNumericInput (ex.: "MeuUC.InputBox_SetPoint")
             * @param {string} userControlId      ID do UserControl raiz (ex.: "MeuUC")
             * @param {string} setterName         Nome do setter do parâmetro interno do UC (ex.: "setTargetValue")
             */
            function CopyNumericToUCParamAsync(ctx, numericInputId, userControlId, setterName) {
                // Cancelamento: se a view for destacada durante a operação, marcamos "cancelled".
                var cancelled = false;
                var unregister = TcHmi.EventProvider.register('onDetached', function () {
                    cancelled = true;
                });

                try {
                    // 1) Obter controles por ID (API oficial Controls.get)
                    var input = TcHmi.Controls.get(numericInputId);
                    var uc    = TcHmi.Controls.get(userControlId);
                    if (!input || !uc || typeof input.getValue !== 'function') {
                        if (unregister) unregister();
                        __context.error('IDs inválidos ou controle sem getValue()');
                        return;
                    }

                    // 2) Ler valor do NumericInput (getValue)
                    var value = input.getValue();

                    // 3) Executar de forma assíncrona "real" (próximo tick) e sinalizar término pelo __context
                    setTimeout(function () {
                        try {
                            if (cancelled) {
                                if (unregister) unregister();
                                return;
                            }
                            var setter = uc[setterName];
                            if (typeof setter !== 'function') {
                                if (unregister) unregister();
                                __context.error('Setter não encontrado no UserControl: ' + setterName);
                                return;
                            }
                            setter.call(uc, value);

                            if (unregister) unregister();
                            __context.success(true);
                        } catch (innerErr) {
                            if (unregister) unregister();
                            __context.error(innerErr && innerErr.message ? innerErr.message : String(innerErr));
                        }
                    }, 0);

                } catch (err) {
                    if (unregister) unregister();
                    __context.error(err && err.message ? err.message : String(err));
                }
            }

            // Registro para uso no Actions & Conditions (namespace do projeto)
            TcHmi.Functions.registerFunctionEx('CopyNumericToUCParamAsync', 'TcHmi.Functions.HMI_Dark', CopyNumericToUCParamAsync);

        })(HMI_Dark = Functions.HMI_Dark || (Functions.HMI_Dark = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);