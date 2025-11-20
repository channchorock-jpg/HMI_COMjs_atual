/// Keep these lines for a best effort IntelliSense of Visual Studio 2017+
/// <reference path="../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />
// ===========================================================================
// Função: InputTimeValue
// Descrição: Converte valor REAL (segundos) para TIME ISO 8601 e escreve no sensor selecionado
// Compatível com TwinCAT HMI Framework v1.12
// Namespace: TcHmi.Functions.HMI_Dark
// Versão: 1.0 - Uso de objetos de símbolo (symbol reference) para compatibilidade universal
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
                console.error('[InputTimeValue] Objeto de símbolo inválido ou não é um objeto.');
                return null;
            }

            if (!symbolObj.__symbol || !symbolObj.__symbol.__expression) {
                console.error('[InputTimeValue] Estrutura de símbolo inválida: __symbol ou __expression ausente.');
                return null;
            }

            var expression = symbolObj.__symbol.__expression.__expression;

            if (typeof expression !== 'string' || !expression) {
                console.error('[InputTimeValue] Expressão do símbolo inválida ou vazia.');
                return null;
            }

            return expression;

        } catch (e) {
            console.error('[InputTimeValue] Exceção ao extrair expressão do símbolo:', e);
            return null;
        }
    }

    /**
     * Converte valor REAL (segundos) para TIME ISO 8601 e escreve no símbolo
     * @param {object} ctx - Contexto de execução do TwinCAT HMI (obrigatório para registerFunctionEx)
     * @param {number} iSensorShow - Índice do sensor a exibir (0 ou 1)
     * @param {number} tRealValue - Valor de tempo em segundos (REAL)
     * @param {object} symbolObj0 - Objeto de símbolo (reference) para sensor 0
     *                              Marque "Yes, pass symbol reference" no editor HMI
     *                              Aceita qualquer tipo: PLC (%s%), UserControl (%pp%), Control (%ctrl%), etc.
     * @param {object} symbolObj1 - Objeto de símbolo (reference) para sensor 1
     * @returns {string|null} Valor TIME no formato ISO 8601 que foi escrito, ou null em caso de erro
     */
    function InputTimeValue(ctx, iSensorShow, tRealValue, symbolObj0, symbolObj1) {

        // ===================================================================
        // 1. VALIDAÇÃO DE PARÂMETROS - SENSOR INDEX
        // ===================================================================

        var sensorIndex = (iSensorShow !== null && iSensorShow !== undefined)
                          ? parseInt(iSensorShow, 10)
                          : 0;

        if (isNaN(sensorIndex) || sensorIndex < 0 || sensorIndex > 1) {
            console.error('[InputTimeValue] Erro: iSensorShow inválido. Deve ser 0 ou 1. Recebido:', iSensorShow);
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('iSensorShow deve ser 0 ou 1');
            }
            return null;
        }

        // ===================================================================
        // 2. VALIDAÇÃO DE PARÂMETROS - TIME VALUE
        // ===================================================================

        if (tRealValue === null || tRealValue === undefined) {
            console.error('[InputTimeValue] Erro: tRealValue não fornecido ou é null/undefined.');
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('tRealValue não fornecido');
            }
            return null;
        }

        var timeValue = parseFloat(tRealValue);

        if (isNaN(timeValue)) {
            console.error('[InputTimeValue] Erro: tRealValue não é um número válido. Recebido:', tRealValue);
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('tRealValue não é um número válido');
            }
            return null;
        }

        if (timeValue < 0) {
            console.warn('[InputTimeValue] Aviso: tRealValue negativo detectado. Usando valor absoluto.');
            timeValue = Math.abs(timeValue);
        }

        // ===================================================================
        // 3. VALIDAÇÃO E EXTRAÇÃO DOS SÍMBOLOS
        // ===================================================================

        var expression0 = getSymbolExpression(symbolObj0);
        if (!expression0) {
            console.error('[InputTimeValue] Erro: Falha ao extrair expressão do symbolObj0.');
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('symbolObj0 inválido');
            }
            return null;
        }

        var expression1 = getSymbolExpression(symbolObj1);
        if (!expression1) {
            console.error('[InputTimeValue] Erro: Falha ao extrair expressão do symbolObj1.');
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('symbolObj1 inválido');
            }
            return null;
        }

        console.log('[InputTimeValue] Símbolos extraídos:', {
            sensor0: expression0,
            sensor1: expression1
        });

        // ===================================================================
        // 4. CONVERSÃO PARA FORMATO TIME (ISO 8601)
        // ===================================================================

        console.log('[InputTimeValue] Valor recebido:', {
            tRealValue: timeValue,
            unidade: 'segundos'
        });

        var iso8601TimeValue = TcHmi.Functions.HMI_Dark.ConvertRealToISO8601(timeValue, true);

        if (iso8601TimeValue === null) {
            console.error('[InputTimeValue] Erro: Falha na conversão para ISO 8601.');
            if (ctx && typeof ctx.error === 'function') {
                ctx.error('Falha na conversão para ISO 8601');
            }
            return null;
        }

        console.log('[InputTimeValue] Conversão para TIME:', {
            real_seconds: timeValue,
            iso8601: iso8601TimeValue
        });

        // ===================================================================
        // 5. SELEÇÃO DO SÍMBOLO BASEADO NO ÍNDICE DO SENSOR
        // ===================================================================

        var targetExpression = null;

        switch (sensorIndex) {
            case 0:
                targetExpression = expression0;
                console.log('[InputTimeValue] Sensor 0 selecionado. Expressão:', targetExpression);
                break;

            case 1:
                targetExpression = expression1;
                console.log('[InputTimeValue] Sensor 1 selecionado. Expressão:', targetExpression);
                break;

            default:
                console.error('[InputTimeValue] Erro: Índice de sensor inválido:', sensorIndex);
                if (ctx && typeof ctx.error === 'function') {
                    ctx.error('Índice de sensor inválido');
                }
                return null;
        }

        // ===================================================================
        // 6. ESCRITA NO SÍMBOLO USANDO writeEx2
        // ===================================================================

        console.log('[InputTimeValue] Escrevendo valor:', {
            sensor: sensorIndex,
            expressao: targetExpression,
            valor: iso8601TimeValue
        });

        // Usa writeEx2 que aceita expressões extraídas de objetos de símbolo
        TcHmi.Symbol.writeEx2(targetExpression, iso8601TimeValue, function (data) {
            if (!data) {
                console.error('[InputTimeValue] ✗ writeEx2 não retornou dados.');
                if (ctx && typeof ctx.error === 'function') {
                    ctx.error('Escrita falhou (sem resposta)');
                }
                return;
            }

            if (data.error === TcHmi.Errors.NONE) {
                console.log('[InputTimeValue] ✓ Escrita bem-sucedida:', {
                    sensor: sensorIndex,
                    expressao: targetExpression,
                    valor: iso8601TimeValue
                });

                // Chama success callback se disponível
                if (ctx && typeof ctx.success === 'function') {
                    ctx.success(iso8601TimeValue);
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

                console.error('[InputTimeValue] ✗ Erro na escrita:', {
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
        // 7. LOG DE DEPURAÇÃO COMPLETO
        // ===================================================================

        console.log('[InputTimeValue] ✓ Operação iniciada:', {
            entrada: {
                sensor_index: sensorIndex,
                time_value_seconds: timeValue,
                expressao_0: expression0,
                expressao_1: expression1
            },
            conversao: {
                formato: 'ISO 8601 Duration',
                valor: iso8601TimeValue
            },
            escrita: {
                expressao_selecionada: targetExpression,
                status: 'assíncrono (aguardando callback)'
            }
        });

        // ===================================================================
        // 8. RETORNO DO VALOR CONVERTIDO
        // ===================================================================

        return iso8601TimeValue;
    }

    // ===========================================================================
    // REGISTRO DA FUNÇÃO NO FRAMEWORK TCHMI
    // ===========================================================================

    TcHmi.Functions.registerFunctionEx(
        'InputTimeValue',              // Nome da função
        'TcHmi.Functions.HMI_Dark',    // Namespace do projeto
        InputTimeValue                 // Referência à função
    );

})(TcHmi);
