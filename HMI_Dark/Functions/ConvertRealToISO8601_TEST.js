/// ===========================================================================
/// ARQUIVO DE TESTE - ConvertRealToISO8601
/// Este arquivo demonstra o uso da função ConvertRealToISO8601
/// ===========================================================================

// IMPORTANTE: Este é apenas um arquivo de exemplo/teste
// Para usar a função no HMI, chame: TcHmi.Functions.HMI_Dark.ConvertRealToISO8601()

/**
 * Exemplos de uso da função ConvertRealToISO8601
 *
 * A função converte valores REAL (segundos) para formato ISO 8601 Duration
 * Formato ISO 8601: PT[horas]H[minutos]M[segundos]S[milissegundos]MS
 */

// ===========================================================================
// EXEMPLOS BÁSICOS
// ===========================================================================

// Exemplo 1: 3 segundos
// Entrada: 3
// Saída esperada: "PT3S"
var test1 = 3;
console.log('Teste 1 - 3 segundos:', test1, '→', 'PT3S (esperado)');

// Exemplo 2: 90 segundos (1 minuto e 30 segundos)
// Entrada: 90
// Saída esperada: "PT1M30S"
var test2 = 90;
console.log('Teste 2 - 90 segundos:', test2, '→', 'PT1M30S (esperado)');

// Exemplo 3: 3665 segundos (1 hora, 1 minuto e 5 segundos)
// Entrada: 3665
// Saída esperada: "PT1H1M5S"
var test3 = 3665;
console.log('Teste 3 - 3665 segundos:', test3, '→', 'PT1H1M5S (esperado)');

// ===========================================================================
// EXEMPLOS COM DECIMAIS
// ===========================================================================

// Exemplo 4: 3.5 segundos
// Entrada: 3.5
// Saída esperada: "PT3.5S"
var test4 = 3.5;
console.log('Teste 4 - 3.5 segundos:', test4, '→', 'PT3.5S (esperado)');

// Exemplo 5: 90.75 segundos
// Entrada: 90.75
// Saída esperada: "PT1M30.75S"
var test5 = 90.75;
console.log('Teste 5 - 90.75 segundos:', test5, '→', 'PT1M30.75S (esperado)');

// ===========================================================================
// EXEMPLOS COM MILISSEGUNDOS SEPARADOS
// ===========================================================================

// Exemplo 6: 3.5 segundos com milissegundos separados
// Entrada: 3.5, includeMilliseconds=true
// Saída esperada: "PT3S500MS"
var test6 = 3.5;
console.log('Teste 6 - 3.5 segundos (com MS):', test6, '→', 'PT3S500MS (esperado)');

// Exemplo 7: 0.25 segundos com milissegundos separados
// Entrada: 0.25, includeMilliseconds=true
// Saída esperada: "PT250MS"
var test7 = 0.25;
console.log('Teste 7 - 0.25 segundos (com MS):', test7, '→', 'PT250MS (esperado)');

// ===========================================================================
// EXEMPLOS DE FORMATO COMPLETO (NÃO COMPACTO)
// ===========================================================================

// Exemplo 8: 3 segundos em formato completo
// Entrada: 3, includeMilliseconds=false, compactFormat=false
// Saída esperada: "PT0H0M3S"
var test8 = 3;
console.log('Teste 8 - 3 segundos (completo):', test8, '→', 'PT0H0M3S (esperado)');

// ===========================================================================
// CASOS ESPECIAIS
// ===========================================================================

// Exemplo 9: Zero
// Entrada: 0
// Saída esperada: "PT0S"
var test9 = 0;
console.log('Teste 9 - zero:', test9, '→', 'PT0S (esperado)');

// Exemplo 10: Apenas horas exatas
// Entrada: 7200 (2 horas)
// Saída esperada: "PT2H"
var test10 = 7200;
console.log('Teste 10 - 7200 segundos (2h):', test10, '→', 'PT2H (esperado)');

// ===========================================================================
// EXEMPLO DE INTEGRAÇÃO COM PLC
// ===========================================================================

/**
 * Como usar no TwinCAT HMI com símbolos PLC:
 *
 * // Lê valor REAL do PLC (ex: tempo em segundos)
 * var plcSeconds = TcHmi.Symbol.readEx('%s%PLC1.MAIN.stData.fTimeInSeconds%/s%');
 *
 * // Converte para ISO 8601
 * var iso8601Time = TcHmi.Functions.HMI_Dark.ConvertRealToISO8601(
 *     plcSeconds,      // Valor em segundos
 *     false,           // Não separar milissegundos
 *     true             // Usar formato compacto
 * );
 *
 * // Escreve de volta para o PLC (variável TIME)
 * TcHmi.Symbol.writeEx('%s%PLC1.MAIN.stData.tDuration%/s%', iso8601Time);
 *
 * // Ou exibe em um controle de texto
 * var textControl = TcHmi.Controls.get('TxtDuration');
 * if (textControl) {
 *     textControl.setText(iso8601Time);
 * }
 */

// ===========================================================================
// EXEMPLO DE USO BIDIRECIONAL
// ===========================================================================

/**
 * Conversão REAL → ISO 8601 → REAL (ida e volta)
 *
 * // 1. Converte REAL para ISO 8601
 * var originalSeconds = 125.5;  // 2 minutos, 5.5 segundos
 * var iso8601 = TcHmi.Functions.HMI_Dark.ConvertRealToISO8601(originalSeconds);
 * // Resultado: "PT2M5.5S"
 *
 * // 2. Converte ISO 8601 de volta para REAL
 * var convertedBack = TcHmi.Functions.HMI_Dark.ConvertTimeToReal(
 *     0,           // iSensorShow = 0
 *     iso8601,     // timeValue0 = "PT2M5.5S"
 *     null,        // timeValue1 = null
 *     3            // decimalPlaces = 3
 * );
 * // Resultado: 125.5
 *
 * console.log('Original:', originalSeconds);
 * console.log('ISO 8601:', iso8601);
 * console.log('Convertido de volta:', convertedBack);
 * console.log('Valores são iguais?', Math.abs(originalSeconds - convertedBack) < 0.001);
 */

// ===========================================================================
// TABELA DE REFERÊNCIA RÁPIDA
// ===========================================================================

/**
 * TABELA DE CONVERSÃO RÁPIDA:
 *
 * REAL (segundos) | ISO 8601 Duration (formato compacto)
 * ----------------+----------------------------------------
 * 0               | PT0S
 * 1               | PT1S
 * 3.5             | PT3.5S
 * 60              | PT1M
 * 90              | PT1M30S
 * 125.5           | PT2M5.5S
 * 3600            | PT1H
 * 3665            | PT1H1M5S
 * 7200            | PT2H
 * 7323.75         | PT2H2M3.75S
 *
 * COM MILISSEGUNDOS SEPARADOS (includeMilliseconds=true):
 *
 * REAL (segundos) | ISO 8601 Duration
 * ----------------+----------------------------------------
 * 0.5             | PT500MS
 * 3.5             | PT3S500MS
 * 90.25           | PT1M30S250MS
 * 0.001           | PT1MS
 *
 * FORMATO COMPLETO (compactFormat=false):
 *
 * REAL (segundos) | ISO 8601 Duration
 * ----------------+----------------------------------------
 * 3               | PT0H0M3S
 * 90              | PT0H1M30S
 * 3665            | PT1H1M5S
 */

console.log('========================================');
console.log('Exemplos de uso disponíveis acima ↑');
console.log('Para testar, use TcHmi.Functions.HMI_Dark.ConvertRealToISO8601()');
console.log('========================================');
