// File: Functions/HMI_Dark/SwitchBoolByIndex.js
(function (TcHmi) {
    'use strict';

    // Namespace do projeto
    TcHmi = TcHmi || {};
    TcHmi.Functions = TcHmi.Functions || {};
    TcHmi.Functions.HMI_Dark = TcHmi.Functions.HMI_Dark || {};
    var NS = TcHmi.Functions.HMI_Dark;

    /**
     * Seleciona e lê/escreve em uma variável booleana baseado em um índice.
     * 
     * MODO LEITURA (newValue ausente):
     * - Retorna o valor booleano do símbolo selecionado pelo índice.
     * - Uso: Binding em ToggleState de TcHmiToggleButton ou TcHmiCheckbox.
     * 
     * MODO ESCRITA (newValue presente):
     * - Escreve o newValue no símbolo selecionado pelo índice.
     * - Uso: Ação no evento onToggleStateChanged.
     * 
     * @param {object} ctx Contexto do TwinCAT HMI (Return Value via ctx.success).
     * @param {number} index Índice para selecionar o booleano: 0=bool1, 1=bool2, 2=bool3, 3=bool4.
     * @param {object} bool1 Símbolo booleano 1 (obrigatório). Origem: símbolo de dado %s% ou %pp%, usar "Yes, pass symbol reference".
     * @param {object} bool2 Símbolo booleano 2 (obrigatório). Origem: símbolo de dado %s% ou %pp%, usar "Yes, pass symbol reference".
     * @param {object} bool3 Símbolo booleano 3 (opcional). Origem: símbolo de dado %s% ou %pp%, usar "Yes, pass symbol reference".
     * @param {object} bool4 Símbolo booleano 4 (opcional). Origem: símbolo de dado %s% ou %pp%, usar "Yes, pass symbol reference".
     * @param {boolean} newValue Novo valor a ser escrito (opcional). Se presente, função opera em modo ESCRITA.
     */
    function SwitchBoolByIndex(ctx, index, bool1, bool2, bool3, bool4, newValue) {
        try {
            // ========================================
            // 1) VALIDAÇÃO DE DEPENDÊNCIAS
            // ========================================
            
            // Verificar se a função utilitária existe
            if (typeof NS.getValueFromSymbolExpression !== 'function') {
                throw new Error('Função dependente HMI_Dark.getValueFromSymbolExpression não encontrada.');
            }

            // ========================================
            // 2) VALIDAÇÃO DE PARÂMETROS
            // ========================================
            
            // Validar índice
            if (typeof index !== 'number' || isNaN(index)) {
                throw new Error('Parâmetro "index" deve ser um número válido.');
            }

            // Arredondar índice para inteiro
            var idx = Math.floor(index);

            // Validar range do índice
            if (idx < 0 || idx > 3) {
                throw new Error('Índice fora do range válido (0-3). Recebido: ' + idx);
            }

            // Validar símbolos obrigatórios
            if (!bool1 || typeof bool1 !== 'object') {
                throw new Error('Parâmetro "bool1" é obrigatório e deve ser um símbolo de dado.');
            }

            if (!bool2 || typeof bool2 !== 'object') {
                throw new Error('Parâmetro "bool2" é obrigatório e deve ser um símbolo de dado.');
            }

            // ========================================
            // 3) SELEÇÃO DO SÍMBOLO BASEADO NO ÍNDICE
            // ========================================
            
            var boolArray = [bool1, bool2, bool3, bool4];
            var selectedBool = boolArray[idx];

            // Verificar se o símbolo selecionado existe
            if (!selectedBool || typeof selectedBool !== 'object') {
                throw new Error('Símbolo bool' + (idx + 1) + ' não foi fornecido. Índice ' + idx + ' inválido.');
            }

            // Extrair a expressão do símbolo
            var symbolExpression;
            try {
                symbolExpression = selectedBool.__symbol.__expression.__expression;
            } catch (e) {
                throw new Error('Símbolo bool' + (idx + 1) + ' não possui estrutura válida. Certifique-se de usar "Yes, pass symbol reference".');
            }

            if (!symbolExpression || typeof symbolExpression !== 'string') {
                throw new Error('Expressão do símbolo bool' + (idx + 1) + ' inválida.');
            }

            // ========================================
            // 4) DECIDIR ENTRE MODO LEITURA OU ESCRITA
            // ========================================
            
            var isWriteMode = (newValue !== undefined && newValue !== null);

            if (isWriteMode) {
                // ========================================
                // MODO ESCRITA: Escrever novo valor no símbolo
                // ========================================
                
                var valueToWrite = Boolean(newValue);

                TcHmi.Symbol.writeEx2(symbolExpression, valueToWrite, function (writeData) {
                    if (writeData.error !== TcHmi.Errors.NONE) {
                        var errorMsg = 'Erro ao escrever no símbolo bool' + (idx + 1) + ': ' + 
                                     TcHmi.Errors[writeData.error] || writeData.error;
                        ctx.error(errorMsg);
                    } else {
                        // Escrita bem-sucedida
                        ctx.success(true);
                    }
                });

            } else {
                // ========================================
                // MODO LEITURA: Ler valor do símbolo
                // ========================================
                
                TcHmi.Symbol.readEx2(symbolExpression, function (readData) {
                    if (readData.error !== TcHmi.Errors.NONE) {
                        var errorMsg = 'Erro ao ler o símbolo bool' + (idx + 1) + ': ' + 
                                     TcHmi.Errors[readData.error] || readData.error;
                        ctx.error(errorMsg);
                    } else {
                        // Garantir que o valor retornado seja booleano
                        var boolValue = Boolean(readData.value);
                        ctx.success(boolValue);
                    }
                });
            }

        } catch (err) {
            if (ctx && typeof ctx.error === 'function') {
                ctx.error(err && (err.message || String(err)));
            }
        }
    }

    // Registro global para uso em Actions & Conditions
    TcHmi.Functions.registerFunctionEx(
        'SwitchBoolByIndex',
        'TcHmi.Functions.HMI_Dark',
        SwitchBoolByIndex
    );

})(TcHmi);
