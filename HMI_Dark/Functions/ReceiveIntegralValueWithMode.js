/// Keep these lines for a best effort IntelliSense of Visual Studio 2017+
/// <reference path="../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />
// ===========================================================================
// Função: ReceiveIntegralValueWithMode
// Descrição: Calcula o ganho integral (IntGain = 1/Valor) a partir de valores TIME
//            com seleção de modo STATIC ou DYNAMIC via enum eStateBind
// Compatível com TwinCAT HMI Framework v1.12
// Namespace: TcHmi.Functions.HMI_Dark
// Versão: 1.0 - Implementa enum eStateBind para seleção STATIC_MODE/DYNAMIC_MODE
// ===========================================================================

(function (TcHmi) {
    /**
     * Calcula o ganho integral (IntGain) a partir de valores TIME de sensores
     * com seleção de modo STATIC ou DYNAMIC
     * @param {number} eStateBind - Modo de operação (3 = STATIC_MODE, 4 = DYNAMIC_MODE)
     * @param {number} iSensorShow - Índice do sensor a exibir (0 ou 1)
     * @param {number|string} VStatic0 - Valor TIME do sensor 0 STATIC em milissegundos ou ISO 8601
     * @param {number|string} VStatic1 - Valor TIME do sensor 1 STATIC em milissegundos ou ISO 8601
     * @param {number|string} VDyn0 - Valor TIME do sensor 0 DYNAMIC em milissegundos ou ISO 8601
     * @param {number|string} VDyn1 - Valor TIME do sensor 1 DYNAMIC em milissegundos ou ISO 8601
     * @param {number} decimalPlaces - Número de casas decimais no resultado (padrão: 6)
     * @param {object} __context - Contexto de execução fornecido pelo framework
     * @returns {number|null} Ganho integral (IntGain), 0 quando TIME=0, ou null em caso de erro
     */
    function ReceiveIntegralValueWithMode(eStateBind, iSensorShow, VStatic0, VStatic1, VDyn0, VDyn1, decimalPlaces) {

        // ===================================================================
        // 1. VALIDAÇÃO DE PARÂMETROS
        // ===================================================================

        console.log('[ReceiveIntegralValueWithMode] Iniciando cálculo de ganho integral...', {
            eStateBind: eStateBind,
            iSensorShow: iSensorShow,
            VStatic0: VStatic0,
            VStatic1: VStatic1,
            VDyn0: VDyn0,
            VDyn1: VDyn1,
            decimalPlaces: decimalPlaces
        });

        // Valida eStateBind (3 = STATIC_MODE, 4 = DYNAMIC_MODE)
        var stateMode = (eStateBind !== null && eStateBind !== undefined)
                        ? parseInt(eStateBind, 10)
                        : 3; // Default: STATIC_MODE

        if (isNaN(stateMode)) {
            console.warn('[ReceiveIntegralValueWithMode] Aviso: eStateBind inválido. Usando STATIC_MODE (3).');
            stateMode = 3;
        }

        // ===================================================================
        // 2. SELEÇÃO DO MODO E SENSOR
        // ===================================================================

        // Valida iSensorShow
        var sensorIndex = (iSensorShow !== null && iSensorShow !== undefined)
                          ? parseInt(iSensorShow, 10)
                          : 0;

        if (isNaN(sensorIndex)) {
            console.warn('[ReceiveIntegralValueWithMode] Aviso: iSensorShow inválido. Usando padrão 0.');
            sensorIndex = 0;
        }

        // Seleciona o timeValue baseado no modo e índice do sensor
        var timeValue = null;
        var modeName = '';

        if (stateMode === 3) {
            // STATIC_MODE
            modeName = 'STATIC_MODE';
            switch (sensorIndex) {
                case 0:
                    timeValue = VStatic0;
                    console.log('[ReceiveIntegralValueWithMode] STATIC_MODE: Sensor 0 selecionado (VStatic0)');
                    break;

                case 1:
                    timeValue = VStatic1;
                    console.log('[ReceiveIntegralValueWithMode] STATIC_MODE: Sensor 1 selecionado (VStatic1)');
                    break;

                default:
                    console.warn('[ReceiveIntegralValueWithMode] Aviso: iSensorShow fora do intervalo (0-1). Usando sensor 0.');
                    timeValue = VStatic0;
                    sensorIndex = 0;
                    break;
            }

            // Valida se pelo menos um dos valores STATIC foi fornecido
            if ((VStatic0 === null || VStatic0 === undefined) &&
                (VStatic1 === null || VStatic1 === undefined)) {
                console.error('[ReceiveIntegralValueWithMode] Erro: Nenhum valor TIME STATIC fornecido (VStatic0 e VStatic1 são null/undefined).');
                return null;
            }

        } else if (stateMode === 4) {
            // DYNAMIC_MODE
            modeName = 'DYNAMIC_MODE';
            switch (sensorIndex) {
                case 0:
                    timeValue = VDyn0;
                    console.log('[ReceiveIntegralValueWithMode] DYNAMIC_MODE: Sensor 0 selecionado (VDyn0)');
                    break;

                case 1:
                    timeValue = VDyn1;
                    console.log('[ReceiveIntegralValueWithMode] DYNAMIC_MODE: Sensor 1 selecionado (VDyn1)');
                    break;

                default:
                    console.warn('[ReceiveIntegralValueWithMode] Aviso: iSensorShow fora do intervalo (0-1). Usando sensor 0.');
                    timeValue = VDyn0;
                    sensorIndex = 0;
                    break;
            }

            // Valida se pelo menos um dos valores DYNAMIC foi fornecido
            if ((VDyn0 === null || VDyn0 === undefined) &&
                (VDyn1 === null || VDyn1 === undefined)) {
                console.error('[ReceiveIntegralValueWithMode] Erro: Nenhum valor TIME DYNAMIC fornecido (VDyn0 e VDyn1 são null/undefined).');
                return null;
            }

        } else {
            console.error('[ReceiveIntegralValueWithMode] Erro: eStateBind inválido. Use 3 (STATIC_MODE) ou 4 (DYNAMIC_MODE).');
            return null;
        }

        // Verifica se timeValue foi fornecido
        if (timeValue === null || timeValue === undefined) {
            console.error('[ReceiveIntegralValueWithMode] Erro: timeValue do sensor', sensorIndex, 'não fornecido ou é null/undefined.');
            return null;
        }

        var timeMs = 0; // Valor em milissegundos (será calculado)

        // ===================================================================
        // 3. CONVERSÃO TIME → REAL (MILISSEGUNDOS)
        // ===================================================================

        // Detecção e conversão de formato
        if (typeof timeValue === 'string') {
            // FORMATO ISO 8601 DURATION (ex: "PT3S", "PT1M30S", "PT500MS")
            console.log('[ReceiveIntegralValueWithMode] Detectado formato STRING:', timeValue);

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

                console.log('[ReceiveIntegralValueWithMode] Parse ISO 8601:', {
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
                    console.error('[ReceiveIntegralValueWithMode] Erro: Formato de string inválido. Recebido:', timeValue);
                    console.error('[ReceiveIntegralValueWithMode] Formatos aceitos: PT3S, PT5M, PT1H30M, PT500MS, ou número');
                    return null;
                }
            }

        } else if (typeof timeValue === 'number') {
            // FORMATO NUMÉRICO (milissegundos diretos)
            timeMs = timeValue;
            console.log('[ReceiveIntegralValueWithMode] Detectado formato NUMBER:', timeMs, 'ms');

        } else {
            console.error('[ReceiveIntegralValueWithMode] Erro: Tipo de dado não suportado:', typeof timeValue);
            return null;
        }

        // Valida se é um número válido após conversão
        if (isNaN(timeMs)) {
            console.error('[ReceiveIntegralValueWithMode] Erro: Conversão resultou em NaN. Valor original:', timeValue);
            return null;
        }

        // Valida se é valor não-negativo (TIME no PLC é sempre >= 0)
        if (timeMs < 0) {
            console.warn('[ReceiveIntegralValueWithMode] Aviso: timeValue negativo detectado. Usando valor absoluto.');
            timeMs = Math.abs(timeMs);
        }

        // Conversão TIME → REAL (milissegundos → segundos)
        var convertedValue = timeMs / 1000.0;

        console.log('[ReceiveIntegralValueWithMode] Valor convertido (segundos):', convertedValue);

        // ===================================================================
        // 4. VALIDAÇÃO ANTES DO CÁLCULO
        // ===================================================================

        // Verifica divisão por zero - retorna 0 quando TIME = 0
        if (convertedValue === 0) {
            console.log('[ReceiveIntegralValueWithMode] Valor convertido é zero. Retornando IntGain = 0.');
            return 0;
        }

        // ===================================================================
        // 5. CÁLCULO DO GANHO INTEGRAL
        // ===================================================================

        // Fórmula: IntGain = 1 / Valor convertido
        var intGain = 1.0 / convertedValue;

        console.log('[ReceiveIntegralValueWithMode] IntGain calculado (sem arredondamento):', intGain);

        // ===================================================================
        // 6. FORMATAÇÃO DO RESULTADO
        // ===================================================================

        // Define número de casas decimais (padrão 6)
        var decimals = (decimalPlaces !== null && decimalPlaces !== undefined)
                       ? parseInt(decimalPlaces, 10)
                       : 6;

        // Valida casas decimais (0-10)
        if (isNaN(decimals) || decimals < 0 || decimals > 10) {
            console.warn('[ReceiveIntegralValueWithMode] Casas decimais inválidas. Usando padrão 6.');
            decimals = 6;
        }

        // Arredonda para o número de casas decimais especificado
        var multiplier = Math.pow(10, decimals);
        var result = Math.round(intGain * multiplier) / multiplier;

        // ===================================================================
        // 7. LOG DE DEPURAÇÃO E RETORNO
        // ===================================================================

        console.log('[ReceiveIntegralValueWithMode] ✓ Cálculo bem-sucedido:', {
            modo: modeName,
            eStateBind: stateMode,
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
        'ReceiveIntegralValueWithMode',        // Nome da função
        'TcHmi.Functions.HMI_Dark',            // Namespace do projeto
        ReceiveIntegralValueWithMode           // Referência à função
    );

})(TcHmi);
