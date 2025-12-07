// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />

/*
 * ScuWriteStatusWithMode
 * ======================
 * Função para compor dinamicamente o texto da status bar baseado no estado da máquina de estados (state machine)
 * e no sensor ativo, utilizando nomes de sensores fornecidos como parâmetros.
 *
 * OBJETIVO:
 * Centralizar a lógica de composição de mensagens de status, eliminando a necessidade de construir
 * strings manualmente em cada contexto. Suporta até 4 sensores diferentes e 6 estados distintos da máquina.
 *
 * PARÂMETROS:
 * - eEstateMachine: enum do estado da máquina (0-5)
 *     0 = EMERGENCY_ALERT   → Retorna: "EMERGÊNCIA ATIVA"
 *     1 = MANIFOLD_OFF      → Retorna: "MANIFOLD OFF"
 *     2 = STOPPED           → Retorna: "MANIFOLD LOW [nome do sensor ativo]"
 *     3 = STATIC_MODE       → Retorna: "[nome do sensor ativo] ESTÁTICO"
 *     4 = DYNAMIC_MODE      → Retorna: "[nome do sensor ativo] DINÂMICO"
 *     5 = TRANSITION_CHANGE → Retorna: "[nome do sensor ativo] TRANSIÇÃO"
 *
 * - iSensorActive: índice do sensor ativo (1-4, indexação 1-based)
 *     1 = Primeiro sensor  (usa sSensorName0)
 *     2 = Segundo sensor   (usa sSensorName1)
 *     3 = Terceiro sensor  (usa sSensorName2)
 *     4 = Quarto sensor    (usa sSensorName3)
 *
 * - sSensorName0: nome do primeiro sensor (obrigatório, ex: "DESLOCAMENTO")
 * - sSensorName1: nome do segundo sensor (obrigatório, ex: "FORÇA")
 * - sSensorName2: nome do terceiro sensor (opcional, pode ser null)
 * - sSensorName3: nome do quarto sensor (opcional, pode ser null)
 *
 * RETORNO:
 * String com o texto formatado da status bar, ou mensagem de erro se parâmetros inválidos.
 *
 * VALIDAÇÕES:
 * - eEstateMachine: deve ser inteiro entre 0 e 5
 * - iSensorActive: deve ser inteiro entre 1 e 4
 * - sSensorName0 e sSensorName1: obrigatórios e não vazios
 * - sSensorName2 e sSensorName3: opcionais, mas se fornecidos devem ser strings válidas
 * - Para estados 2-5: valida se o sensor ativo tem nome definido
 *
 * EXEMPLOS DE USO:
 *
 * Exemplo 1 - Modo Estático com sensor DESLOCAMENTO:
 * TcHmi.Functions.HMI_Dark.ScuWriteStatusWithMode(
 *     3,                                           // eEstateMachine (STATIC_MODE)
 *     1,                                           // iSensorActive (primeiro sensor)
 *     "DESLOCAMENTO",                              // sSensorName0
 *     "FORÇA",                                     // sSensorName1
 *     null,                                        // sSensorName2 (opcional)
 *     null                                         // sSensorName3 (opcional)
 * )
 * // Retorna: "DESLOCAMENTO ESTÁTICO"
 *
 * Exemplo 2 - Manifold Low com sensor DESLOCAMENTO:
 * TcHmi.Functions.HMI_Dark.ScuWriteStatusWithMode(
 *     2,                                           // eEstateMachine (STOPPED)
 *     1,                                           // iSensorActive (primeiro sensor)
 *     "DESLOCAMENTO",                              // sSensorName0
 *     "FORÇA",                                     // sSensorName1
 *     null,                                        // sSensorName2 (opcional)
 *     null                                         // sSensorName3 (opcional)
 * )
 * // Retorna: "MANIFOLD LOW DESLOCAMENTO"
 *
 * Exemplo 3 - Emergência (não depende do sensor):
 * TcHmi.Functions.HMI_Dark.ScuWriteStatusWithMode(
 *     0,                                           // eEstateMachine (EMERGENCY_ALERT)
 *     1,                                           // iSensorActive (ignorado neste estado)
 *     "DESLOCAMENTO",                              // sSensorName0
 *     "FORÇA",                                     // sSensorName1
 *     null,                                        // sSensorName2 (opcional)
 *     null                                         // sSensorName3 (opcional)
 * )
 * // Retorna: "EMERGÊNCIA ATIVA"
 *
 * Exemplo 4 - Com binding de símbolos PLC (uso no Editor):
 * TcHmi.Functions.HMI_Dark.ScuWriteStatusWithMode(
 *     %s%PLC1.MAIN.eCurrentState%/s%,              // eEstateMachine (bindable)
 *     %s%PLC1.MAIN.iActiveSensor%/s%,              // iSensorActive (bindable)
 *     %s%PLC1.MAIN.stSensors[0].sName%/s%,         // sSensorName0 (bindable)
 *     %s%PLC1.MAIN.stSensors[1].sName%/s%,         // sSensorName1 (bindable)
 *     %s%PLC1.MAIN.stSensors[2].sName%/s%,         // sSensorName2 (bindable)
 *     %s%PLC1.MAIN.stSensors[3].sName%/s%          // sSensorName3 (bindable)
 * )
 *
 * OBSERVAÇÕES:
 * - Todos os parâmetros são bindáveis (podem receber símbolos PLC ou valores de controles)
 * - A função é síncrona (retorno imediato)
 * - Logs de debug são gerados no console para facilitar troubleshooting
 * - Estados 0 e 1 retornam mensagens fixas (não utilizam o nome do sensor)
 * - Estados 2-5 compõem a mensagem dinamicamente com o nome do sensor ativo
 *
 * Projeto: HMI_Dark
 * TwinCAT HMI TF2000 v1.12
 * Versão: 1.0.0
 */

(function (TcHmi) {
    TcHmi.Functions.registerFunctionEx(
        'ScuWriteStatusWithMode',
        'TcHmi.Functions.HMI_Dark',
        function ScuWriteStatusWithMode(eEstateMachine, iSensorActive, sSensorName0, sSensorName1, sSensorName2, sSensorName3) {

            // ==========================================
            // VALIDAÇÃO DE PARÂMETROS
            // ==========================================

            // Validar eEstateMachine: deve ser integer entre 0 e 5
            if (typeof eEstateMachine !== 'number' ||
                isNaN(eEstateMachine) ||
                eEstateMachine < 0 ||
                eEstateMachine > 5 ||
                !Number.isInteger(eEstateMachine)) {
                console.error('[ScuWriteStatusWithMode] Erro: Estado da máquina inválido:', eEstateMachine);
                return 'ERRO: Estado inválido';
            }

            // Validar iSensorActive: deve ser integer entre 1 e 4
            // (1 = primeiro sensor, 2 = segundo, etc.)
            if (typeof iSensorActive !== 'number' ||
                isNaN(iSensorActive) ||
                iSensorActive < 1 ||
                iSensorActive > 4 ||
                !Number.isInteger(iSensorActive)) {
                console.error('[ScuWriteStatusWithMode] Erro: Índice de sensor ativo inválido (deve ser 1-4):', iSensorActive);
                return 'ERRO: Sensor inválido';
            }

            // Validar sSensorName0: obrigatório
            if (typeof sSensorName0 !== 'string' || sSensorName0.trim() === '') {
                console.error('[ScuWriteStatusWithMode] Erro: Nome do sensor 0 inválido ou vazio');
                return 'ERRO: Sensor 0 vazio';
            }

            // Validar sSensorName1: obrigatório
            if (typeof sSensorName1 !== 'string' || sSensorName1.trim() === '') {
                console.error('[ScuWriteStatusWithMode] Erro: Nome do sensor 1 inválido ou vazio');
                return 'ERRO: Sensor 1 vazio';
            }

            // Validar sSensorName2 e sSensorName3: opcional, mas se fornecido deve ser string
            if (sSensorName2 !== null && sSensorName2 !== undefined && typeof sSensorName2 !== 'string') {
                console.error('[ScuWriteStatusWithMode] Erro: Nome do sensor 2 deve ser string ou null');
                return 'ERRO: Sensor 2 inválido';
            }

            if (sSensorName3 !== null && sSensorName3 !== undefined && typeof sSensorName3 !== 'string') {
                console.error('[ScuWriteStatusWithMode] Erro: Nome do sensor 3 deve ser string ou null');
                return 'ERRO: Sensor 3 inválido';
            }

            // ==========================================
            // SELEÇÃO DO NOME DO SENSOR ATIVO
            // ==========================================

            // Array de nomes dos sensores (índices 0-3)
            var sensorNames = [
                sSensorName0,
                sSensorName1,
                sSensorName2 || '',  // Se null/undefined, usa string vazia
                sSensorName3 || ''
            ];

            // iSensorActive é 1-based (1, 2, 3, 4), então subtraímos 1 para obter o índice do array
            var activeSensorName = sensorNames[iSensorActive - 1];

            // Verificar se o sensor ativo tem um nome válido
            // (necessário apenas para estados que usam o nome do sensor)
            if ((eEstateMachine === 2 || eEstateMachine === 3 ||
                 eEstateMachine === 4 || eEstateMachine === 5) &&
                (!activeSensorName || activeSensorName.trim() === '')) {
                console.error('[ScuWriteStatusWithMode] Erro: Sensor ativo não tem nome definido. iSensorActive:', iSensorActive);
                return 'ERRO: Sensor ativo sem nome';
            }

            // ==========================================
            // LÓGICA DE COMPOSIÇÃO DO TEXTO
            // ==========================================

            var resultado = '';

            switch (eEstateMachine) {
                case 0: // EMERGENCY_ALERT
                    // Regra: Texto fixo de emergência
                    resultado = 'EMERGÊNCIA ATIVA';
                    break;

                case 1: // MANIFOLD_OFF
                    // Regra: Texto fixo de manifold desligado
                    resultado = 'MANIFOLD OFF';
                    break;

                case 2: // STOPPED (MANIFOLD LOW)
                    // Regra: "MANIFOLD LOW" + nome do sensor ativo
                    // Exemplo: "MANIFOLD LOW DESLOCAMENTO"
                    resultado = 'MANIFOLD LOW ' + activeSensorName.trim();
                    break;

                case 3: // STATIC_MODE
                    // Regra: nome do sensor ativo + "ESTÁTICO"
                    // Exemplo: "DESLOCAMENTO ESTÁTICO"
                    resultado = activeSensorName.trim() + ' ESTÁTICO';
                    break;

                case 4: // DYNAMIC_MODE
                    // Regra: nome do sensor ativo + "DINÂMICO"
                    // Exemplo: "DESLOCAMENTO DINÂMICO"
                    resultado = activeSensorName.trim() + ' DINÂMICO';
                    break;

                case 5: // TRANSITION_CHANGE
                    // Regra: nome do sensor ativo + "TRANSIÇÃO"
                    // Exemplo: "DESLOCAMENTO TRANSIÇÃO"
                    resultado = activeSensorName.trim() + ' TRANSIÇÃO';
                    break;

                default:
                    resultado = 'ERRO: Estado não reconhecido';
                    break;
            }

            // ==========================================
            // LOG E RETORNO
            // ==========================================

            // Log para debug (pode ser removido em produção)
            console.log('[ScuWriteStatusWithMode] Estado:', eEstateMachine,
                       '| Sensor Ativo:', iSensorActive,
                       '| Resultado:', resultado);

            return resultado;
        }
    );
})(TcHmi);
