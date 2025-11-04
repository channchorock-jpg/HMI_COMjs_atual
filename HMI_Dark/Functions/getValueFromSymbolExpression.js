// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />
(function (/** @type {globalThis.TcHmi.Functions} */TcHmi) {
    'use strict';

    // Namespace do projeto
    TcHmi = TcHmi || {};
    TcHmi.Functions = TcHmi.Functions || {};
    TcHmi.Functions.HMI_Dark = TcHmi.Functions.HMI_Dark || {};
    var NS = TcHmi.Functions.HMI_Dark;

    /**
     * Utilitário: lê o valor diretamente da expressão já montada em __expression.__expression.
     * Retorna uma Promise resolvida com o valor.
     * @param {object} symbolObj Objeto de símbolo (não string JSON).
     * @returns {Promise<any>}
     */
    NS.getValueFromSymbolExpressionPromise = function (symbolObj) {
        return new Promise(function (resolve, reject) {
            if (!symbolObj || !symbolObj.__symbol || !symbolObj.__symbol.__expression) {
                reject({ code: -10, message: 'Objeto de símbolo inválido.' });
                return;
            }
            if (typeof TcHmi === 'undefined' || !TcHmi.Symbol || !TcHmi.Errors) {
                reject({ code: -11, message: 'Runtime TcHmi indisponível.' });
                return;
            }

            var expr = symbolObj.__symbol.__expression.__expression;
            if (typeof expr !== 'string' || !expr) {
                reject({ code: -12, message: 'Expressão ausente ou inválida em __expression.__expression.' });
                return;
            }

            try {
                TcHmi.Symbol.readEx2(expr, function (data) {
                    if (!data) {
                        reject({ code: -13, message: 'readEx2 não retornou dados.' });
                        return;
                    }
                    if (data.error === TcHmi.Errors.NONE) {
                        resolve(data.value);
                    } else {
                        var code = data.error;
                        var name = 'UNKNOWN';
                        try {
                            for (var k in TcHmi.Errors) {
                                if (Object.prototype.hasOwnProperty.call(TcHmi.Errors, k) && TcHmi.Errors[k] === code) {
                                    name = k; break;
                                }
                            }
                        } catch (e) { }
                        reject({ code: code, name: name, message: 'Erro TcHmi', details: data });
                    }
                });
            } catch (e) {
                reject({ code: -14, message: 'Exceção durante readEx2.', details: e && (e.message || String(e)) });
            }
        });
    };

    // Função GLOBAL registrada para Actions & Conditions (retorno via ctx.success)
    if (TcHmi.Functions && typeof TcHmi.Functions.registerFunctionEx === 'function') {
        /**
         * Nome global: TcHmi.Functions.HMI_Dark.getValueFromSymbolExpression
         * Uso no Editor (JavaScript Return Value ou JavaScript):
         *   TcHmi.Functions.HMI_Dark.getValueFromSymbolExpression(symbolObj)
         *   → marque "Yes, pass symbol reference" no parâmetro symbolObj.
         * @param {object} ctx Contexto do TwinCAT HMI.
         * @param {object} symbolObj Objeto de símbolo recebido do Editor.
         */
        TcHmi.Functions.registerFunctionEx(
            'getValueFromSymbolExpression',
            'TcHmi.Functions.HMI_Dark',
            function (ctx, symbolObj) {
                NS.getValueFromSymbolExpressionPromise(symbolObj)
                    .then(function (value) {
                        if (ctx && typeof ctx.success === 'function') ctx.success(value);
                    })
                    .catch(function (err) {
                        try { console.log('[HMI_Dark.getValueFromSymbolExpression] ERRO:', err); } catch (e) { }
                        if (ctx && typeof ctx.error === 'function') ctx.error(err && (err.message || String(err)));
                    });
            }
        );
    }

    // Exemplo (console) — opcional:
    // NS.getValueFromSymbolExpressionPromise(symbolOj).then(v => console.log('Valor:', v)).catch(e => console.log('Erro:', e));

})(TcHmi);
