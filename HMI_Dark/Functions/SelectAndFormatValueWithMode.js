// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />

/*
 * SelectAndFormatValueWithMode
 * ==============================
 * Função genérica abstrata para selecionar e formatar valores concatenados baseados em MODO e ÍNDICE.
 * Adiciona suporte a enum eStateBind para seleção entre STATIC_MODE e DYNAMIC_MODE.
 *
 * OBJETIVO:
 * Substitui expressões IIFE complexas que usam switch-case para selecionar e concatenar valores
 * de múltiplos símbolos (valor numérico + prefixo + unidade + sufixo) com suporte a diferentes modos.
 *
 * ENUM eStateBind:
 * - 3 = STATIC_MODE
 * - 4 = DYNAMIC_MODE
 *
 * PARÂMETROS (28 total):
 * ======================
 * CONTROLE:
 * - ctx: contexto TwinCAT HMI (obrigatório)
 * - eStateBind: modo (3 = STATIC, 4 = DYNAMIC)
 * - indexSource: índice (0-3)
 *
 * STATIC_MODE (índices 0 e 1 obrigatórios):
 * - valueSymbolStatic0, valueSymbolStatic1: símbolos de valores (REAL)
 * - prefixSymbolStatic0, prefixSymbolStatic1: símbolos de prefixos (STRING)
 * - unitSymbolStatic0, unitSymbolStatic1: símbolos de unidades (STRING)
 *
 * DYNAMIC_MODE (índices 0 e 1 obrigatórios):
 * - valueSymbolDyn0, valueSymbolDyn1: símbolos de valores (REAL)
 * - prefixSymbolDyn0, prefixSymbolDyn1: símbolos de prefixos (STRING)
 * - unitSymbolDyn0, unitSymbolDyn1: símbolos de unidades (STRING)
 *
 * CONFIGURAÇÃO (opcionais):
 * - decimalPlaces: número de casas decimais (padrão: 3)
 * - suffix: sufixo adicional (padrão: '')
 * - defaultValue: valor de fallback (padrão: 'Erro')
 *
 * EXPANSÃO para índices 2 e 3 (opcionais):
 * - valueSymbolStatic2, valueSymbolStatic3 + prefix + unit
 * - valueSymbolDyn2, valueSymbolDyn3 + prefix + unit
 *
 * RETORNO:
 * String formatada: "valor.toFixed(decimals) prefixo unidade sufixo"
 * Exemplo: "123.456 m³/s" ou "0.125 μg"
 */

(function (TcHmi) {
    'use strict';

    // Namespace do projeto
    TcHmi = TcHmi || {};
    TcHmi.Functions = TcHmi.Functions || {};
    TcHmi.Functions.HMI_Dark = TcHmi.Functions.HMI_Dark || {};
    var NS = TcHmi.Functions.HMI_Dark;

    /**
     * SelectAndFormatValueWithMode
     * Seleciona e formata valores baseado em modo (STATIC/DYNAMIC) e índice (0-3).
     */
    function SelectAndFormatValueWithMode(
        ctx, eStateBind, indexSource,
        // STATIC Mode - Index 0 & 1 (required)
        valueSymbolStatic0, valueSymbolStatic1,
        prefixSymbolStatic0, prefixSymbolStatic1,
        unitSymbolStatic0, unitSymbolStatic1,
        // DYNAMIC Mode - Index 0 & 1 (required)
        valueSymbolDyn0, valueSymbolDyn1,
        prefixSymbolDyn0, prefixSymbolDyn1,
        unitSymbolDyn0, unitSymbolDyn1,
        // Configuration (optional)
        decimalPlaces, suffix, defaultValue,
        // STATIC Mode - Index 2 & 3 (optional)
        valueSymbolStatic2, valueSymbolStatic3,
        prefixSymbolStatic2, prefixSymbolStatic3,
        unitSymbolStatic2, unitSymbolStatic3,
        // DYNAMIC Mode - Index 2 & 3 (optional)
        valueSymbolDyn2, valueSymbolDyn3,
        prefixSymbolDyn2, prefixSymbolDyn3,
        unitSymbolDyn2, unitSymbolDyn3
    ) {
        // ========================================
        // VALIDAÇÃO DO CONTEXTO
        // ========================================
        if (!ctx || typeof ctx.success !== 'function' || typeof ctx.error !== 'function') {
            console.error('[SelectAndFormatValueWithMode] Contexto inválido.');
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
            // ETAPA 1: VALIDAR E NORMALIZAR O MODO
            // ========================================
            var stateMode = parseInt(eStateBind, 10);

            if (isNaN(stateMode)) {
                console.warn('[SelectAndFormatValueWithMode] eStateBind inválido. Usando STATIC_MODE (3).');
                stateMode = 3;
            }

            if (stateMode !== 3 && stateMode !== 4) {
                console.error('[SelectAndFormatValueWithMode] eStateBind inválido:', stateMode, '. Use 3 (STATIC_MODE) ou 4 (DYNAMIC_MODE).');
                ctx.success(defaultValue);
                return;
            }

            var modeName = (stateMode === 3) ? 'STATIC_MODE' : 'DYNAMIC_MODE';
            console.log('[SelectAndFormatValueWithMode] Modo selecionado:', modeName, '(' + stateMode + ')');

            // ========================================
            // ETAPA 2: NORMALIZAR O ÍNDICE
            // ========================================
            normalizeIndex(indexSource)
                .then(function (index) {
                    console.log('[SelectAndFormatValueWithMode] Índice normalizado:', index);

                    // ========================================
                    // ETAPA 3: SELECIONAR SÍMBOLOS BASEADO NO MODO E ÍNDICE
                    // ========================================
                    var selectedValueSymbol = null;
                    var selectedPrefixSymbol = null;
                    var selectedUnitSymbol = null;

                    // Arrays de símbolos por modo
                    var valueSymbols, prefixSymbols, unitSymbols;

                    if (stateMode === 3) {
                        // STATIC_MODE
                        valueSymbols = [valueSymbolStatic0, valueSymbolStatic1, valueSymbolStatic2, valueSymbolStatic3];
                        prefixSymbols = [prefixSymbolStatic0, prefixSymbolStatic1, prefixSymbolStatic2, prefixSymbolStatic3];
                        unitSymbols = [unitSymbolStatic0, unitSymbolStatic1, unitSymbolStatic2, unitSymbolStatic3];
                    } else {
                        // DYNAMIC_MODE
                        valueSymbols = [valueSymbolDyn0, valueSymbolDyn1, valueSymbolDyn2, valueSymbolDyn3];
                        prefixSymbols = [prefixSymbolDyn0, prefixSymbolDyn1, prefixSymbolDyn2, prefixSymbolDyn3];
                        unitSymbols = [unitSymbolDyn0, unitSymbolDyn1, unitSymbolDyn2, unitSymbolDyn3];
                    }

                    // Valida índice
                    if (index < 0 || index > 3) {
                        console.warn('[SelectAndFormatValueWithMode]', modeName, ': Índice', index, 'fora do intervalo (0-3). Usando defaultValue:', defaultValue);
                        ctx.success(defaultValue);
                        return;
                    }

                    // Seleciona símbolos do array
                    selectedValueSymbol = valueSymbols[index];
                    selectedPrefixSymbol = prefixSymbols[index];
                    selectedUnitSymbol = unitSymbols[index];

                    console.log('[SelectAndFormatValueWithMode]', modeName, ': Símbolos selecionados para índice', index);

                    // Validar símbolos
                    if (!isSymbolObject(selectedValueSymbol)) {
                        console.warn('[SelectAndFormatValueWithMode]', modeName, ': Symbol de valor não configurado para índice', index, '. Usando defaultValue:', defaultValue);
                        ctx.success(defaultValue);
                        return;
                    }
                    if (!isSymbolObject(selectedPrefixSymbol)) {
                        console.warn('[SelectAndFormatValueWithMode]', modeName, ': Symbol de prefixo não configurado para índice', index, '. Usando defaultValue:', defaultValue);
                        ctx.success(defaultValue);
                        return;
                    }
                    if (!isSymbolObject(selectedUnitSymbol)) {
                        console.warn('[SelectAndFormatValueWithMode]', modeName, ': Symbol de unidade não configurado para índice', index, '. Usando defaultValue:', defaultValue);
                        ctx.success(defaultValue);
                        return;
                    }

                    // ========================================
                    // ETAPA 4: LER VALORES EM PARALELO
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

                            console.log('[SelectAndFormatValueWithMode]', modeName, ': Valores lidos - Real:', valueReal, ', Prefix:', prefix, ', Unit:', unit);

                            // ========================================
                            // ETAPA 5: VALIDAR E FORMATAR
                            // ========================================
                            var numericValue = parseFloat(valueReal);
                            if (isNaN(numericValue)) {
                                console.warn('[SelectAndFormatValueWithMode]', modeName, ': Valor numérico inválido:', valueReal, '. Usando defaultValue:', defaultValue);
                                ctx.success(defaultValue);
                                return;
                            }

                            var prefixStr = (prefix !== null && prefix !== undefined) ? String(prefix) : '';
                            var unitStr = (unit !== null && unit !== undefined) ? String(unit) : '';

                            // ========================================
                            // ETAPA 6: CONSTRUIR STRING FORMATADA
                            // ========================================
                            var formattedValue = numericValue.toFixed(decimalPlaces);
                            var result = formattedValue + ' ' + prefixStr + unitStr + suffix;

                            console.log('[SelectAndFormatValueWithMode]', modeName, ': ✓ Resultado formatado:', result);
                            ctx.success(result);
                        })
                        .catch(function (err) {
                            console.error('[SelectAndFormatValueWithMode]', modeName, ': Erro ao ler símbolos:', err);
                            console.log('[SelectAndFormatValueWithMode] Usando defaultValue:', defaultValue);
                            ctx.success(defaultValue);
                        });
                })
                .catch(function (err) {
                    console.error('[SelectAndFormatValueWithMode] Erro ao normalizar índice:', err);
                    console.log('[SelectAndFormatValueWithMode] Usando defaultValue:', defaultValue);
                    ctx.success(defaultValue);
                });

        } catch (e) {
            console.error('[SelectAndFormatValueWithMode] Exceção não tratada:', e);
            console.log('[SelectAndFormatValueWithMode] Usando defaultValue:', defaultValue);
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
            'SelectAndFormatValueWithMode',
            'TcHmi.Functions.HMI_Dark',
            SelectAndFormatValueWithMode
        );
        console.log('[SelectAndFormatValueWithMode] Função registrada com sucesso');
    } else {
        console.error('[SelectAndFormatValueWithMode] ERRO: registerFunctionEx não disponível!');
    }

})(TcHmi);
