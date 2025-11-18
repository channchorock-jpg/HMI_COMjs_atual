/// Keep these lines for a best effort IntelliSense of Visual Studio 2017+
/// <reference path="../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />
// ===========================================================================
// Função: ReceiveIntegralValue
// Descrição: Calcula o ganho integral (IntGain = 1/Valor) a partir de valores TIME
// Compatível com TwinCAT HMI Framework v1.12
// Namespace: TcHmi.Functions.HMI_Dark
// Versão: 1.2 - Implementa conversão TIME→REAL internamente (sem dependência)
// ===========================================================================

(function (TcHmi) {
    /**
     * Calcula o ganho integral (IntGain) a partir de valores TIME de sensores
     * @param {number} iSensorShow - Índice do sensor a exibir (0 = timeValue0, 1 = timeValue1)
     * @param {number|string} timeValue0 - Valor TIME do sensor 0 em milissegundos ou ISO 8601
     * @param {number|string} timeValue1 - Valor TIME do sensor 1 em milissegundos ou ISO 8601
     * @param {number} decimalPlaces - Número de casas decimais no resultado (padrão: 6)
     * @param {object} __context - Contexto de execução fornecido pelo framework
     * @returns {number|null} Ganho integral (IntGain), 0 quando TIME=0, ou null em caso de erro
     */
    function ReceiveIntegralValue(iSensorShow, timeValue0, timeValue1, decimalPlaces, __context) {

        // ===================================================================
        // 1. VALIDAÇÃO DE PARÂMETROS
        // ===================================================================

        console.log('[ReceiveIntegralValue] Iniciando cálculo de ganho integral...', {
            iSensorShow: iSensorShow,
            timeValue0: timeValue0,
            timeValue1: timeValue1,
            decimalPlaces: decimalPlaces
        });

        // Valida se pelo menos um dos valores TIME foi fornecido
        if ((timeValue0 === null || timeValue0 === undefined) &&
            (timeValue1 === null || timeValue1 === undefined)) {
            console.error('[ReceiveIntegralValue] Erro: Nenhum valor TIME fornecido (timeValue0 e timeValue1 são null/undefined).');
            return null;
        }

        // ===================================================================
        // 2. SELEÇÃO DO SENSOR E CONVERSÃO TIME → REAL
        // ===================================================================

        // Valida iSensorShow
        var sensorIndex = (iSensorShow !== null && iSensorShow !== undefined)
                          ? parseInt(iSensorShow, 10)
                          : 0;

        if (isNaN(sensorIndex)) {
            console.warn('[ReceiveIntegralValue] Aviso: iSensorShow inválido. Usando padrão 0.');
            sensorIndex = 0;
        }

        // Seleciona o timeValue baseado no índice do sensor
        var timeValue = null;

        switch (sensorIndex) {
            case 0:
                timeValue = timeValue0;
                console.log('[ReceiveIntegralValue] Sensor 0 selecionado (timeValue0)');
                break;

            case 1:
                timeValue = timeValue1;
                console.log('[ReceiveIntegralValue] Sensor 1 selecionado (timeValue1)');
                break;

            default:
                console.warn('[ReceiveIntegralValue] Aviso: iSensorShow fora do intervalo (0-1). Usando sensor 0.');
                timeValue = timeValue0;
                sensorIndex = 0;
                break;
        }

        // Verifica se timeValue foi fornecido
        if (timeValue === null || timeValue === undefined) {
            console.error('[ReceiveIntegralValue] Erro: timeValue do sensor', sensorIndex, 'não fornecido ou é null/undefined.');
            return null;
        }

        var timeMs = 0; // Valor em milissegundos (será calculado)

        // Detecção e conversão de formato
        if (typeof timeValue === 'string') {
            // FORMATO ISO 8601 DURATION (ex: "PT3S", "PT1M30S", "PT500MS")
            console.log('[ReceiveIntegralValue] Detectado formato STRING:', timeValue);

            // Regex para parse ISO 8601 Duration
            var iso8601Regex = /^PT(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?(?:(\d+(?:\.\d+)?)MS)?$/i;
            var match = timeValue.match(iso8601Regex);

            if (match) {
                var hours = parseFloat(match[1]) || 0;
                var minutes = parseFloat(match[2]) || 0;
                var seconds = parseFloat(match[3]) || 0;
                var milliseconds = parseFloat(match[4]) || 0;

                // Converte tudo para milissegundos
                timeMs = (hours * 3600000) +      // 1h = 3600000ms
                         (minutes * 60000) +       // 1m = 60000ms
                         (seconds * 1000) +        // 1s = 1000ms
                         milliseconds;             // já em ms

                console.log('[ReceiveIntegralValue] Parse ISO 8601:', {
                    original: timeValue,
                    h: hours,
                    m: minutes,
                    s: seconds,
                    ms: milliseconds,
                    total_ms: timeMs
                });

            } else {
                // Tenta interpretar como string numérica (fallback)
                timeMs = parseFloat(timeValue);

                if (isNaN(timeMs)) {
                    console.error('[ReceiveIntegralValue] Erro: Formato de string inválido. Recebido:', timeValue);
                    console.error('[ReceiveIntegralValue] Formatos aceitos: PT3S, PT5M, PT1H30M, PT500MS, ou número');
                    return null;
                }
            }

        } else if (typeof timeValue === 'number') {
            // FORMATO NUMÉRICO (milissegundos diretos)
            timeMs = timeValue;
            console.log('[ReceiveIntegralValue] Detectado formato NUMBER:', timeMs, 'ms');

        } else {
            console.error('[ReceiveIntegralValue] Erro: Tipo de dado não suportado:', typeof timeValue);
            return null;
        }

        // Valida se é um número válido após conversão
        if (isNaN(timeMs)) {
            console.error('[ReceiveIntegralValue] Erro: Conversão resultou em NaN. Valor original:', timeValue);
            return null;
        }

        // Valida se é valor não-negativo (TIME no PLC é sempre >= 0)
        if (timeMs < 0) {
            console.warn('[ReceiveIntegralValue] Aviso: timeValue negativo detectado. Usando valor absoluto.');
            timeMs = Math.abs(timeMs);
        }

        // Conversão TIME → REAL (milissegundos → segundos)
        var convertedValue = timeMs / 1000.0;

        console.log('[ReceiveIntegralValue] Valor convertido (segundos):', convertedValue);

        // ===================================================================
        // 3. VALIDAÇÃO ANTES DO CÁLCULO
        // ===================================================================

        // Verifica divisão por zero - retorna 0 quando TIME = 0
        if (convertedValue === 0) {
            console.log('[ReceiveIntegralValue] Valor convertido é zero. Retornando IntGain = 0.');
            return 0;
        }

        // ===================================================================
        // 4. CÁLCULO DO GANHO INTEGRAL
        // ===================================================================

        // Fórmula: IntGain = 1 / Valor convertido
        var intGain = 1.0 / convertedValue;

        console.log('[ReceiveIntegralValue] IntGain calculado (sem arredondamento):', intGain);

        // ===================================================================
        // 5. FORMATAÇÃO DO RESULTADO
        // ===================================================================

        // Define número de casas decimais (padrão 6)
        var decimals = (decimalPlaces !== null && decimalPlaces !== undefined)
                       ? parseInt(decimalPlaces, 10)
                       : 6;

        // Valida casas decimais (0-10)
        if (isNaN(decimals) || decimals < 0 || decimals > 10) {
            console.warn('[ReceiveIntegralValue] Casas decimais inválidas. Usando padrão 6.');
            decimals = 6;
        }

        // Arredonda para o número de casas decimais especificado
        var multiplier = Math.pow(10, decimals);
        var result = Math.round(intGain * multiplier) / multiplier;

        // ===================================================================
        // 6. LOG DE DEPURAÇÃO E RETORNO
        // ===================================================================

        console.log('[ReceiveIntegralValue] ✓ Cálculo bem-sucedido:', {
            sensorIndex: sensorIndex,
            timeValue_usado: timeValue,
            timeMs: timeMs,
            valorConvertido_s: convertedValue,
            intGain_bruto: intGain,
            intGain_final: result,
            casas_decimais: decimals
        });

        return result;
    }

    // ===========================================================================
    // REGISTRO DA FUNÇÃO NO FRAMEWORK TCHMI
    // ===========================================================================

    TcHmi.Functions.registerFunctionEx(
        'ReceiveIntegralValue',        // Nome da função
        'TcHmi.Functions.HMI_Dark',    // Namespace do projeto
        ReceiveIntegralValue           // Referência à função
    );

})(TcHmi);