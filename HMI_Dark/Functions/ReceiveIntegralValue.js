/// Keep these lines for a best effort IntelliSense of Visual Studio 2017+
/// <reference path="../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />
// ===========================================================================
// Função: ReceiveIntegralValue
// Descrição: Calcula o ganho integral (IntGain = 1/Valor) a partir de valores TIME
// Compatível com TwinCAT HMI Framework v1.12
// Namespace: TcHmi.Functions.HMI_Dark
// Versão: 1.1 - Retorna 0 quando TIME = 0 (ao invés de erro de divisão por zero)
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
        // 2. CONVERSÃO TIME → REAL USANDO ConvertTimeToReal
        // ===================================================================

        // Chama a função ConvertTimeToReal existente para converter o valor TIME
        // Usa 6 casas decimais para maior precisão na conversão intermediária
        var convertedValue = TcHmi.Functions.HMI_Dark.ConvertTimeToReal(
            iSensorShow,
            timeValue0,
            timeValue1,
            6  // Precisão intermediária de 6 casas decimais
        );

        // Verifica se a conversão foi bem-sucedida
        if (convertedValue === null || convertedValue === undefined) {
            console.error('[ReceiveIntegralValue] Erro: ConvertTimeToReal retornou null/undefined.');
            return null;
        }

        console.log('[ReceiveIntegralValue] Valor convertido (segundos):', convertedValue);

        // ===================================================================
        // 3. VALIDAÇÃO DO VALOR CONVERTIDO
        // ===================================================================

        // Verifica se o valor convertido é um número válido
        if (isNaN(convertedValue)) {
            console.error('[ReceiveIntegralValue] Erro: Valor convertido é NaN.');
            return null;
        }

        // Verifica divisão por zero - retorna 0 quando TIME = 0
        if (convertedValue === 0) {
            console.log('[ReceiveIntegralValue] Valor convertido é zero. Retornando IntGain = 0.');
            return 0;
        }

        // Valida se o valor é positivo (TIME deve ser sempre positivo)
        if (convertedValue < 0) {
            console.warn('[ReceiveIntegralValue] Aviso: Valor convertido é negativo. Usando valor absoluto.');
            convertedValue = Math.abs(convertedValue);
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
            sensor: iSensorShow,
            timeValue0: timeValue0,
            timeValue1: timeValue1,
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
