// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />

/*
 * WriteValueByIndexWithMode
 * ==========================
 * Função genérica para escrever um valor em um símbolo PLC selecionado por índice
 * com suporte ao enum eStateBind (STATIC_MODE=3, DYNAMIC_MODE=4).
 *
 * OBJETIVO:
 * Versão estendida de WriteValueByIndex que permite selecionar entre dois conjuntos
 * de símbolos (STATIC e DYNAMIC) baseado no enum eStateBind.
 *
 * PARÂMETROS:
 * - eStateBind: modo de operação (3 = STATIC_MODE, 4 = DYNAMIC_MODE)
 * - indexSource: origem do índice (pode ser symbol object, controle ou número literal)
 * - value: valor a escrever (pode vir de controle, symbol ou número literal)
 * - symbol0Static, symbol1Static, symbol2Static, symbol3Static: símbolos STATIC (índices 0-3)
 * - symbol0Dyn, symbol1Dyn, symbol2Dyn, symbol3Dyn: símbolos DYNAMIC (índices 0-3)
 *
 * ENUM eStateBind:
 * - 3 (STATIC_MODE): Usa símbolos Static
 * - 4 (DYNAMIC_MODE): Usa símbolos Dyn
 *
 * RETORNO:
 * true se escreveu com sucesso, false em caso de erro.
 *
 * USO NO EDITOR (JavaScript):
 * TcHmi.Functions.HMI_Dark.WriteValueByIndexWithMode(
 *     3,                                                        // eStateBind (STATIC_MODE)
 *     %pp%iSenseLimit%/pp%,                                     // indexSource (Yes, pass symbol reference)
 *     %ctrl%InputBox_Limit_Max::Value%/ctrl%,                   // value
 *     %pp%stControle[0]::stSafeGuardSensor::fStaticMax%/pp%,   // symbol0Static
 *     %pp%stControle[1]::stSafeGuardSensor::fStaticMax%/pp%,   // symbol1Static
 *     null,                                                     // symbol2Static (opcional)
 *     null,                                                     // symbol3Static (opcional)
 *     %pp%stControle[0]::stSafeGuardSensor::fDynMax%/pp%,      // symbol0Dyn
 *     %pp%stControle[1]::stSafeGuardSensor::fDynMax%/pp%,      // symbol1Dyn
 *     null,                                                     // symbol2Dyn (opcional)
 *     null,                                                     // symbol3Dyn (opcional)
 * )
 */

(function (TcHmi) {
    'use strict';

    // Namespace do projeto
    TcHmi = TcHmi || {};
    TcHmi.Functions = TcHmi.Functions || {};
    TcHmi.Functions.HMI_Dark = TcHmi.Functions.HMI_Dark || {};
    var NS = TcHmi.Functions.HMI_Dark;

    /**
     * WriteValueByIndexWithMode
     * Escreve um valor em um símbolo PLC selecionado por índice com suporte a enum eStateBind.
     *
     * @param {object} ctx - Contexto do TwinCAT HMI (obrigatório para funções registradas)
     * @param {number} eStateBind - Modo de operação (3=STATIC_MODE, 4=DYNAMIC_MODE)
     * @param {any} indexSource - Origem do índice (symbol object, controle ou número)
     * @param {any} value - Valor a escrever (pode vir de controle, symbol ou número)
     * @param {object} symbol0Static - Symbol object STATIC para índice 0
     * @param {object} symbol1Static - Symbol object STATIC para índice 1
     * @param {object} symbol2Static - Symbol object STATIC para índice 2 (opcional)
     * @param {object} symbol3Static - Symbol object STATIC para índice 3 (opcional)
     * @param {object} symbol0Dyn - Symbol object DYNAMIC para índice 0
     * @param {object} symbol1Dyn - Symbol object DYNAMIC para índice 1
     * @param {object} symbol2Dyn - Symbol object DYNAMIC para índice 2 (opcional)
     * @param {object} symbol3Dyn - Symbol object DYNAMIC para índice 3 (opcional)
     */
    function WriteValueByIndexWithMode(ctx, eStateBind, indexSource, value,
                                        symbol0Static, symbol1Static, symbol2Static, symbol3Static,
                                        symbol0Dyn, symbol1Dyn, symbol2Dyn, symbol3Dyn) {

        // Validação do contexto
        if (!ctx || typeof ctx.success !== 'function' || typeof ctx.error !== 'function') {
            console.error('[WriteValueByIndexWithMode] Contexto inválido (ctx.success/ctx.error ausentes).');
            return;
        }

        try {
            // ========================================
            // ETAPA 0: VALIDAR E SELECIONAR MODO
            // ========================================
            var stateMode = parseInt(eStateBind, 10);

            if (isNaN(stateMode) || (stateMode !== 3 && stateMode !== 4)) {
                console.error('[WriteValueByIndexWithMode] eStateBind inválido. Deve ser 3 (STATIC_MODE) ou 4 (DYNAMIC_MODE). Recebido:', eStateBind);
                ctx.error('eStateBind inválido: ' + eStateBind);
                return;
            }

            var modeLabel = (stateMode === 3) ? 'STATIC_MODE' : 'DYNAMIC_MODE';
            console.log('[WriteValueByIndexWithMode] Modo selecionado:', modeLabel, '(' + stateMode + ')');

            // Selecionar conjunto de símbolos baseado no modo
            var selectedSymbols = {
                symbol0: (stateMode === 3) ? symbol0Static : symbol0Dyn,
                symbol1: (stateMode === 3) ? symbol1Static : symbol1Dyn,
                symbol2: (stateMode === 3) ? symbol2Static : symbol2Dyn,
                symbol3: (stateMode === 3) ? symbol3Static : symbol3Dyn
            };

            console.log('[WriteValueByIndexWithMode] Símbolos selecionados para modo', modeLabel);

            // ========================================
            // ETAPA 1: NORMALIZAR O ÍNDICE
            // ========================================
            normalizeIndex(indexSource)
                .then(function (index) {
                    console.log('[WriteValueByIndexWithMode] Índice normalizado:', index);

                    // ========================================
                    // ETAPA 2: NORMALIZAR O VALOR
                    // ========================================
                    return normalizeValue(value)
                        .then(function (valueToWrite) {
                            console.log('[WriteValueByIndexWithMode] Valor normalizado:', valueToWrite);
                            return { index: index, valueToWrite: valueToWrite };
                        });
                })
                .then(function (result) {
                    var index = result.index;
                    var valueToWrite = result.valueToWrite;

                    // ========================================
                    // ETAPA 3: SELECIONAR SÍMBOLO BASEADO NO ÍNDICE
                    // ========================================
                    var selectedSymbol = null;

                    switch (index) {
                        case 0:
                            if (selectedSymbols.symbol0 && isSymbolObject(selectedSymbols.symbol0)) {
                                selectedSymbol = selectedSymbols.symbol0;
                                console.log('[WriteValueByIndexWithMode] Selecionado symbol0 (' + modeLabel + ') para índice', index);
                            }
                            break;
                        case 1:
                            if (selectedSymbols.symbol1 && isSymbolObject(selectedSymbols.symbol1)) {
                                selectedSymbol = selectedSymbols.symbol1;
                                console.log('[WriteValueByIndexWithMode] Selecionado symbol1 (' + modeLabel + ') para índice', index);
                            }
                            break;
                        case 2:
                            if (selectedSymbols.symbol2 && isSymbolObject(selectedSymbols.symbol2)) {
                                selectedSymbol = selectedSymbols.symbol2;
                                console.log('[WriteValueByIndexWithMode] Selecionado symbol2 (' + modeLabel + ') para índice', index);
                            }
                            break;
                        case 3:
                            if (selectedSymbols.symbol3 && isSymbolObject(selectedSymbols.symbol3)) {
                                selectedSymbol = selectedSymbols.symbol3;
                                console.log('[WriteValueByIndexWithMode] Selecionado symbol3 (' + modeLabel + ') para índice', index);
                            }
                            break;
                        default:
                            console.error('[WriteValueByIndexWithMode] Índice', index, 'fora do intervalo (0-3).');
                            ctx.error('Índice fora do intervalo: ' + index);
                            return;
                    }

                    // Se nenhum símbolo foi configurado para este índice
                    if (!selectedSymbol) {
                        console.error('[WriteValueByIndexWithMode] Nenhum símbolo configurado para índice', index, 'no modo', modeLabel);
                        ctx.error('Nenhum símbolo configurado para índice ' + index + ' no modo ' + modeLabel);
                        return;
                    }

                    // ========================================
                    // ETAPA 4: ESCREVER O VALOR NO SÍMBOLO SELECIONADO
                    // ========================================
                    writeSymbolValue(selectedSymbol, valueToWrite)
                        .then(function () {
                            console.log('[WriteValueByIndexWithMode] Valor', valueToWrite, 'escrito com sucesso no símbolo (índice', index + ', modo', modeLabel + ')');
                            ctx.success(true);
                        })
                        .catch(function (err) {
                            console.error('[WriteValueByIndexWithMode] Erro ao escrever no símbolo:', err);
                            ctx.error('Erro ao escrever no símbolo: ' + (err && (err.message || String(err))));
                        });
                })
                .catch(function (err) {
                    console.error('[WriteValueByIndexWithMode] Erro:', err);
                    ctx.error('Erro em WriteValueByIndexWithMode: ' + (err && (err.message || String(err))));
                });

        } catch (e) {
            console.error('[WriteValueByIndexWithMode] Exceção não tratada:', e);
            ctx.error('Exceção em WriteValueByIndexWithMode: ' + (e && (e.message || String(e))));
        }
    }

    // ========================================
    // FUNÇÕES UTILITÁRIAS
    // ========================================

    /**
     * Normaliza o indexSource para um número inteiro.
     * Suporta: symbol object, controle (TcHmiControl), número literal.
     *
     * @param {any} indexSource - Origem do índice
     * @returns {Promise<number>} - Promise resolvida com o índice como número inteiro
     */
    function normalizeIndex(indexSource) {
        return new Promise(function (resolve, reject) {
            try {
                // CASO 1: Symbol object (tem __symbol)
                if (isSymbolObject(indexSource)) {
                    console.log('[WriteValueByIndexWithMode.normalizeIndex] indexSource é um symbol object. Lendo valor...');

                    // Usar função utilitária existente se disponível
                    if (NS.getValueFromSymbolExpressionPromise) {
                        NS.getValueFromSymbolExpressionPromise(indexSource)
                            .then(function (value) {
                                var index = parseInt(value, 10);
                                if (isNaN(index)) {
                                    reject(new Error('Valor do símbolo não pode ser convertido para número: ' + value));
                                } else {
                                    resolve(index);
                                }
                            })
                            .catch(reject);
                    } else {
                        // Fallback: ler diretamente usando readEx2
                        var expr = indexSource.__symbol.__expression.__expression;
                        if (typeof expr !== 'string' || !expr) {
                            reject(new Error('Expressão de símbolo inválida.'));
                            return;
                        }

                        TcHmi.Symbol.readEx2(expr, function (data) {
                            if (!data || data.error !== TcHmi.Errors.NONE) {
                                reject(new Error('Erro ao ler símbolo: ' + (data && data.error)));
                                return;
                            }
                            var index = parseInt(data.value, 10);
                            if (isNaN(index)) {
                                reject(new Error('Valor do símbolo não pode ser convertido para número: ' + data.value));
                            } else {
                                resolve(index);
                            }
                        });
                    }
                    return;
                }

                // CASO 2: Controle TcHmi (tem método getValue)
                if (indexSource && typeof indexSource.getValue === 'function') {
                    console.log('[WriteValueByIndexWithMode.normalizeIndex] indexSource é um controle TcHmi. Usando getValue()...');
                    var controlValue = indexSource.getValue();
                    var index = parseInt(controlValue, 10);
                    if (isNaN(index)) {
                        reject(new Error('Valor do controle não pode ser convertido para número: ' + controlValue));
                    } else {
                        resolve(index);
                    }
                    return;
                }

                // CASO 3: Número literal
                if (typeof indexSource === 'number') {
                    console.log('[WriteValueByIndexWithMode.normalizeIndex] indexSource é um número literal:', indexSource);
                    var index = parseInt(indexSource, 10);
                    if (isNaN(index)) {
                        reject(new Error('Número não pode ser convertido para inteiro: ' + indexSource));
                    } else {
                        resolve(index);
                    }
                    return;
                }

                // CASO 4: String que pode ser convertida para número
                if (typeof indexSource === 'string') {
                    console.log('[WriteValueByIndexWithMode.normalizeIndex] indexSource é uma string. Tentando conversão...');
                    var index = parseInt(indexSource, 10);
                    if (isNaN(index)) {
                        reject(new Error('String não pode ser convertida para número: ' + indexSource));
                    } else {
                        resolve(index);
                    }
                    return;
                }

                // CASO 5: Tipo não suportado
                reject(new Error('Tipo de indexSource não suportado: ' + typeof indexSource));

            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Normaliza o value para um número.
     * Suporta: symbol object, controle (TcHmiControl), número literal.
     *
     * @param {any} value - Valor a normalizar
     * @returns {Promise<number>} - Promise resolvida com o valor como número
     */
    function normalizeValue(value) {
        return new Promise(function (resolve, reject) {
            try {
                // CASO 1: Symbol object (tem __symbol)
                if (isSymbolObject(value)) {
                    console.log('[WriteValueByIndexWithMode.normalizeValue] value é um symbol object. Lendo valor...');

                    // Usar função utilitária existente se disponível
                    if (NS.getValueFromSymbolExpressionPromise) {
                        NS.getValueFromSymbolExpressionPromise(value)
                            .then(function (val) {
                                var numValue = parseFloat(val);
                                if (isNaN(numValue)) {
                                    reject(new Error('Valor do símbolo não pode ser convertido para número: ' + val));
                                } else {
                                    resolve(numValue);
                                }
                            })
                            .catch(reject);
                    } else {
                        // Fallback: ler diretamente usando readEx2
                        var expr = value.__symbol.__expression.__expression;
                        if (typeof expr !== 'string' || !expr) {
                            reject(new Error('Expressão de símbolo inválida.'));
                            return;
                        }

                        TcHmi.Symbol.readEx2(expr, function (data) {
                            if (!data || data.error !== TcHmi.Errors.NONE) {
                                reject(new Error('Erro ao ler símbolo: ' + (data && data.error)));
                                return;
                            }
                            var numValue = parseFloat(data.value);
                            if (isNaN(numValue)) {
                                reject(new Error('Valor do símbolo não pode ser convertido para número: ' + data.value));
                            } else {
                                resolve(numValue);
                            }
                        });
                    }
                    return;
                }

                // CASO 2: Controle TcHmi (tem método getValue)
                if (value && typeof value.getValue === 'function') {
                    console.log('[WriteValueByIndexWithMode.normalizeValue] value é um controle TcHmi. Usando getValue()...');
                    var controlValue = value.getValue();
                    var numValue = parseFloat(controlValue);
                    if (isNaN(numValue)) {
                        reject(new Error('Valor do controle não pode ser convertido para número: ' + controlValue));
                    } else {
                        resolve(numValue);
                    }
                    return;
                }

                // CASO 3: Número literal
                if (typeof value === 'number') {
                    console.log('[WriteValueByIndexWithMode.normalizeValue] value é um número literal:', value);
                    resolve(value);
                    return;
                }

                // CASO 4: String que pode ser convertida para número
                if (typeof value === 'string') {
                    console.log('[WriteValueByIndexWithMode.normalizeValue] value é uma string. Tentando conversão...');
                    var numValue = parseFloat(value);
                    if (isNaN(numValue)) {
                        reject(new Error('String não pode ser convertida para número: ' + value));
                    } else {
                        resolve(numValue);
                    }
                    return;
                }

                // CASO 5: Tipo não suportado
                reject(new Error('Tipo de value não suportado: ' + typeof value));

            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Verifica se o objeto é um symbol object válido.
     *
     * @param {any} obj - Objeto a verificar
     * @returns {boolean} - true se for symbol object
     */
    function isSymbolObject(obj) {
        return obj &&
               typeof obj === 'object' &&
               obj.__symbol &&
               obj.__symbol.__expression &&
               typeof obj.__symbol.__expression.__expression === 'string';
    }

    /**
     * Escreve um valor em um symbol object.
     *
     * @param {object} symbolObj - Symbol object de destino
     * @param {number} value - Valor a escrever
     * @returns {Promise<void>} - Promise resolvida quando escrita concluir
     */
    function writeSymbolValue(symbolObj, value) {
        return new Promise(function (resolve, reject) {
            if (!isSymbolObject(symbolObj)) {
                reject(new Error('Symbol object inválido.'));
                return;
            }

            var expr = symbolObj.__symbol.__expression.__expression;

            try {
                TcHmi.Symbol.writeEx2(expr, value, function (data) {
                    if (!data) {
                        reject(new Error('writeEx2 não retornou dados.'));
                        return;
                    }
                    if (data.error === TcHmi.Errors.NONE) {
                        resolve();
                    } else {
                        var errorName = 'UNKNOWN';
                        try {
                            for (var k in TcHmi.Errors) {
                                if (Object.prototype.hasOwnProperty.call(TcHmi.Errors, k) && TcHmi.Errors[k] === data.error) {
                                    errorName = k;
                                    break;
                                }
                            }
                        } catch (e) { }
                        reject(new Error('Erro TcHmi ao escrever símbolo. Código: ' + data.error + ' (' + errorName + ')'));
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    // ========================================
    // REGISTRO DA FUNÇÃO NO FRAMEWORK
    // ========================================
    if (TcHmi.Functions && typeof TcHmi.Functions.registerFunctionEx === 'function') {
        TcHmi.Functions.registerFunctionEx(
            'WriteValueByIndexWithMode',
            'TcHmi.Functions.HMI_Dark',
            WriteValueByIndexWithMode
        );
        console.log('[WriteValueByIndexWithMode] Função registrada com sucesso no namespace TcHmi.Functions.HMI_Dark');
    } else {
        console.error('[WriteValueByIndexWithMode] ERRO: TcHmi.Functions.registerFunctionEx não está disponível!');
    }

})(TcHmi);
