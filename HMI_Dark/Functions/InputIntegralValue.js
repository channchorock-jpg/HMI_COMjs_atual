/// Keep these lines for a best effort IntelliSense of Visual Studio 2017+
/// <reference path="../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />
// ===========================================================================
// Função: InputIntegralValue
// Descrição: Calcula tempo integral (1/IntGain) e escreve no sensor selecionado
// Compatível com TwinCAT HMI Framework v1.12
// Namespace: TcHmi.Functions.HMI_Dark
// Versão: 3.0 - Uso de objetos de símbolo (symbol reference) para compatibilidade universal
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
                console.error('[InputIntegralValue] Objeto de símbolo inválido ou não é um objeto.');
                return null;
            }

            if (!symbolObj.__symbol || !symbolObj.__symbol.__expression) {
                console.error('[InputIntegralValue] Estrutura de símbolo inválida: __symbol ou __expression ausente.');
                return null;
            }

            var expression = symbolObj.__symbol.__expression.__expression;

            if (typeof expression !== 'string' || !expression) {
                console.error('[InputIntegralValue] Expressão do símbolo inválida ou vazia.');
                return null;
            }

            return expression;

        } catch (e) {
            console.error('[InputIntegralValue] Exceção ao extrair expressão do símbolo:', e);
            return null;
        }
    }

    /**
     * Calcula o tempo integral baseado no ganho (1/IntGain), converte para TIME e escreve no símbolo
     * @param {object} ctx - Contexto de execução do TwinCAT HMI (obrigatório para registerFunctionEx)
     * @param {number} iSensorShow - Índice do sensor a exibir (0 ou 1)
     * @param {number} fIntGain - Valor do ganho integral (REAL)
     * @param {object} symbolObj0 - Objeto de símbolo (reference) para sensor 0
     *                              Marque "Yes, pass symbol reference" no editor HMI
     *                              Aceita qualquer tipo: PLC (%s%), UserControl (%pp%), Control (%ctrl%), etc.
     * @param {object} symbolObj1 - Objeto de símbolo (reference) para sensor 1
     * @returns {string|null} Valor TIME no formato ISO 8601 que foi escrito, ou null em caso de erro
     */
    function InputIntegralValue(ctx, iSensorShow, fIntGain, symbolObj0, symbolObj1) {

        // ===================================================================
        // 1. VALIDAÇÃO DE PARÂMETROS - SENSOR INDEX
        // ===================================================================

        var sensorIndex = (iSensorShow !== null && iSensorShow !== undefined)
                          ? parseInt(iSensorShow, 10)
                          : 0;

        if (isNaN(sensorIndex) || sensorIndex < 0 || sensorIndex > 1) {
            console.error('[InputIntegralValue] Erro: iSensorShow inválido. Deve ser 0 ou 1. Recebido:', iSensorShow);
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('iSensorShow deve ser 0 ou 1');
            }
            return null;
        }

        // ===================================================================
        // 2. VALIDAÇÃO DE PARÂMETROS - INTEGRAL GAIN
        // ===================================================================

        if (fIntGain === null || fIntGain === undefined) {
            console.error('[InputIntegralValue] Erro: fIntGain não fornecido ou é null/undefined.');
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('fIntGain não fornecido');
            }
            return null;
        }

        var intGain = parseFloat(fIntGain);

        if (isNaN(intGain)) {
            console.error('[InputIntegralValue] Erro: fIntGain não é um número válido. Recebido:', fIntGain);
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('fIntGain não é um número válido');
            }
            return null;
        }

        if (intGain === 0) {
            console.error('[InputIntegralValue] Erro: fIntGain não pode ser zero (divisão por zero).');
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('fIntGain não pode ser zero');
            }
            return null;
        }

        // ===================================================================
        // 3. VALIDAÇÃO E EXTRAÇÃO DOS SÍMBOLOS
        // ===================================================================

        var expression0 = getSymbolExpression(symbolObj0);
        if (!expression0) {
            console.error('[InputIntegralValue] Erro: Falha ao extrair expressão do symbolObj0.');
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('symbolObj0 inválido');
            }
            return null;
        }

        var expression1 = getSymbolExpression(symbolObj1);
        if (!expression1) {
            console.error('[InputIntegralValue] Erro: Falha ao extrair expressão do symbolObj1.');
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('symbolObj1 inválido');
            }
            return null;
        }

        console.log('[InputIntegralValue] Símbolos extraídos:', {
            sensor0: expression0,
            sensor1: expression1
        });

        // ===================================================================
        // 4. CÁLCULO DO TEMPO INTEGRAL
        // ===================================================================

        // Fórmula: tRealValue = 1 / IntGain
        var tRealValue = 1.0 / intGain;

        console.log('[InputIntegralValue] Cálculo realizado:', {
            intGain: intGain,
            tRealValue: tRealValue,
            unidade: 'segundos'
        });

        // ===================================================================
        // 5. CONVERSÃO PARA FORMATO TIME (ISO 8601)
        // ===================================================================

        var timeValue = TcHmi.Functions.HMI_Dark.ConvertRealToISO8601(tRealValue, true);

        if (timeValue === null) {
            console.error('[InputIntegralValue] Erro: Falha na conversão para ISO 8601.');
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('Falha na conversão para ISO 8601');
            }
            return null;
        }

        console.log('[InputIntegralValue] Conversão para TIME:', {
            real_seconds: tRealValue,
            iso8601: timeValue
        });

        // ===================================================================
        // 6. SELEÇÃO DO SÍMBOLO BASEADO NO ÍNDICE DO SENSOR
        // ===================================================================

        var targetExpression = null;

        switch (sensorIndex) {
            case 0:
                targetExpression = expression0;
                console.log('[InputIntegralValue] Sensor 0 selecionado. Expressão:', targetExpression);
                break;

            case 1:
                targetExpression = expression1;
                console.log('[InputIntegralValue] Sensor 1 selecionado. Expressão:', targetExpression);
                break;

            default:
                console.error('[InputIntegralValue] Erro: Índice de sensor inválido:', sensorIndex);
                if (ctx && typeof ctx.error === 'function') {
                    ctx.error('Índice de sensor inválido');
                }
                return null;
        }

        // ===================================================================
        // 7. ESCRITA NO SÍMBOLO USANDO writeEx2
        // ===================================================================

        console.log('[InputIntegralValue] Escrevendo valor:', {
            sensor: sensorIndex,
            expressao: targetExpression,
            valor: timeValue
        });

        // Usa writeEx2 que aceita expressões extraídas de objetos de símbolo
        TcHmi.Symbol.writeEx2(targetExpression, timeValue, function (data) {
            if (!data) {
                console.error('[InputIntegralValue] ✗ writeEx2 não retornou dados.');
                if (ctx && typeof ctx.error === 'function') {
                    ctx.error('Escrita falhou (sem resposta)');
                }
                return;
            }

            if (data.error === TcHmi.Errors.NONE) {
                console.log('[InputIntegralValue] ✓ Escrita bem-sucedida:', {
                    sensor: sensorIndex,
                    expressao: targetExpression,
                    valor: timeValue
                });

                // Chama success callback se disponível
                if (ctx && typeof ctx.success === 'function') {
                    ctx.success(timeValue);
                }

            } else {
                // Mapeia código de erro para nome
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

                console.error('[InputIntegralValue] ✗ Erro na escrita:', {
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
        // 8. LOG DE DEPURAÇÃO COMPLETO
        // ===================================================================

        console.log('[InputIntegralValue] ✓ Operação iniciada:', {
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

        // ===================================================================
        // 9. RETORNO DO VALOR CONVERTIDO
        // ===================================================================

        return timeValue;
    }

    // ===========================================================================
    // REGISTRO DA FUNÇÃO NO FRAMEWORK TCHMI
    // ===========================================================================

    TcHmi.Functions.registerFunctionEx(
        'InputIntegralValue',          // Nome da função
        'TcHmi.Functions.HMI_Dark',    // Namespace do projeto
        InputIntegralValue             // Referência à função
    );

})(TcHmi);