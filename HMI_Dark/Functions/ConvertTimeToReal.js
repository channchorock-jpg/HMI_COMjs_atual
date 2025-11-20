/// Keep these lines for a best effort IntelliSense of Visual Studio 2017+
/// <reference path="../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />
// ===========================================================================
// Função: ConvertTimeToReal
// Descrição: Converte valor TIME (ISO 8601 ou milissegundos) para REAL (segundos)
// Compatível com TwinCAT HMI Framework v1.12
// Namespace: TcHmi.Functions.HMI_Dark
// Versão: 3.0 - Suporte a múltiplos sensores com seleção por índice
// ===========================================================================

(function (TcHmi) {
    /**
     * Converte um valor TIME para REAL (segundos com decimais) com seleção de sensor
     * @param {number} iSensorShow - Índice do sensor a exibir (0 = timeValue0, 1 = timeValue1)
     * @param {number|string} timeValue0 - Valor TIME do sensor 0 em milissegundos ou ISO 8601
     * @param {number|string} timeValue1 - Valor TIME do sensor 1 em milissegundos ou ISO 8601
     * @param {number} decimalPlaces - Número de casas decimais no resultado (padrão: 3)
     * @param {object} __context - Contexto de execução fornecido pelo framework
     * @returns {number|null} Valor em segundos (REAL) ou null em caso de erro
     */
    function ConvertTimeToReal(iSensorShow, timeValue0, timeValue1, decimalPlaces) {

        // ===================================================================
        // 1. VALIDAÇÃO DE PARÂMETROS - SELEÇÃO DE SENSOR
        // ===================================================================

        // Valida iSensorShow
        var sensorIndex = (iSensorShow !== null && iSensorShow !== undefined)
                          ? parseInt(iSensorShow, 10)
                          : 0;

        if (isNaN(sensorIndex)) {
            console.warn('[ConvertTimeToReal] Aviso: iSensorShow inválido. Usando padrão 0.');
            sensorIndex = 0;
        }

        // Seleciona o timeValue baseado no índice do sensor
        var timeValue = null;

        switch (sensorIndex) {
            case 0:
                timeValue = timeValue0;
                console.log('[ConvertTimeToReal] Sensor 0 selecionado (timeValue0)');
                break;

            case 1:
                timeValue = timeValue1;
                console.log('[ConvertTimeToReal] Sensor 1 selecionado (timeValue1)');
                break;

            default:
                console.warn('[ConvertTimeToReal] Aviso: iSensorShow fora do intervalo (0-1). Usando sensor 0.');
                timeValue = timeValue0;
                sensorIndex = 0;
                break;
        }

        // Verifica se timeValue foi fornecido
        if (timeValue === null || timeValue === undefined) {
            console.error('[ConvertTimeToReal] Erro: timeValue do sensor', sensorIndex, 'não fornecido ou é null/undefined.');
            return null;
        }

        var timeMs = 0; // Valor em milissegundos (será calculado)

        // ===================================================================
        // 2. DETECÇÃO E CONVERSÃO DE FORMATO
        // ===================================================================

        if (typeof timeValue === 'string') {
            // ---------------------------------------------------------------
            // FORMATO ISO 8601 DURATION (ex: "PT3S", "PT1M30S", "PT500MS")
            // ---------------------------------------------------------------

            console.log('[ConvertTimeToReal] Detectado formato STRING:', timeValue);

            // Regex para parse ISO 8601 Duration
            // Formatos suportados:
            // PT3S = 3 segundos
            // PT5M = 5 minutos
            // PT1H = 1 hora
            // PT2M30S = 2 minutos e 30 segundos
            // PT500MS = 500 milissegundos
            // PT1H30M45.5S = 1h 30min 45.5s

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

                console.log('[ConvertTimeToReal] Parse ISO 8601:', {
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
                    console.error('[ConvertTimeToReal] Erro: Formato de string inválido. Recebido:', timeValue);
                    console.error('[ConvertTimeToReal] Formatos aceitos: PT3S, PT5M, PT1H30M, PT500MS, ou número');
                    return null;
                }
            }

        } else if (typeof timeValue === 'number') {
            // ---------------------------------------------------------------
            // FORMATO NUMÉRICO (milissegundos diretos)
            // ---------------------------------------------------------------

            timeMs = timeValue;
            console.log('[ConvertTimeToReal] Detectado formato NUMBER:', timeMs, 'ms');

        } else {
            console.error('[ConvertTimeToReal] Erro: Tipo de dado não suportado:', typeof timeValue);
            return null;
        }

        // ===================================================================
        // 3. VALIDAÇÕES ADICIONAIS
        // ===================================================================

        // Valida se é um número válido após conversão
        if (isNaN(timeMs)) {
            console.error('[ConvertTimeToReal] Erro: Conversão resultou em NaN. Valor original:', timeValue);
            return null;
        }

        // Valida se é valor não-negativo (TIME no PLC é sempre >= 0)
        if (timeMs < 0) {
            console.warn('[ConvertTimeToReal] Aviso: timeValue negativo detectado. Usando valor absoluto.');
            timeMs = Math.abs(timeMs);
        }

        // Define número de casas decimais (padrão 3)
        var decimals = (decimalPlaces !== null && decimalPlaces !== undefined)
                       ? parseInt(decimalPlaces, 10)
                       : 3;

        // Valida casas decimais (0-10)
        if (isNaN(decimals) || decimals < 0 || decimals > 10) {
            console.warn('[ConvertTimeToReal] Casas decimais inválidas. Usando padrão 3.');
            decimals = 3;
        }

        // ===================================================================
        // 4. CONVERSÃO TIME → REAL
        // ===================================================================

        // Fórmula: segundos = milissegundos / 1000
        var timeSeconds = timeMs / 1000.0;

        // Arredonda para o número de casas decimais especificado
        var multiplier = Math.pow(10, decimals);
        var result = Math.round(timeSeconds * multiplier) / multiplier;

        // ===================================================================
        // 5. LOG DE DEPURAÇÃO
        // ===================================================================

        console.log('[ConvertTimeToReal] ✓ Conversão bem-sucedida:', {
            sensor: sensorIndex,
            entrada: timeValue,
            tipo: typeof timeValue,
            ms: timeMs,
            segundos: result,
            casas_decimais: decimals
        });

        // ===================================================================
        // 6. RETORNO DO VALOR CONVERTIDO
        // ===================================================================

        return result;
    }

    // ===========================================================================
    // REGISTRO DA FUNÇÃO NO FRAMEWORK TCHMI
    // ===========================================================================

    TcHmi.Functions.registerFunctionEx(
        'ConvertTimeToReal',           // Nome da função
        'TcHmi.Functions.HMI_Dark',    // Namespace do projeto
        ConvertTimeToReal              // Referência à função
    );

})(TcHmi);