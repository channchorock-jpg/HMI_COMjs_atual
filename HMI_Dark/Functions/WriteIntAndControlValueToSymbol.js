// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.

/// <reference path="../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />

(function (/** @type {globalThis.TcHmi} */ TcHmi) {
    var Functions;
    (function (Functions) {
        var HMI_Dark;
        (function (HMI_Dark) {

            /**
             * Se iSelector == 0 escreve o Value do controle em symbolIfZero.
             * Caso contrário, escreve em symbolIfNotZero.
             *
             * @param {number} iSelector         Inteiro seletor (0 => symbolIfZero, !=0 => symbolIfNotZero)
             * @param {string} controlId         ID do controle de onde ler "Value" (pode vir por binding, ex.: %ctrl%InputBox_SetPoint::id%/ctrl%)
             * @param {string} symbolIfZero      Símbolo destino quando iSelector == 0
             * @param {string} symbolIfNotZero   Símbolo destino quando iSelector != 0
             * @param {any=}   __context         (padrão v1.12) contexto do Actions & Conditions
             * @returns {boolean}                true se iniciou a escrita; false se falhou imediatamente
             */
            function WriteControlValueBySelector(ctx, iSelector, controlId, symbolIfZero, symbolIfNotZero) {
                try {
                    // Validações simples
                    if (typeof iSelector !== 'number' || !isFinite(iSelector)) {
                        console.warn('[WriteControlValueBySelector] iSelector inválido:', iSelector);
                        return false;
                    }
                    if (typeof controlId !== 'string' || !controlId) {
                        console.warn('[WriteControlValueBySelector] controlId inválido.', controlId);
                        return false;
                    }
                    if (typeof symbolIfZero !== 'string' || !symbolIfZero) {
                        console.warn('[WriteControlValueBySelector] symbolIfZero inválido.', symbolIfZero);
                        return false;
                    }
                    if (typeof symbolIfNotZero !== 'string' || !symbolIfNotZero) {
                        console.warn('[WriteControlValueBySelector] symbolIfNotZero inválido.');
                        return false;
                    }

                    // Resolve controle e lê Value
                    var ctrl = TcHmi.Controls.get(controlId);
                    if (!ctrl) {
                        console.warn('[WriteControlValueBySelector] Controle não encontrado:', controlId);
                        return false;
                    }

                    if (typeof ctrl.getValue !== 'function') {
                        console.warn('[WriteControlValueBySelector] O controle não expõe getValue(). Controle:', controlId);
                        return false;
                    }

                    var valueToWrite;
                    try {
                        valueToWrite = ctrl.getValue();
                    } catch (e) {
                        console.error('[WriteControlValueBySelector] Falha ao ler Value do controle:', e);
                        return false;
                    }

                    // Decide símbolo
                    var targetSymbol = (iSelector === 0) ? symbolIfZero : symbolIfNotZero;

                    // Escreve no símbolo
                    TcHmi.Symbol.writeEx(targetSymbol, valueToWrite, function (res) {
                        if (res && res.error) {
                            console.error('[WriteControlValueBySelector] writeEx falhou:', res.error);
                            if (__context && typeof __context.error === 'function') {
                                __context.error('writeEx error: ' + res.error);
                            }
                            return;
                        }
                        if (__context && typeof __context.success === 'function') {
                            __context.success(true);
                        }
                    });

                    return true;
                } catch (err) {
                    console.error('[WriteControlValueBySelector] erro:', err);
                    return false;
                }
            }

            // Registro (v1.12) — aparece no Actions & Conditions (Functions)
            TcHmi.Functions.registerFunctionEx(
                'WriteControlValueBySelector',
                'TcHmi.Functions.HMI_Dark',
                WriteControlValueBySelector
            );

        })(HMI_Dark = Functions.HMI_Dark || (Functions.HMI_Dark = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);
