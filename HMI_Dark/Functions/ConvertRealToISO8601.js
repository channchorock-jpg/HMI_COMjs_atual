/// Keep these lines for a best effort IntelliSense of Visual Studio 2017+
/// <reference path="../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />
// ===========================================================================
// Função: ConvertRealToISO8601
// Descrição: Converte valor REAL (segundos) para TIME ISO 8601 Duration
// Compatível com TwinCAT HMI Framework v1.12
// Namespace: TcHmi.Functions.HMI_Dark
// Versão: 1.0 - Conversão REAL → ISO 8601
// ===========================================================================

(function (TcHmi) {
    /**
     * Converte um valor REAL (segundos) para formato ISO 8601 Duration
     * @param {number} realValue - Valor REAL em segundos (pode ter decimais)
     * @param {boolean} includeMilliseconds - Se true, inclui milissegundos no resultado (padrão: false)
     * @param {boolean} compactFormat - Se true, omite componentes zero (padrão: true)
     * @param {object} __context - Contexto de execução fornecido pelo framework
     * @returns {string|null} String ISO 8601 Duration (ex: "PT3S", "PT1M30S") ou null em caso de erro
     */
    function ConvertRealToISO8601(realValue, includeMilliseconds, compactFormat, __context) {

        // ===================================================================
        // 1. VALIDAÇÃO DE PARÂMETROS
        // ===================================================================

        // Verifica se realValue foi fornecido
        if (realValue === null || realValue === undefined) {
            console.error('[ConvertRealToISO8601] Erro: realValue não fornecido ou é null/undefined.');
            return null;
        }

        // Converte para número se for string
        var seconds = 0;
        if (typeof realValue === 'string') {
            seconds = parseFloat(realValue);
            console.log('[ConvertRealToISO8601] Convertendo string para número:', realValue, '→', seconds);
        } else if (typeof realValue === 'number') {
            seconds = realValue;
        } else {
            console.error('[ConvertRealToISO8601] Erro: Tipo de dado não suportado:', typeof realValue);
            return null;
        }

        // Valida se é um número válido
        if (isNaN(seconds)) {
            console.error('[ConvertRealToISO8601] Erro: realValue não é um número válido. Recebido:', realValue);
            return null;
        }

        // Valida se é valor não-negativo (TIME no PLC é sempre >= 0)
        if (seconds < 0) {
            console.warn('[ConvertRealToISO8601] Aviso: realValue negativo detectado. Usando valor absoluto.');
            seconds = Math.abs(seconds);
        }

        // Define opções de formatação
        var includeMs = (includeMilliseconds === true);
        var compact = (compactFormat !== false); // Padrão é true

        // ===================================================================
        // 2. CONVERSÃO REAL → COMPONENTES DE TEMPO
        // ===================================================================

        var totalSeconds = seconds;
        var hours = 0;
        var minutes = 0;
        var secs = 0;
        var milliseconds = 0;

        // Extrai horas
        if (totalSeconds >= 3600) {
            hours = Math.floor(totalSeconds / 3600);
            totalSeconds -= hours * 3600;
        }

        // Extrai minutos
        if (totalSeconds >= 60) {
            minutes = Math.floor(totalSeconds / 60);
            totalSeconds -= minutes * 60;
        }

        // Restante são segundos
        if (includeMs) {
            // Separa segundos inteiros e milissegundos
            secs = Math.floor(totalSeconds);
            milliseconds = Math.round((totalSeconds - secs) * 1000);

            // Se milissegundos arredondou para 1000, ajusta
            if (milliseconds >= 1000) {
                secs += 1;
                milliseconds = 0;
            }
        } else {
            // Arredonda para segundos completos
            secs = Math.round(totalSeconds * 10) / 10; // Mantém 1 casa decimal
        }

        // ===================================================================
        // 3. CONSTRUÇÃO DA STRING ISO 8601 DURATION
        // ===================================================================

        // Formato ISO 8601 Duration: PT[hH][mM][s.sS][msMS]
        // Exemplos:
        // PT3S = 3 segundos
        // PT1M30S = 1 minuto e 30 segundos
        // PT2H = 2 horas
        // PT1H30M45.5S = 1h 30min 45.5s
        // PT500MS = 500 milissegundos

        var result = 'PT';

        if (compact) {
            // ---------------------------------------------------------------
            // MODO COMPACTO - Omite componentes zero
            // ---------------------------------------------------------------

            if (hours > 0) {
                result += hours + 'H';
            }

            if (minutes > 0) {
                result += minutes + 'M';
            }

            if (includeMs) {
                // Com milissegundos separados
                if (secs > 0) {
                    result += secs + 'S';
                }
                if (milliseconds > 0) {
                    result += milliseconds + 'MS';
                }

                // Caso especial: se tudo for zero, retorna PT0S
                if (hours === 0 && minutes === 0 && secs === 0 && milliseconds === 0) {
                    result = 'PT0S';
                }
            } else {
                // Segundos com decimais
                if (secs > 0 || (hours === 0 && minutes === 0)) {
                    // Remove zeros desnecessários após ponto decimal
                    var secsStr = secs.toString();
                    if (secsStr.indexOf('.') !== -1) {
                        secsStr = secsStr.replace(/\.?0+$/, '');
                    }
                    result += secsStr + 'S';
                }
            }

        } else {
            // ---------------------------------------------------------------
            // MODO COMPLETO - Sempre mostra horas, minutos e segundos
            // ---------------------------------------------------------------

            result += hours + 'H';
            result += minutes + 'M';

            if (includeMs) {
                result += secs + 'S';
                if (milliseconds > 0) {
                    result += milliseconds + 'MS';
                }
            } else {
                var secsStr = secs.toString();
                if (secsStr.indexOf('.') !== -1) {
                    secsStr = secsStr.replace(/\.?0+$/, '');
                }
                result += secsStr + 'S';
            }
        }

        // ===================================================================
        // 4. LOG DE DEPURAÇÃO
        // ===================================================================

        console.log('[ConvertRealToISO8601] ✓ Conversão bem-sucedida:', {
            entrada_segundos: seconds,
            horas: hours,
            minutos: minutes,
            segundos: secs,
            milissegundos: milliseconds,
            formato_compacto: compact,
            incluir_ms: includeMs,
            resultado: result
        });

        // ===================================================================
        // 5. RETORNO DA STRING ISO 8601
        // ===================================================================

        return result;
    }

    // ===========================================================================
    // REGISTRO DA FUNÇÃO NO FRAMEWORK TCHMI
    // ===========================================================================

    TcHmi.Functions.registerFunctionEx(
        'ConvertRealToISO8601',        // Nome da função
        'TcHmi.Functions.HMI_Dark',    // Namespace do projeto
        ConvertRealToISO8601           // Referência à função
    );

})(TcHmi);
