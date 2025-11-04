// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />
// ========================================================
// Função: WriteRealToSymbol
// Descrição: Escreve um valor do tipo REAL em um símbolo do servidor PLC
// Namespace: TcHmi.Functions.HMI_Dark
// Autor: Desenvolvedor TwinCAT HMI
// Versão: 1.0.0 (TwinCAT HMI 1.12)
// ========================================================

(function (TcHmi) {

    /**
     * Escreve um valor REAL (número) em um símbolo do servidor PLC
     * @param {number} realValue - Valor numérico a ser escrito (tipo REAL)
     * @param {string} symbolName - Nome completo do símbolo (ex: "GVL.rSetpoint")
     * @param {object} __context - Contexto de execução fornecido pelo TwinCAT HMI (obrigatório)
     */
    function WriteRealToSymbol(ctx, realValue, symbolName) {

        // ===================================
        // 1. VALIDAÇÃO DE PARÂMETROS
        // ===================================

        // Verificar se o contexto foi fornecido
       

        // Verificar se o valor é um número válido
        if (typeof realValue !== 'number' || isNaN(realValue)) {
            console.error('[WriteRealToSymbol] Erro: O valor fornecido não é um número válido.', realValue);
            return;
        }

        // Verificar se o nome do símbolo foi fornecido
        if (!symbolName || typeof symbolName !== 'string' || symbolName.trim() === '') {
            console.error('[WriteRealToSymbol] Erro: Nome do símbolo inválido ou vazio.', symbolName);
            return;
        }

        // ===================================
        // 2. PREPARAR DADOS PARA ESCRITA
        // ===================================

        // Normalizar o nome do símbolo (remover espaços extras)
        var normalizedSymbolName = symbolName;

        // Log de início de operação
        console.log('[WriteRealToSymbol] Iniciando escrita no símbolo: ' + normalizedSymbolName);
        console.log('[WriteRealToSymbol] Valor a ser escrito: ' + realValue);

        // ===================================
        // 3. EXECUTAR ESCRITA NO SÍMBOLO
        // ===================================

        // Usar writeEx2 para escrita assíncrona no servidor
        TcHmi.Symbol.writeEx2(
            normalizedSymbolName,  // Nome do símbolo
            realValue,             // Valor a ser escrito
            function (data) {      // Callback de sucesso/erro

                // Verificar se a escrita foi bem-sucedida
                if (data.error === TcHmi.Errors.NONE) {
                    // Sucesso
                    console.log('[WriteRealToSymbol] ✓ Escrita realizada com sucesso!');
                    console.log('[WriteRealToSymbol] Símbolo: ' + normalizedSymbolName);
                    console.log('[WriteRealToSymbol] Valor escrito: ' + realValue);
                } else {
                    // Erro na escrita
                    console.error('[WriteRealToSymbol] ✗ Erro ao escrever no símbolo.');
                    console.error('[WriteRealToSymbol] Código do erro: ' + data.error);
                    console.error('[WriteRealToSymbol] Símbolo: ' + normalizedSymbolName);
                    console.error('[WriteRealToSymbol] Valor tentado: ' + realValue);
                }
            }
        );

        // ===================================
        // 4. OBSERVAÇÕES IMPORTANTES
        // ===================================

        // - A escrita é ASSÍNCRONA: o retorno ocorre no callback
        // - O símbolo deve existir no servidor PLC e estar configurado
        // - Certifique-se de que o símbolo aceita escrita (não é somente leitura)
        // - Para símbolos de servidor externo, use o prefixo correto (ex: "PLC1.GVL.rSetpoint")
    }

    // ===================================
    // 5. REGISTRO DA FUNÇÃO NO SISTEMA
    // ===================================

    // Registrar a função no namespace especificado
    // Nome interno: WriteRealToSymbol
    // Namespace: TcHmi.Functions.HMI_Dark
    TcHmi.Functions.registerFunctionEx(
        'WriteRealToSymbol',              // Nome da função
        'TcHmi.Functions.HMI_Dark',       // Namespace do projeto
        WriteRealToSymbol                  // Referência à função
    );

})(TcHmi);
