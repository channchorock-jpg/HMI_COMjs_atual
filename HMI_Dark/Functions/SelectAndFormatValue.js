// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />

/*
 * SelectAndFormatValue
 * ====================
 * Função genérica abstrata para selecionar e formatar valores concatenados baseados em um índice.
 * VERSÃO REORGANIZADA: Parâmetros opcionais (índices 2 e 3) estão NO FINAL.
 *
 * OBJETIVO:
 * Substitui expressões IIFE complexas que usam switch-case para selecionar e concatenar valores
 * de múltiplos símbolos (valor numérico + prefixo + unidade + sufixo).
 *
 * ORDEM DOS PARÂMETROS (REORGANIZADA):
 * ====================================
 * OBRIGATÓRIOS (para índices 0 e 1):
 * - indexSource: origem do índice (symbol object, controle, número literal)
 * - valueSymbol0, valueSymbol1: símbolos de valores numéricos (REAL) para índice 0 e 1
 * - prefixSymbol0, prefixSymbol1: símbolos de prefixos (STRING) para índice 0 e 1
 * - unitSymbol0, unitSymbol1: símbolos de unidades (STRING) para índice 0 e 1
 *
 * OPCIONAIS (configuração):
 * - decimalPlaces: número de casas decimais (padrão: 3)
 * - suffix: sufixo adicional (padrão: '')
 * - defaultValue: valor de fallback (padrão: 'Erro')
 *
 * OPCIONAIS (expansão para índices 2 e 3):
 * - valueSymbol2, valueSymbol3: símbolos de valores para índice 2 e 3
 * - prefixSymbol2, prefixSymbol3: símbolos de prefixos para índice 2 e 3
 * - unitSymbol2, unitSymbol3: símbolos de unidades para índice 2 e 3
 *
 * RETORNO:
 * String formatada: "valor.toFixed(decimals) prefixo unidade sufixo"
 * Exemplo: "123.456 m³/s" ou "0.125 μg"
 *
 * USO BÁSICO (apenas 2 índices):
 * ===============================
 * TcHmi.Functions.HMI_Dark.SelectAndFormatValue(
 *     %pp%iSenseLimit%/pp%,                      // indexSource
 *     %pp%stControle[0]::fValueMax%/pp%,         // valueSymbol0
 *     %pp%stControle[1]::fValueMax%/pp%,         // valueSymbol1
 *     %pp%stFeedback::sPrefix[0]%/pp%,           // prefixSymbol0
 *     %pp%stFeedback::sPrefix[1]%/pp%,           // prefixSymbol1
 *     %pp%stFeedback::sUnitMeasure[0]%/pp%,      // unitSymbol0
 *     %pp%stFeedback::sUnitMeasure[1]%/pp%       // unitSymbol1
 * )
 * // Os parâmetros opcionais podem ser omitidos!
 *
 * USO AVANÇADO (com configuração):
 * ================================
 * TcHmi.Functions.HMI_Dark.SelectAndFormatValue(
 *     %pp%iSenseLimit%/pp%,
 *     %pp%stControle[0]::fValueMax%/pp%,
 *     %pp%stControle[1]::fValueMax%/pp%,
 *     %pp%stFeedback::sPrefix[0]%/pp%,
 *     %pp%stFeedback::sPrefix[1]%/pp%,
 *     %pp%stFeedback::sUnitMeasure[0]%/pp%,
 *     %pp%stFeedback::sUnitMeasure[1]%/pp%,
 *     1,                                          // decimalPlaces
 *     '/s',                                       // suffix
 *     '0'                                         // defaultValue
 * )
 *
 * USO COMPLETO (4 índices):
 * =========================
 * TcHmi.Functions.HMI_Dark.SelectAndFormatValue(
 *     %pp%iSensor%/pp%,
 *     %pp%stControle[0]::fValue%/pp%, %pp%stControle[1]::fValue%/pp%,
 *     %pp%stPrefix[0]%/pp%, %pp%stPrefix[1]%/pp%,
 *     %pp%stUnit[0]%/pp%, %pp%stUnit[1]%/pp%,
 *     3, '', 'Erro',
 *     %pp%stControle[2]::fValue%/pp%, %pp%stControle[3]::fValue%/pp%,
 *     %pp%stPrefix[2]%/pp%, %pp%stPrefix[3]%/pp%,
 *     %pp%stUnit[2]%/pp%, %pp%stUnit[3]%/pp%
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
     * SelectAndFormatValue
     * Versão reorganizada com parâmetros opcionais no final.
     *
     * @param {object} ctx - Contexto do TwinCAT HMI
     * @param {any} indexSource - Origem do índice (0-3)
     * @param {object} valueSymbol0 - Symbol de valor para índice 0 (obrigatório)
     * @param {object} valueSymbol1 - Symbol de valor para índice 1 (obrigatório)
     * @param {object} prefixSymbol0 - Symbol de prefixo para índice 0 (obrigatório)
     * @param {object} prefixSymbol1 - Symbol de prefixo para índice 1 (obrigatório)
     * @param {object} unitSymbol0 - Symbol de unidade para índice 0 (obrigatório)
     * @param {object} unitSymbol1 - Symbol de unidade para índice 1 (obrigatório)
     * @param {number} decimalPlaces - Casas decimais (opcional, padrão: 3)
     * @param {string} suffix - Sufixo (opcional, padrão: '')
     * @param {string} defaultValue - Valor padrão (opcional, padrão: 'Erro')
     * @param {object} valueSymbol2 - Symbol de valor para índice 2 (opcional)
     * @param {object} valueSymbol3 - Symbol de valor para índice 3 (opcional)
     * @param {object} prefixSymbol2 - Symbol de prefixo para índice 2 (opcional)
     * @param {object} prefixSymbol3 - Symbol de prefixo para índice 3 (opcional)
     * @param {object} unitSymbol2 - Symbol de unidade para índice 2 (opcional)
     * @param {object} unitSymbol3 - Symbol de unidade para índice 3 (opcional)
     */
    function SelectAndFormatValue(ctx, indexSource, valueSymbol0, valueSymbol1, prefixSymbol0, prefixSymbol1, unitSymbol0, unitSymbol1, decimalPlaces, suffix, defaultValue, valueSymbol2, valueSymbol3, prefixSymbol2, prefixSymbol3, unitSymbol2, unitSymbol3) {
        // ========================================
        // VALIDAÇÃO DO CONTEXTO
        // ========================================
        if (!ctx || typeof ctx.success !== 'function' || typeof ctx.error !== 'function') {
            console.error('[SelectAndFormatValue] Contexto inválido.');
            return;
        }

        // ========================================
        // VALORES PADRÃO
        // ========================================
        if (typeof decimalPlaces !== 'number' || decimalPlaces < 0) {
            decimalPlaces = 3;
        }
        if (typeof suffix !== 'string') {
            suffix = '';
        }
        if (typeof defaultValue !== 'string') {
            defaultValue = 'Erro';
        }

        try {
            // ========================================
            // ETAPA 1: NORMALIZAR O ÍNDICE
            // ========================================
            normalizeIndex(indexSource)
                .then(function (index) {
                    console.log('[SelectAndFormatValue] Índice normalizado:', index);

                    // ========================================
                    // ETAPA 2: SELECIONAR SÍMBOLOS BASEADO NO ÍNDICE
                    // ========================================
                    var selectedValueSymbol = null;
                    var selectedPrefixSymbol = null;
                    var selectedUnitSymbol = null;

                    switch (index) {
                        case 0:
                            selectedValueSymbol = valueSymbol0;
                            selectedPrefixSymbol = prefixSymbol0;
                            selectedUnitSymbol = unitSymbol0;
                            console.log('[SelectAndFormatValue] Selecionados símbolos do índice 0');
                            break;
                        case 1:
                            selectedValueSymbol = valueSymbol1;
                            selectedPrefixSymbol = prefixSymbol1;
                            selectedUnitSymbol = unitSymbol1;
                            console.log('[SelectAndFormatValue] Selecionados símbolos do índice 1');
                            break;
                        case 2:
                            selectedValueSymbol = valueSymbol2;
                            selectedPrefixSymbol = prefixSymbol2;
                            selectedUnitSymbol = unitSymbol2;
                            console.log('[SelectAndFormatValue] Selecionados símbolos do índice 2');
                            break;
                        case 3:
                            selectedValueSymbol = valueSymbol3;
                            selectedPrefixSymbol = prefixSymbol3;
                            selectedUnitSymbol = unitSymbol3;
                            console.log('[SelectAndFormatValue] Selecionados símbolos do índice 3');
                            break;
                        default:
                            console.warn('[SelectAndFormatValue] Índice', index, 'fora do intervalo (0-3). Usando defaultValue:', defaultValue);
                            ctx.success(defaultValue);
                            return;
                    }

                    // Validar símbolos
                    if (!isSymbolObject(selectedValueSymbol)) {
                        console.warn('[SelectAndFormatValue] Symbol de valor não configurado para índice', index, '. Usando defaultValue:', defaultValue);
                        ctx.success(defaultValue);
                        return;
                    }
                    if (!isSymbolObject(selectedPrefixSymbol)) {
                        console.warn('[SelectAndFormatValue] Symbol de prefixo não configurado para índice', index, '. Usando defaultValue:', defaultValue);
                        ctx.success(defaultValue);
                        return;
                    }
                    if (!isSymbolObject(selectedUnitSymbol)) {
                        console.warn('[SelectAndFormatValue] Symbol de unidade não configurado para índice', index, '. Usando defaultValue:', defaultValue);
                        ctx.success(defaultValue);
                        return;
                    }

                    // ========================================
                    // ETAPA 3: LER VALORES EM PARALELO
                    // ========================================
                    Promise.all([
                        readSymbolValue(selectedValueSymbol),
                        readSymbolValue(selectedPrefixSymbol),
                        readSymbolValue(selectedUnitSymbol)
                    ])
                        .then(function (results) {
                            var valueReal = results[0];
                            var prefix = results[1];
                            var unit = results[2];

                            console.log('[SelectAndFormatValue] Valores lidos - Real:', valueReal, ', Prefix:', prefix, ', Unit:', unit);

                            // ========================================
                            // ETAPA 4: VALIDAR E FORMATAR
                            // ========================================
                            var numericValue = parseFloat(valueReal);
                            if (isNaN(numericValue)) {
                                console.warn('[SelectAndFormatValue] Valor numérico inválido:', valueReal, '. Usando defaultValue:', defaultValue);
                                ctx.success(defaultValue);
                                return;
                            }

                            var prefixStr = (prefix !== null && prefix !== undefined) ? String(prefix) : '';
                            var unitStr = (unit !== null && unit !== undefined) ? String(unit) : '';

                            // ========================================
                            // ETAPA 5: CONSTRUIR STRING FORMATADA
                            // ========================================
                            var formattedValue = numericValue.toFixed(decimalPlaces);
                            var result = formattedValue + ' ' + prefixStr + unitStr + suffix;

                            console.log('[SelectAndFormatValue] Resultado formatado:', result);
                            ctx.success(result);
                        })
                        .catch(function (err) {
                            console.error('[SelectAndFormatValue] Erro ao ler símbolos:', err);
                            console.log('[SelectAndFormatValue] Usando defaultValue:', defaultValue);
                            ctx.success(defaultValue);
                        });
                })
                .catch(function (err) {
                    console.error('[SelectAndFormatValue] Erro ao normalizar índice:', err);
                    console.log('[SelectAndFormatValue] Usando defaultValue:', defaultValue);
                    ctx.success(defaultValue);
                });

        } catch (e) {
            console.error('[SelectAndFormatValue] Exceção não tratada:', e);
            console.log('[SelectAndFormatValue] Usando defaultValue:', defaultValue);
            ctx.success(defaultValue);
        }
    }

    // ========================================
    // FUNÇÕES UTILITÁRIAS
    // ========================================

    function normalizeIndex(indexSource) {
        return new Promise(function (resolve, reject) {
            try {
                // CASO 1: Symbol object
                if (isSymbolObject(indexSource)) {
                    console.log('[normalizeIndex] Symbol object detectado');
                    if (NS.getValueFromSymbolExpressionPromise) {
                        NS.getValueFromSymbolExpressionPromise(indexSource)
                            .then(function (value) {
                                var index = parseInt(value, 10);
                                if (isNaN(index)) {
                                    reject(new Error('Valor não pode ser convertido para número: ' + value));
                                } else {
                                    resolve(index);
                                }
                            })
                            .catch(reject);
                    } else {
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
                                reject(new Error('Valor não pode ser convertido para número: ' + data.value));
                            } else {
                                resolve(index);
                            }
                        });
                    }
                    return;
                }

                // CASO 2: Controle TcHmi
                if (indexSource && typeof indexSource.getValue === 'function') {
                    console.log('[normalizeIndex] Controle TcHmi detectado');
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
                    console.log('[normalizeIndex] Número literal:', indexSource);
                    var index = parseInt(indexSource, 10);
                    if (isNaN(index)) {
                        reject(new Error('Número não pode ser convertido para inteiro: ' + indexSource));
                    } else {
                        resolve(index);
                    }
                    return;
                }

                // CASO 4: String numérica
                if (typeof indexSource === 'string') {
                    console.log('[normalizeIndex] String detectada');
                    var index = parseInt(indexSource, 10);
                    if (isNaN(index)) {
                        reject(new Error('String não pode ser convertida para número: ' + indexSource));
                    } else {
                        resolve(index);
                    }
                    return;
                }

                reject(new Error('Tipo de indexSource não suportado: ' + typeof indexSource));

            } catch (e) {
                reject(e);
            }
        });
    }

    function isSymbolObject(obj) {
        return obj &&
               typeof obj === 'object' &&
               obj.__symbol &&
               obj.__symbol.__expression &&
               typeof obj.__symbol.__expression.__expression === 'string';
    }

    function readSymbolValue(symbolObj) {
        if (NS.getValueFromSymbolExpressionPromise) {
            return NS.getValueFromSymbolExpressionPromise(symbolObj);
        }

        return new Promise(function (resolve, reject) {
            if (!isSymbolObject(symbolObj)) {
                reject(new Error('Symbol object inválido.'));
                return;
            }

            var expr = symbolObj.__symbol.__expression.__expression;

            try {
                TcHmi.Symbol.readEx2(expr, function (data) {
                    if (!data) {
                        reject(new Error('readEx2 não retornou dados.'));
                        return;
                    }
                    if (data.error === TcHmi.Errors.NONE) {
                        resolve(data.value);
                    } else {
                        reject(new Error('Erro TcHmi ao ler símbolo. Código: ' + data.error));
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    // ========================================
    // REGISTRO DA FUNÇÃO
    // ========================================
    if (TcHmi.Functions && typeof TcHmi.Functions.registerFunctionEx === 'function') {
        TcHmi.Functions.registerFunctionEx(
            'SelectAndFormatValue',
            'TcHmi.Functions.HMI_Dark',
            SelectAndFormatValue
        );
        console.log('[SelectAndFormatValue] Função registrada com sucesso (versão reorganizada)');
    } else {
        console.error('[SelectAndFormatValue] ERRO: registerFunctionEx não disponível!');
    }

})(TcHmi);