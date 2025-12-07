// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />

/*
 * SelectValueByIndexWithMode
 * ===========================
 * Função genérica para selecionar e retornar o valor de um símbolo PLC baseado em um índice numérico
 * com seleção de modo STATIC ou DYNAMIC via enum eStateBind.
 *
 * OBJETIVO:
 * Substitui expressões IIFE que usam switch-case para selecionar valores de diferentes símbolos,
 * com suporte adicional para modos STATIC e DYNAMIC.
 *
 * PARÂMETROS:
 * - eStateBind: modo de operação (3 = STATIC_MODE, 4 = DYNAMIC_MODE)
 * - indexSource: origem do índice (pode ser symbol object, controle ou número literal)
 * - symbolStatic0, symbolStatic1, symbolStatic2, symbolStatic3: símbolos PLC para cada índice em STATIC_MODE
 * - symbolDyn0, symbolDyn1, symbolDyn2, symbolDyn3: símbolos PLC para cada índice em DYNAMIC_MODE
 * - defaultValue: valor de fallback (padrão: 0)
 *
 * RETORNO:
 * Valor numérico lido do símbolo correspondente ao modo e índice, ou defaultValue se inválido.
 *
 * USO NO EDITOR (JavaScript Return Value):
 * TcHmi.Functions.HMI_Dark.SelectValueByIndexWithMode(
 *     3,                                                        // eStateBind (STATIC_MODE)
 *     %pp%iSenseLimit%/pp%,                                    // indexSource (Yes, pass symbol reference)
 *     %pp%stControle[0]::stStaticSensor::fValueMax%/pp%,       // symbolStatic0
 *     %pp%stControle[1]::stStaticSensor::fValueMax%/pp%,       // symbolStatic1
 *     null,                                                    // symbolStatic2 (opcional)
 *     null,                                                    // symbolStatic3 (opcional)
 *     %pp%stControle[0]::stDynamicSensor::fValueMax%/pp%,      // symbolDyn0
 *     %pp%stControle[1]::stDynamicSensor::fValueMax%/pp%,      // symbolDyn1
 *     null,                                                    // symbolDyn2 (opcional)
 *     null,                                                    // symbolDyn3 (opcional)
 *     0                                                        // defaultValue
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
     * SelectValueByIndexWithMode
     * Seleciona e retorna o valor de um símbolo baseado em modo e índice numérico.
     *
     * @param {object} ctx - Contexto do TwinCAT HMI (obrigatório para funções registradas)
     * @param {number} eStateBind - Modo de operação (3 = STATIC_MODE, 4 = DYNAMIC_MODE)
     * @param {any} indexSource - Origem do índice (symbol object, controle ou número)
     * @param {object} symbolStatic0 - Symbol object STATIC para índice 0
     * @param {object} symbolStatic1 - Symbol object STATIC para índice 1
     * @param {object} symbolStatic2 - Symbol object STATIC para índice 2 (opcional)
     * @param {object} symbolStatic3 - Symbol object STATIC para índice 3 (opcional)
     * @param {object} symbolDyn0 - Symbol object DYNAMIC para índice 0
     * @param {object} symbolDyn1 - Symbol object DYNAMIC para índice 1
     * @param {object} symbolDyn2 - Symbol object DYNAMIC para índice 2 (opcional)
     * @param {object} symbolDyn3 - Symbol object DYNAMIC para índice 3 (opcional)
     * @param {number} defaultValue - Valor padrão se índice inválido ou leitura falhar
     */
    function SelectValueByIndexWithMode(ctx, eStateBind, indexSource,
                                         symbolStatic0, symbolStatic1, symbolStatic2, symbolStatic3,
                                         symbolDyn0, symbolDyn1, symbolDyn2, symbolDyn3,
                                         defaultValue) {
        // Validação do contexto
        if (!ctx || typeof ctx.success !== 'function' || typeof ctx.error !== 'function') {
            console.error('[SelectValueByIndexWithMode] Contexto inválido (ctx.success/ctx.error ausentes).');
            return;
        }

        // Valor padrão se não fornecido
        if (typeof defaultValue !== 'number') {
            defaultValue = 0;
        }

        try {
            // ========================================
            // ETAPA 1: VALIDAR E NORMALIZAR O MODO
            // ========================================
            var stateMode = parseInt(eStateBind, 10);

            if (isNaN(stateMode)) {
                console.warn('[SelectValueByIndexWithMode] eStateBind inválido. Usando STATIC_MODE (3).');
                stateMode = 3;
            }

            if (stateMode !== 3 && stateMode !== 4) {
                console.error('[SelectValueByIndexWithMode] eStateBind inválido:', stateMode, '. Use 3 (STATIC_MODE) ou 4 (DYNAMIC_MODE).');
                ctx.error('eStateBind inválido. Use 3 (STATIC_MODE) ou 4 (DYNAMIC_MODE).');
                return;
            }

            var modeName = (stateMode === 3) ? 'STATIC_MODE' : 'DYNAMIC_MODE';
            console.log('[SelectValueByIndexWithMode] Modo selecionado:', modeName, '(' + stateMode + ')');

            // ========================================
            // ETAPA 2: NORMALIZAR O ÍNDICE
            // ========================================
            normalizeIndex(indexSource)
                .then(function (index) {
                    console.log('[SelectValueByIndexWithMode] Índice normalizado:', index);

                    // ========================================
                    // ETAPA 3: SELECIONAR SÍMBOLO BASEADO NO MODO E ÍNDICE
                    // ========================================
                    var selectedSymbol = null;
                    var symbolArray = null;

                    // Seleciona o array de símbolos baseado no modo
                    if (stateMode === 3) {
                        // STATIC_MODE
                        symbolArray = [symbolStatic0, symbolStatic1, symbolStatic2, symbolStatic3];
                    } else {
                        // DYNAMIC_MODE
                        symbolArray = [symbolDyn0, symbolDyn1, symbolDyn2, symbolDyn3];
                    }

                    // Valida índice
                    if (index < 0 || index > 3) {
                        console.log('[SelectValueByIndexWithMode]', modeName, ': Índice', index, 'fora do intervalo (0-3). Usando defaultValue:', defaultValue);
                        ctx.success(defaultValue);
                        return;
                    }

                    // Seleciona símbolo do array
                    selectedSymbol = symbolArray[index];

                    if (!selectedSymbol || !isSymbolObject(selectedSymbol)) {
                        console.log('[SelectValueByIndexWithMode]', modeName, ': Nenhum símbolo configurado para índice', index, '. Usando defaultValue:', defaultValue);
                        ctx.success(defaultValue);
                        return;
                    }

                    console.log('[SelectValueByIndexWithMode]', modeName, ': Símbolo selecionado para índice', index);

                    // ========================================
                    // ETAPA 4: LER O VALOR DO SÍMBOLO SELECIONADO
                    // ========================================
                    readSymbolValue(selectedSymbol)
                        .then(function (value) {
                            console.log('[SelectValueByIndexWithMode]', modeName, ': Valor lido do símbolo:', value);

                            // Garantir retorno numérico
                            var numericValue = parseFloat(value);
                            if (isNaN(numericValue)) {
                                console.warn('[SelectValueByIndexWithMode]', modeName, ': Valor lido não é numérico:', value, '. Usando defaultValue:', defaultValue);
                                ctx.success(defaultValue);
                            } else {
                                console.log('[SelectValueByIndexWithMode] ✓ Retornando valor:', numericValue);
                                ctx.success(numericValue);
                            }
                        })
                        .catch(function (err) {
                            console.error('[SelectValueByIndexWithMode]', modeName, ': Erro ao ler símbolo:', err);
                            console.log('[SelectValueByIndexWithMode] Usando defaultValue:', defaultValue);
                            ctx.success(defaultValue);
                        });
                })
                .catch(function (err) {
                    console.error('[SelectValueByIndexWithMode] Erro ao normalizar índice:', err);
                    ctx.error('Erro ao normalizar índice: ' + (err && (err.message || String(err))));
                });

        } catch (e) {
            console.error('[SelectValueByIndexWithMode] Exceção não tratada:', e);
            ctx.error('Exceção em SelectValueByIndexWithMode: ' + (e && (e.message || String(e))));
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
                    console.log('[normalizeIndex] indexSource é um symbol object. Lendo valor...');

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
                    console.log('[normalizeIndex] indexSource é um controle TcHmi. Usando getValue()...');
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
                    console.log('[normalizeIndex] indexSource é um número literal:', indexSource);
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
                    console.log('[normalizeIndex] indexSource é uma string. Tentando conversão...');
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
     * Lê o valor de um symbol object.
     * Reutiliza função utilitária existente ou faz leitura direta.
     *
     * @param {object} symbolObj - Symbol object
     * @returns {Promise<any>} - Promise resolvida com o valor do símbolo
     */
    function readSymbolValue(symbolObj) {
        // Usar função utilitária existente se disponível
        if (NS.getValueFromSymbolExpressionPromise) {
            return NS.getValueFromSymbolExpressionPromise(symbolObj);
        }

        // Fallback: leitura direta
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
    // REGISTRO DA FUNÇÃO NO FRAMEWORK
    // ========================================
    if (TcHmi.Functions && typeof TcHmi.Functions.registerFunctionEx === 'function') {
        TcHmi.Functions.registerFunctionEx(
            'SelectValueByIndexWithMode',
            'TcHmi.Functions.HMI_Dark',
            SelectValueByIndexWithMode
        );
        console.log('[SelectValueByIndexWithMode] Função registrada com sucesso no namespace TcHmi.Functions.HMI_Dark');
    } else {
        console.error('[SelectValueByIndexWithMode] ERRO: TcHmi.Functions.registerFunctionEx não está disponível!');
    }

})(TcHmi);
