// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />

/*
 * SelectValueByIndex
 * ====================
 * Função genérica para selecionar e retornar o valor de um símbolo PLC baseado em um índice numérico.
 *
 * OBJETIVO:
 * Substitui expressões IIFE que usam switch-case para selecionar valores de diferentes símbolos.
 *
 * PARÂMETROS:
 * - indexSource: origem do índice (pode ser symbol object, controle ou número literal)
 * - symbol0, symbol1, symbol2, symbol3: símbolos PLC para cada índice (0-3)
 * - defaultValue: valor de fallback (padrão: 0)
 *
 * RETORNO:
 * Valor numérico lido do símbolo correspondente ao índice, ou defaultValue se inválido.
 *
 * USO NO EDITOR (JavaScript Return Value):
 * TcHmi.Functions.HMI_Dark.SelectValueByIndex(
 *     %pp%iSenseLimit%/pp%,                                  // indexSource (Yes, pass symbol reference)
 *     %pp%stControle[0]::stSafeGuardSensor::fValueMax%/pp%, // symbol0
 *     %pp%stControle[1]::stSafeGuardSensor::fValueMax%/pp%, // symbol1
 *     null,                                                 // symbol2 (opcional)
 *     null,                                                 // symbol3 (opcional)
 *     0                                                     // defaultValue
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
     * SelectValueByIndex
     * Seleciona e retorna o valor de um símbolo baseado em um índice numérico.
     *
     * @param {object} ctx - Contexto do TwinCAT HMI (obrigatório para funções registradas)
     * @param {any} indexSource - Origem do índice (symbol object, controle ou número)
     * @param {object} symbol0 - Symbol object para índice 0
     * @param {object} symbol1 - Symbol object para índice 1
     * @param {object} symbol2 - Symbol object para índice 2 (opcional)
     * @param {object} symbol3 - Symbol object para índice 3 (opcional)
     * @param {number} defaultValue - Valor padrão se índice inválido ou leitura falhar
     */
    function SelectValueByIndex(ctx, indexSource, symbol0, symbol1, symbol2, symbol3, defaultValue) {
        // Validação do contexto
        if (!ctx || typeof ctx.success !== 'function' || typeof ctx.error !== 'function') {
            console.error('[SelectValueByIndex] Contexto inválido (ctx.success/ctx.error ausentes).');
            return;
        }

        // Valor padrão se não fornecido
        if (typeof defaultValue !== 'number') {
            defaultValue = 0;
        }

        try {
            // ========================================
            // ETAPA 1: NORMALIZAR O ÍNDICE
            // ========================================
            normalizeIndex(indexSource)
                .then(function (index) {
                    console.log('[SelectValueByIndex] Índice normalizado:', index);

                    // ========================================
                    // ETAPA 2: SELECIONAR SÍMBOLO BASEADO NO ÍNDICE
                    // ========================================
                    var selectedSymbol = null;

                    switch (index) {
                        case 0:
                            if (symbol0 && isSymbolObject(symbol0)) {
                                selectedSymbol = symbol0;
                                console.log('[SelectValueByIndex] Selecionado symbol0 para índice', index);
                            }
                            break;
                        case 1:
                            if (symbol1 && isSymbolObject(symbol1)) {
                                selectedSymbol = symbol1;
                                console.log('[SelectValueByIndex] Selecionado symbol1 para índice', index);
                            }
                            break;
                        case 2:
                            if (symbol2 && isSymbolObject(symbol2)) {
                                selectedSymbol = symbol2;
                                console.log('[SelectValueByIndex] Selecionado symbol2 para índice', index);
                            }
                            break;
                        case 3:
                            if (symbol3 && isSymbolObject(symbol3)) {
                                selectedSymbol = symbol3;
                                console.log('[SelectValueByIndex] Selecionado symbol3 para índice', index);
                            }
                            break;
                        default:
                            console.log('[SelectValueByIndex] Índice', index, 'fora do intervalo. Usando defaultValue:', defaultValue);
                            ctx.success(defaultValue);
                            return;
                    }

                    // Se nenhum símbolo foi configurado para este índice
                    if (!selectedSymbol) {
                        console.log('[SelectValueByIndex] Nenhum símbolo configurado para índice', index, '. Usando defaultValue:', defaultValue);
                        ctx.success(defaultValue);
                        return;
                    }

                    // ========================================
                    // ETAPA 3: LER O VALOR DO SÍMBOLO SELECIONADO
                    // ========================================
                    readSymbolValue(selectedSymbol)
                        .then(function (value) {
                            console.log('[SelectValueByIndex] Valor lido do símbolo:', value);

                            // Garantir retorno numérico
                            var numericValue = parseFloat(value);
                            if (isNaN(numericValue)) {
                                console.warn('[SelectValueByIndex] Valor lido não é numérico:', value, '. Usando defaultValue:', defaultValue);
                                ctx.success(defaultValue);
                            } else {
                                ctx.success(numericValue);
                            }
                        })
                        .catch(function (err) {
                            console.error('[SelectValueByIndex] Erro ao ler símbolo:', err);
                            console.log('[SelectValueByIndex] Usando defaultValue:', defaultValue);
                            ctx.success(defaultValue);
                        });
                })
                .catch(function (err) {
                    console.error('[SelectValueByIndex] Erro ao normalizar índice:', err);
                    ctx.error('Erro ao normalizar índice: ' + (err && (err.message || String(err))));
                });

        } catch (e) {
            console.error('[SelectValueByIndex] Exceção não tratada:', e);
            ctx.error('Exceção em SelectValueByIndex: ' + (e && (e.message || String(e))));
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
            'SelectValueByIndex',
            'TcHmi.Functions.HMI_Dark',
            SelectValueByIndex
        );
        console.log('[SelectValueByIndex] Função registrada com sucesso no namespace TcHmi.Functions.HMI_Dark');
    } else {
        console.error('[SelectValueByIndex] ERRO: TcHmi.Functions.registerFunctionEx não está disponível!');
    }

})(TcHmi);
