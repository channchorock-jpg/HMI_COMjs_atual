// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />

/*
 * WriteValueByIndex
 * ====================
 * Função genérica para escrever um valor em um símbolo PLC selecionado por índice.
 *
 * OBJETIVO:
 * Inversa de SelectValueByIndex - ao invés de LER valores, ESCREVE valores em símbolos.
 * Útil para salvar valores de controles em diferentes símbolos PLC baseado em um índice.
 *
 * PARÂMETROS:
 * - indexSource: origem do índice (pode ser symbol object, controle ou número literal)
 * - value: valor a escrever (pode vir de controle, symbol ou número literal)
 * - symbol0, symbol1, symbol2, symbol3: símbolos PLC de destino para cada índice (0-3)
 *
 * RETORNO:
 * true se escreveu com sucesso, false em caso de erro.
 *
 * USO NO EDITOR (JavaScript):
 * TcHmi.Functions.HMI_Dark.WriteValueByIndex(
 *     %pp%iSenseLimit%/pp%,                                  // indexSource (Yes, pass symbol reference)
 *     %ctrl%InputBox_Limit_Max::Value%/ctrl%,                // value (valor do controle)
 *     %pp%stControle[0]::stSafeGuardSensor::fValueMax%/pp%, // symbol0
 *     %pp%stControle[1]::stSafeGuardSensor::fValueMax%/pp%, // symbol1
 *     null,                                                 // symbol2 (opcional)
 *     null,                                                 // symbol3 (opcional)
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
     * WriteValueByIndex
     * Escreve um valor em um símbolo PLC selecionado por índice.
     *
     * @param {object} ctx - Contexto do TwinCAT HMI (obrigatório para funções registradas)
     * @param {any} indexSource - Origem do índice (symbol object, controle ou número)
     * @param {any} value - Valor a escrever (pode vir de controle, symbol ou número)
     * @param {object} symbol0 - Symbol object de destino para índice 0
     * @param {object} symbol1 - Symbol object de destino para índice 1
     * @param {object} symbol2 - Symbol object de destino para índice 2 (opcional)
     * @param {object} symbol3 - Symbol object de destino para índice 3 (opcional)
     */
    function WriteValueByIndex(ctx, indexSource, value, symbol0, symbol1, symbol2, symbol3) {
        // Validação do contexto
        if (!ctx || typeof ctx.success !== 'function' || typeof ctx.error !== 'function') {
            console.error('[WriteValueByIndex] Contexto inválido (ctx.success/ctx.error ausentes).');
            return;
        }

        try {
            // ========================================
            // ETAPA 1: NORMALIZAR O ÍNDICE
            // ========================================
            normalizeIndex(indexSource)
                .then(function (index) {
                    console.log('[WriteValueByIndex] Índice normalizado:', index);

                    // ========================================
                    // ETAPA 2: NORMALIZAR O VALOR
                    // ========================================
                    return normalizeValue(value)
                        .then(function (valueToWrite) {
                            console.log('[WriteValueByIndex] Valor normalizado:', valueToWrite);
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
                            if (symbol0 && isSymbolObject(symbol0)) {
                                selectedSymbol = symbol0;
                                console.log('[WriteValueByIndex] Selecionado symbol0 para índice', index);
                            }
                            break;
                        case 1:
                            if (symbol1 && isSymbolObject(symbol1)) {
                                selectedSymbol = symbol1;
                                console.log('[WriteValueByIndex] Selecionado symbol1 para índice', index);
                            }
                            break;
                        case 2:
                            if (symbol2 && isSymbolObject(symbol2)) {
                                selectedSymbol = symbol2;
                                console.log('[WriteValueByIndex] Selecionado symbol2 para índice', index);
                            }
                            break;
                        case 3:
                            if (symbol3 && isSymbolObject(symbol3)) {
                                selectedSymbol = symbol3;
                                console.log('[WriteValueByIndex] Selecionado symbol3 para índice', index);
                            }
                            break;
                        default:
                            console.error('[WriteValueByIndex] Índice', index, 'fora do intervalo (0-3).');
                            ctx.error('Índice fora do intervalo: ' + index);
                            return;
                    }

                    // Se nenhum símbolo foi configurado para este índice
                    if (!selectedSymbol) {
                        console.error('[WriteValueByIndex] Nenhum símbolo configurado para índice', index);
                        ctx.error('Nenhum símbolo configurado para índice: ' + index);
                        return;
                    }

                    // ========================================
                    // ETAPA 4: ESCREVER O VALOR NO SÍMBOLO SELECIONADO
                    // ========================================
                    writeSymbolValue(selectedSymbol, valueToWrite)
                        .then(function () {
                            console.log('[WriteValueByIndex] Valor', valueToWrite, 'escrito com sucesso no símbolo (índice', index + ')');
                            ctx.success(true);
                        })
                        .catch(function (err) {
                            console.error('[WriteValueByIndex] Erro ao escrever no símbolo:', err);
                            ctx.error('Erro ao escrever no símbolo: ' + (err && (err.message || String(err))));
                        });
                })
                .catch(function (err) {
                    console.error('[WriteValueByIndex] Erro:', err);
                    ctx.error('Erro em WriteValueByIndex: ' + (err && (err.message || String(err))));
                });

        } catch (e) {
            console.error('[WriteValueByIndex] Exceção não tratada:', e);
            ctx.error('Exceção em WriteValueByIndex: ' + (e && (e.message || String(e))));
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
                    console.log('[WriteValueByIndex.normalizeIndex] indexSource é um symbol object. Lendo valor...');

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
                    console.log('[WriteValueByIndex.normalizeIndex] indexSource é um controle TcHmi. Usando getValue()...');
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
                    console.log('[WriteValueByIndex.normalizeIndex] indexSource é um número literal:', indexSource);
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
                    console.log('[WriteValueByIndex.normalizeIndex] indexSource é uma string. Tentando conversão...');
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
                    console.log('[WriteValueByIndex.normalizeValue] value é um symbol object. Lendo valor...');

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
                    console.log('[WriteValueByIndex.normalizeValue] value é um controle TcHmi. Usando getValue()...');
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
                    console.log('[WriteValueByIndex.normalizeValue] value é um número literal:', value);
                    resolve(value);
                    return;
                }

                // CASO 4: String que pode ser convertida para número
                if (typeof value === 'string') {
                    console.log('[WriteValueByIndex.normalizeValue] value é uma string. Tentando conversão...');
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
            'WriteValueByIndex',
            'TcHmi.Functions.HMI_Dark',
            WriteValueByIndex
        );
        console.log('[WriteValueByIndex] Função registrada com sucesso no namespace TcHmi.Functions.HMI_Dark');
    } else {
        console.error('[WriteValueByIndex] ERRO: TcHmi.Functions.registerFunctionEx não está disponível!');
    }

})(TcHmi);
