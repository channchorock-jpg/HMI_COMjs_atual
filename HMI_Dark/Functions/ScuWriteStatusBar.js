// ScuWriteStatusBar.js
// Função para compor texto de status bar baseado em enum de estado da máquina (0-5)
// Projeto: HMI_Dark
// TwinCAT HMI TF2000 v1.12

(function (TcHmi) {
    TcHmi.Functions.registerFunctionEx(
        'ScuWriteStatusBar',
        'TcHmi.Functions.HMI_Dark',
        function ScuWriteStatusBar(eEstateMachine, sEstado, sModo) {

            // ==========================================
            // VALIDAÇÃO DE PARÂMETROS
            // ==========================================

            // Validar eEstateMachine: deve ser integer entre 0 e 5
            if (typeof eEstateMachine !== 'number' ||
                isNaN(eEstateMachine) ||
                eEstateMachine < 0 ||
                eEstateMachine > 5 ||
                !Number.isInteger(eEstateMachine)) {
                // Para funções síncronas, retornar string de erro
                return 'ERRO: Estado inválido';
            }

            // Validar sEstado: deve ser string não vazia
            if (typeof sEstado !== 'string' || sEstado.trim() === '') {
                return 'ERRO: Estado vazio';
            }

            // Validar sModo: deve ser string (pode ser vazia para estados 0/1)
            if (typeof sModo !== 'string') {
                return 'ERRO: Modo inválido';
            }

            // Para estados que usam sModo, validar se não está vazio
            if ((eEstateMachine === 2 || eEstateMachine === 3 ||
                 eEstateMachine === 4 || eEstateMachine === 5) &&
                sModo.trim() === '') {
                return 'ERRO: Modo vazio';
            }

            // ==========================================
            // LÓGICA DE COMPOSIÇÃO DO TEXTO
            // ==========================================

            var resultado = '';

            switch (eEstateMachine) {
                case 0: // EMERGENCY_ALERT
                case 1: // MANIFOLD_OFF
                    // Regra: Apenas o texto do estado
                    resultado = sEstado;
                    break;

                case 2: // STOPPED
                    // Regra: "Modo '[estado]' em '[modo]'"
                    resultado = "Modo '" + sEstado + "' em '" + sModo + "'";
                    break;

                case 3: // STATIC_MODE
                case 4: // DYNAMIC_MODE
                case 5: // TRANSITION_CHANGE
                    // Regra: "'[modo]' '[estado]'"
                    resultado = "'" + sModo + "' '" + sEstado + "'";
                    break;

                default:
                    resultado = 'ERRO: Estado não reconhecido';
                    break;
            }

            // ==========================================
            // RETORNO FINAL (direto, sem contexto)
            // ==========================================

            return resultado;
        }
    );
})(TcHmi);