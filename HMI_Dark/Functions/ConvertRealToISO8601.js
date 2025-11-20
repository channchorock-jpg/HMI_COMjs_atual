/// Keep these lines for a best effort IntelliSense of Visual Studio 2017+
/// <reference path="../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />
// ===========================================================================
// Função: ConvertRealToISO8601
// Descrição: Converte valor REAL (segundos) para TIME (ISO 8601 Duration)
// Compatível com TwinCAT HMI Framework v1.12
// Namespace: TcHmi.Functions.HMI_Dark
// Versão: 2.0 - Namespace aninhado correto para compatibilidade
// ===========================================================================

(function (TcHmi) {
    var Functions;
    (function (Functions) {
        var HMI_Dark;
        (function (HMI_Dark) {

            /**
             * Converte um valor REAL (segundos) para formato TIME ISO 8601 Duration
             * @param {number} fRealValue - Valor em segundos (REAL)
             * @param {boolean} bIncludeMilliseconds - Incluir milissegundos no resultado (padrão: true)
             * @param {object} __context - Contexto de execução fornecido pelo framework
             * @returns {string|null} Valor no formato ISO 8601 Duration (ex: "PT3S", "PT1H30M45.5S") ou null em caso de erro
             */
            function ConvertRealToISO8601(fRealValue, bIncludeMilliseconds, __context) {

                // ===================================================================
                // 1. VALIDAÇÃO DE PARÂMETROS
                // ===================================================================

                // Verifica se fRealValue foi fornecido
                if (fRealValue === null || fRealValue === undefined) {
                    console.error('[ConvertRealToISO8601] Erro: fRealValue não fornecido ou é null/undefined.');
                    return null;
                }

                // Converte para número
                var realValue = parseFloat(fRealValue);

                // Valida se é um número válido
                if (isNaN(realValue)) {
                    console.error('[ConvertRealToISO8601] Erro: fRealValue não é um número válido. Recebido:', fRealValue);
                    return null;
                }

                // Valida se é valor não-negativo (TIME no PLC é sempre >= 0)
                if (realValue < 0) {
                    console.warn('[ConvertRealToISO8601] Aviso: Valor negativo detectado. Usando valor absoluto.');
                    realValue = Math.abs(realValue);
                }

                // Define se deve incluir milissegundos (padrão: true)
                var includeMs = (bIncludeMilliseconds !== null && bIncludeMilliseconds !== undefined)
                                ? Boolean(bIncludeMilliseconds)
                                : true;

                // ===================================================================
                // 2. CONVERSÃO REAL → ISO 8601 DURATION
                // ===================================================================

                // Converte segundos para milissegundos totais
                var totalMs = Math.round(realValue * 1000);

                // Calcula componentes de tempo
                var hours = Math.floor(totalMs / 3600000);        // 1h = 3600000ms
                var remainingMs = totalMs % 3600000;

                var minutes = Math.floor(remainingMs / 60000);    // 1m = 60000ms
                remainingMs = remainingMs % 60000;

                var seconds = Math.floor(remainingMs / 1000);     // 1s = 1000ms
                var milliseconds = remainingMs % 1000;

                // ===================================================================
                // 3. FORMATAÇÃO ISO 8601 DURATION
                // ===================================================================

                var iso8601String = "PT"; // Sempre começa com "PT" (Period Time)

                // Adiciona horas se existirem
                if (hours > 0) {
                    iso8601String += hours + "H";
                }

                // Adiciona minutos se existirem
                if (minutes > 0) {
                    iso8601String += minutes + "M";
                }

                // Adiciona segundos e milissegundos
                if (includeMs && milliseconds > 0) {
                    // Formato com milissegundos: PT3.500S (3 segundos e 500ms)
                    var secondsWithMs = seconds + (milliseconds / 1000);
                    if (secondsWithMs > 0 || (hours === 0 && minutes === 0)) {
                        iso8601String += secondsWithMs + "S";
                    }
                } else {
                    // Formato sem milissegundos: PT3S
                    if (seconds > 0 || (hours === 0 && minutes === 0)) {
                        iso8601String += seconds + "S";
                    }
                }

                // Caso especial: valor zero
                if (iso8601String === "PT") {
                    iso8601String = "PT0S";
                }

                // ===================================================================
                // 4. LOG DE DEPURAÇÃO
                // ===================================================================

                console.log('[ConvertRealToISO8601] ✓ Conversão bem-sucedida:', {
                    entrada_segundos: realValue,
                    total_ms: totalMs,
                    componentes: {
                        horas: hours,
                        minutos: minutes,
                        segundos: seconds,
                        milissegundos: milliseconds
                    },
                    resultado_iso8601: iso8601String,
                    incluir_ms: includeMs
                });

                // ===================================================================
                // 5. RETORNO DO VALOR CONVERTIDO
                // ===================================================================

                return iso8601String;
            }

            // Exporta a função para o namespace
            HMI_Dark.ConvertRealToISO8601 = ConvertRealToISO8601;

        })(HMI_Dark = Functions.HMI_Dark || (Functions.HMI_Dark = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);