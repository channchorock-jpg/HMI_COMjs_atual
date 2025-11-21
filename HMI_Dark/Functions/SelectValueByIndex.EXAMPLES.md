# SelectValueByIndex - Exemplos de Uso

## Descrição

Função genérica e reutilizável para **TwinCAT HMI TF2000 v1.12** que seleciona e retorna o valor de diferentes símbolos PLC baseado em um índice numérico.

**Substitui expressões IIFE** como:

```javascript
(function() {
    var index = %pp%iSenseLimit%/pp%;
    var value;

    switch (index) {
        case 0:
            value = %pp%stControle[0]::stSafeGuardSensor::fValueMax%/pp%;
            break;
        case 1:
            value = %pp%stControle[1]::stSafeGuardSensor::fValueMax%/pp%;
            break;
        default:
            value = 0;
    }

    return value;
})();
```

---

## Arquivos Criados

1. **`SelectValueByIndex.function.json`** - Metadados da função
2. **`SelectValueByIndex.js`** - Implementação completa

---

## Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `indexSource` | Any | Sim | Origem do índice (symbol object, controle ou número). Se symbol object, marcar **"Yes, pass symbol reference"**. |
| `symbol0` | Any | Sim | Symbol object para índice 0. Marcar **"Yes, pass symbol reference"**. |
| `symbol1` | Any | Sim | Symbol object para índice 1. Marcar **"Yes, pass symbol reference"**. |
| `symbol2` | Any | Não | Symbol object para índice 2 (opcional). Marcar **"Yes, pass symbol reference"**. |
| `symbol3` | Any | Não | Symbol object para índice 3 (opcional). Marcar **"Yes, pass symbol reference"**. |
| `defaultValue` | Number | Não | Valor de fallback se índice inválido ou símbolo não configurado (padrão: 0). |

---

## Retorno

**Tipo:** `Number`

Retorna o valor numérico lido do símbolo correspondente ao índice, ou `defaultValue` se:
- Índice fora do intervalo (< 0 ou > 3)
- Símbolo não configurado para aquele índice
- Erro na leitura do símbolo

---

## Exemplo 1: Substituindo IIFE Original

### ANTES (expressão IIFE):

```javascript
(function() {
    var index = %pp%iSenseLimit%/pp%;
    var value;

    switch (index) {
        case 0:
            value = %pp%stControle[0]::stSafeGuardSensor::fValueMax%/pp%;
            break;
        case 1:
            value = %pp%stControle[1]::stSafeGuardSensor::fValueMax%/pp%;
            break;
        default:
            value = 0;
    }

    return value;
})();
```

### DEPOIS (usando SelectValueByIndex):

**No Editor TwinCAT HMI (Actions & Conditions):**

1. Selecione **"JavaScript (Return Value)"**
2. Cole a seguinte expressão:

```javascript
TcHmi.Functions.HMI_Dark.SelectValueByIndex(
    %pp%iSenseLimit%/pp%,                                  // indexSource
    %pp%stControle[0]::stSafeGuardSensor::fValueMax%/pp%, // symbol0
    %pp%stControle[1]::stSafeGuardSensor::fValueMax%/pp%, // symbol1
    null,                                                 // symbol2 (não usado)
    null,                                                 // symbol3 (não usado)
    0                                                     // defaultValue
)
```

3. **IMPORTANTE:** Para `indexSource`, `symbol0` e `symbol1`, marcar **"Yes, pass symbol reference"** na caixa de diálogo de binding.

---

## Exemplo 2: Seleção de Valores MIN (4 símbolos)

### Cenário:
Você tem 4 sensores e quer retornar o valor mínimo (`fValueMin`) do sensor selecionado pelo índice `iCurrentSensor`.

```javascript
TcHmi.Functions.HMI_Dark.SelectValueByIndex(
    %pp%iCurrentSensor%/pp%,                               // indexSource
    %pp%stControle[0]::stSafeGuardSensor::fValueMin%/pp%, // symbol0
    %pp%stControle[1]::stSafeGuardSensor::fValueMin%/pp%, // symbol1
    %pp%stControle[2]::stSafeGuardSensor::fValueMin%/pp%, // symbol2
    %pp%stControle[3]::stSafeGuardSensor::fValueMin%/pp%, // symbol3
    -999                                                  // defaultValue (valor inválido)
)
```

**Marcar "Yes, pass symbol reference"** para todos os símbolos PLC.

---

## Exemplo 3: Usando Controle como Origem do Índice

### Cenário:
O índice vem de um controle `TcHmiNumericInput` (não de um símbolo PLC).

```javascript
TcHmi.Functions.HMI_Dark.SelectValueByIndex(
    %ctrl%TcHmiNumericInput_SensorSelector%/ctrl%,        // indexSource (controle)
    %pp%stControle[0]::stPID::fSetpoint%/pp%,            // symbol0
    %pp%stControle[1]::stPID::fSetpoint%/pp%,            // symbol1
    %pp%stControle[2]::stPID::fSetpoint%/pp%,            // symbol2
    null,                                                // symbol3 (não usado)
    100.0                                                // defaultValue
)
```

**Nota:** Para o controle (`%ctrl%`), **não** marcar "pass symbol reference". Para os símbolos PLC (`%pp%`), **marcar**.

---

## Exemplo 4: Índice como Número Literal

### Cenário:
Você quer fixar o índice em `1` (sempre retornar o valor de `symbol1`).

```javascript
TcHmi.Functions.HMI_Dark.SelectValueByIndex(
    1,                                                    // indexSource (número literal)
    %pp%stControle[0]::stPID::fKp%/pp%,                  // symbol0 (não será usado)
    %pp%stControle[1]::stPID::fKp%/pp%,                  // symbol1 (será retornado)
    null,                                                // symbol2
    null,                                                // symbol3
    0                                                    // defaultValue
)
```

---

## Exemplo 5: Usando Apenas 2 Símbolos

### Cenário:
Você tem apenas 2 sensores (índices 0 e 1).

```javascript
TcHmi.Functions.HMI_Dark.SelectValueByIndex(
    %pp%iSensorAtivo%/pp%,                                // indexSource
    %pp%Sensor_A::fTemperature%/pp%,                      // symbol0
    %pp%Sensor_B::fTemperature%/pp%,                      // symbol1
    null,                                                 // symbol2 (não configurado)
    null,                                                 // symbol3 (não configurado)
    25.0                                                  // defaultValue (25°C)
)
```

Se `iSensorAtivo` for `2` ou `3`, a função retorna `25.0` (defaultValue).

---

## Comportamento e Lógica

### Fluxo de Execução:

1. **Normalização do Índice (`indexSource`):**
   - Se for **symbol object** → lê o valor do símbolo PLC usando `getValueFromSymbolExpressionPromise`
   - Se for **controle TcHmi** → usa `control.getValue()`
   - Se for **número literal** → usa diretamente
   - Converte para **inteiro** (`parseInt`)

2. **Seleção do Símbolo:**
   - Usa `switch (index)` para selecionar `symbol0`, `symbol1`, `symbol2` ou `symbol3`
   - Se o índice não tiver símbolo configurado → usa `defaultValue`

3. **Leitura do Valor:**
   - Lê o valor do símbolo selecionado usando `getValueFromSymbolExpressionPromise`
   - Converte para número (`parseFloat`)
   - Se leitura falhar → usa `defaultValue`

4. **Retorno:**
   - `ctx.success(valorNumérico)` → valor lido
   - `ctx.success(defaultValue)` → fallback

---

## Tratamento de Erros

A função é **robusta** e trata os seguintes casos:

| Situação | Comportamento |
|----------|---------------|
| Índice inválido (< 0 ou > 3) | Retorna `defaultValue` |
| Símbolo não configurado para o índice | Retorna `defaultValue` |
| Erro ao ler o símbolo PLC | Retorna `defaultValue` |
| Valor lido não é numérico | Retorna `defaultValue` |
| `indexSource` não pode ser convertido | Chama `ctx.error(...)` |

**Logs no console:**
- Todos os passos são logados no console do navegador (F12 DevTools)
- Útil para debug e troubleshooting

---

## Vantagens sobre IIFE

| IIFE (Expressão Antiga) | SelectValueByIndex (Função Nova) |
|-------------------------|----------------------------------|
| Código repetitivo | Reutilizável em todo o projeto |
| Difícil de manter | Manutenção centralizada |
| Sem tratamento de erros | Tratamento robusto de erros |
| Sem logs de debug | Logs detalhados no console |
| Limite fixo de símbolos | Suporta até 4 símbolos + fácil expansão |
| Código acoplado | Genérico e desacoplado |

---

## Compatibilidade

- **TwinCAT HMI Framework:** 1.12.762.x
- **Linguagem:** JavaScript (ES2020)
- **Namespace:** `TcHmi.Functions.HMI_Dark`
- **Registro:** `registerFunctionEx`
- **Modo:** Assíncrono (`asyncWait: true`)

---

## Debugging

### Console Logs:

A função emite logs detalhados:

```javascript
[SelectValueByIndex] Índice normalizado: 1
[SelectValueByIndex] Selecionado symbol1 para índice 1
[SelectValueByIndex] Valor lido do símbolo: 75.5
```

### Como verificar:

1. Abra o navegador (Chrome, Edge, etc.)
2. Pressione **F12** (DevTools)
3. Vá para a aba **Console**
4. Execute a ação que chama a função
5. Verifique os logs para entender o fluxo

---

## Expansão Futura

Para suportar **mais de 4 símbolos**, você pode:

1. Adicionar `symbol4`, `symbol5`, etc. no `.function.json`
2. Adicionar casos no `switch` no `.js`:

```javascript
case 4:
    if (symbol4 && isSymbolObject(symbol4)) {
        selectedSymbol = symbol4;
    }
    break;
```

Ou considerar usar um **array de símbolos** se precisar de muitos índices.

---

## Suporte

Para questões ou problemas:
- Verifique os logs no console (F12)
- Revise o arquivo `SelectValueByIndex.js` (comentários detalhados)
- Consulte a documentação do TwinCAT HMI Infosys

---

## Versão

**v1.0.0** - 2025-11-21
- Implementação inicial
- Suporte para 4 símbolos (índices 0-3)
- Normalização de índice via symbol, controle ou número literal
- Tratamento robusto de erros
- Logs de debug detalhados

---

**Função criada para:** Projeto HMI-DARK_COMjs (SIMEROS)
**Framework:** Beckhoff TwinCAT HMI 1.12.762.x
