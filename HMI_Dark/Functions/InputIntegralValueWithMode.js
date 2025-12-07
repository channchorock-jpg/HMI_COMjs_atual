/// Keep these lines for a best effort IntelliSense of Visual Studio 2017+
/// <reference path="../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />
// ===========================================================================
// Função: InputIntegralValueWithMode
// Descrição: Calcula tempo integral (1/IntGain) e escreve no sensor selecionado
//            com suporte a enum eStateBind (STATIC_MODE=3, DYNAMIC_MODE=4)
// Compatível com TwinCAT HMI Framework v1.12
// Namespace: TcHmi.Functions.HMI_Dark
// Versão: 1.0 - Adiciona enum eStateBind para seleção STATIC/DYNAMIC
// ===========================================================================

(function (TcHmi) {
    /**
     * Extrai a expressão de um objeto de símbolo
     * @param {object} symbolObj - Objeto de símbolo do TwinCAT HMI
     * @returns {string|null} Expressão do símbolo ou null em caso de erro
     */
    function getSymbolExpression(symbolObj) {
        try {
            if (!symbolObj || typeof symbolObj !== 'object') {
                console.error('[InputIntegralValueWithMode] Objeto de símbolo inválido ou não é um objeto.');
                return null;
            }

            if (!symbolObj.__symbol || !symbolObj.__symbol.__expression) {
                console.error('[InputIntegralValueWithMode] Estrutura de símbolo inválida: __symbol ou __expression ausente.');
                return null;
            }

            var expression = symbolObj.__symbol.__expression.__expression;

            if (typeof expression !== 'string' || !expression) {
                console.error('[InputIntegralValueWithMode] Expressão do símbolo inválida ou vazia.');
                return null;
            }

            return expression;

        } catch (e) {
            console.error('[InputIntegralValueWithMode] Exceção ao extrair expressão do símbolo:', e);
            return null;
        }
    }

    /**
     * Calcula o tempo integral baseado no ganho (1/IntGain), converte para TIME e escreve no símbolo
     * com seleção de modo STATIC ou DYNAMIC
     * @param {object} ctx - Contexto de execução do TwinCAT HMI
     * @param {number} eStateBind - Modo de operação (3 = STATIC_MODE, 4 = DYNAMIC_MODE)
     * @param {number} iSensorShow - Índice do sensor a exibir (0 ou 1)
     * @param {number} fIntGain - Valor do ganho integral (REAL)
     * @param {object} symbolObjStatic0 - Symbol object STATIC para sensor 0
     * @param {object} symbolObjStatic1 - Symbol object STATIC para sensor 1
     * @param {object} symbolObjDyn0 - Symbol object DYNAMIC para sensor 0
     * @param {object} symbolObjDyn1 - Symbol object DYNAMIC para sensor 1
     * @returns {string|null} Valor TIME no formato ISO 8601 que foi escrito, ou null em caso de erro
     */
    function InputIntegralValueWithMode(ctx, eStateBind, iSensorShow, fIntGain,
                                         symbolObjStatic0, symbolObjStatic1,
                                         symbolObjDyn0, symbolObjDyn1) {

        // ===================================================================
        // 1. VALIDAÇÃO DO MODO
        // ===================================================================

        var stateMode = parseInt(eStateBind, 10);

        if (isNaN(stateMode)) {
            console.warn('[InputIntegralValueWithMode] eStateBind inválido. Usando STATIC_MODE (3).');
            stateMode = 3;
        }

        if (stateMode !== 3 && stateMode !== 4) {
            console.error('[InputIntegralValueWithMode] eStateBind inválido:', stateMode, '. Use 3 (STATIC_MODE) ou 4 (DYNAMIC_MODE).');
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('eStateBind inválido');
            }
            return null;
        }

        var modeName = (stateMode === 3) ? 'STATIC_MODE' : 'DYNAMIC_MODE';
        console.log('[InputIntegralValueWithMode] Modo selecionado:', modeName, '(' + stateMode + ')');

        // ===================================================================
        // 2. VALIDAÇÃO DE PARÂMETROS - SENSOR INDEX
        // ===================================================================

        var sensorIndex = (iSensorShow !== null && iSensorShow !== undefined)
                          ? parseInt(iSensorShow, 10)
                          : 0;

        if (isNaN(sensorIndex) || sensorIndex < 0 || sensorIndex > 1) {
            console.error('[InputIntegralValueWithMode] Erro: iSensorShow inválido. Deve ser 0 ou 1. Recebido:', iSensorShow);
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('iSensorShow deve ser 0 ou 1');
            }
            return null;
        }

        // ===================================================================
        // 3. VALIDAÇÃO DE PARÂMETROS - INTEGRAL GAIN
        // ===================================================================

        if (fIntGain === null || fIntGain === undefined) {
            console.error('[InputIntegralValueWithMode] Erro: fIntGain não fornecido ou é null/undefined.');
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('fIntGain não fornecido');
            }
            return null;
        }

        var intGain = parseFloat(fIntGain);

        if (isNaN(intGain)) {
            console.error('[InputIntegralValueWithMode] Erro: fIntGain não é um número válido. Recebido:', fIntGain);
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('fIntGain não é um número válido');
            }
            return null;
        }

        if (intGain < 0) {
            console.warn('[InputIntegralValueWithMode] Aviso: fIntGain negativo detectado. Usando valor absoluto.');
            intGain = Math.abs(intGain);
        }

        // ===================================================================
        // 4. SELEÇÃO E VALIDAÇÃO DOS SÍMBOLOS BASEADO NO MODO
        // ===================================================================

        var symbolObj0, symbolObj1;

        if (stateMode === 3) {
            // STATIC_MODE
            symbolObj0 = symbolObjStatic0;
            symbolObj1 = symbolObjStatic1;
        } else {
            // DYNAMIC_MODE
            symbolObj0 = symbolObjDyn0;
            symbolObj1 = symbolObjDyn1;
        }

        var expression0 = getSymbolExpression(symbolObj0);
        if (!expression0) {
            console.error('[InputIntegralValueWithMode]', modeName, ': Falha ao extrair expressão do symbolObj0.');
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('symbolObj0 inválido para ' + modeName);
            }
            return null;
        }

        var expression1 = getSymbolExpression(symbolObj1);
        if (!expression1) {
            console.error('[InputIntegralValueWithMode]', modeName, ': Falha ao extrair expressão do symbolObj1.');
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('symbolObj1 inválido para ' + modeName);
            }
            return null;
        }

        console.log('[InputIntegralValueWithMode]', modeName, ': Símbolos extraídos:', {
            sensor0: expression0,
            sensor1: expression1
        });

        // ===================================================================
        // 5. CÁLCULO DO TEMPO INTEGRAL
        // ===================================================================

        var tRealValue;

        if (intGain === 0) {
            tRealValue = 0;
            console.log('[InputIntegralValueWithMode]', modeName, ': IntGain = 0 detectado. Tempo integral = 0 (PT0S)');
        } else {
            tRealValue = 1.0 / intGain;
        }

        console.log('[InputIntegralValueWithMode]', modeName, ': Cálculo realizado:', {
            intGain: intGain,
            tRealValue: tRealValue,
            unidade: 'segundos',
            formula: intGain === 0 ? 'IntGain = 0 → tRealValue = 0' : 'tRealValue = 1 / IntGain'
        });

        // ===================================================================
        // 6. CONVERSÃO PARA FORMATO TIME (ISO 8601)
        // ===================================================================

        var timeValue = TcHmi.Functions.HMI_Dark.ConvertRealToISO8601(tRealValue, true);

        if (timeValue === null) {
            console.error('[InputIntegralValueWithMode]', modeName, ': Erro: Falha na conversão para ISO 8601.');
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('Falha na conversão para ISO 8601');
            }
            return null;
        }

        console.log('[InputIntegralValueWithMode]', modeName, ': Conversão para TIME:', {
            real_seconds: tRealValue,
            iso8601: timeValue
        });

        // ===================================================================
        // 7. SELEÇÃO DO SÍMBOLO BASEADO NO ÍNDICE DO SENSOR
        // ===================================================================

        var targetExpression = null;

        switch (sensorIndex) {
            case 0:
                targetExpression = expression0;
                console.log('[InputIntegralValueWithMode]', modeName, ': Sensor 0 selecionado. Expressão:', targetExpression);
                break;

            case 1:
                targetExpression = expression1;
                console.log('[InputIntegralValueWithMode]', modeName, ': Sensor 1 selecionado. Expressão:', targetExpression);
                break;

            default:
                console.error('[InputIntegralValueWithMode]', modeName, ': Erro: Índice de sensor inválido:', sensorIndex);
                if (ctx && typeof ctx.error === 'function') {
                    ctx.error('Índice de sensor inválido');
                }
                return null;
        }

        // ===================================================================
        // 8. ESCRITA NO SÍMBOLO USANDO writeEx2
        // ===================================================================

        console.log('[InputIntegralValueWithMode]', modeName, ': Escrevendo valor:', {
            sensor: sensorIndex,
            expressao: targetExpression,
            valor: timeValue
        });

        TcHmi.Symbol.writeEx2(targetExpression, timeValue, function (data) {
            if (!data) {
                console.error('[InputIntegralValueWithMode]', modeName, ': ✗ writeEx2 não retornou dados.');
                if (ctx && typeof ctx.error === 'function') {
                    ctx.error('Escrita falhou (sem resposta)');
                }
                return;
            }

            if (data.error === TcHmi.Errors.NONE) {
                console.log('[InputIntegralValueWithMode]', modeName, ': ✓ Escrita bem-sucedida:', {
                    sensor: sensorIndex,
                    expressao: targetExpression,
                    valor: timeValue
                });

                if (ctx && typeof ctx.success === 'function') {
                    ctx.success(timeValue);
                }

            } else {
                var errorName = 'UNKNOWN';
                try {
                    for (var key in TcHmi.Errors) {
                        if (Object.prototype.hasOwnProperty.call(TcHmi.Errors, key) &&
                            TcHmi.Errors[key] === data.error) {
                            errorName = key;
                            break;
                        }
                    }
                } catch (e) {
                    // Ignora erro no mapeamento
                }

                console.error('[InputIntegralValueWithMode]', modeName, ': ✗ Erro na escrita:', {
                    sensor: sensorIndex,
                    expressao: targetExpression,
                    codigo_erro: data.error,
                    nome_erro: errorName,
                    detalhes: data
                });

                if (ctx && typeof ctx.error === 'function') {
                    ctx.error('Escrita falhou: ' + errorName);
                }
            }
        });

        // ===================================================================
        // 9. LOG DE DEPURAÇÃO E RETORNO
        // ===================================================================

        console.log('[InputIntegralValueWithMode] ✓ Operação iniciada:', {
            modo: modeName,
            eStateBind: stateMode,
            entrada: {
                sensor_index: sensorIndex,
                int_gain: intGain,
                expressao_0: expression0,
                expressao_1: expression1
            },
            calculo: {
                formula: '1 / IntGain',
                resultado_segundos: tRealValue
            },
            conversao: {
                formato: 'ISO 8601 Duration',
                valor: timeValue
            },
            escrita: {
                expressao_selecionada: targetExpression,
                status: 'assíncrono (aguardando callback)'
            }
        });

        return timeValue;
    }

    // ===========================================================================
    // REGISTRO DA FUNÇÃO NO FRAMEWORK TCHMI
    // ===========================================================================

    TcHmi.Functions.registerFunctionEx(
        'InputIntegralValueWithMode',
        'TcHmi.Functions.HMI_Dark',
        InputIntegralValueWithMode
    );

})(TcHmi);
