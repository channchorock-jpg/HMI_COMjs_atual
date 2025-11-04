
/// <reference path="../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />
/**
 * CopyNumericToUCParam.js
 * Exemplo mínimo: ler valor de um TcHmiNumericInput e escrever em um parâmetro interno do UserControl.
 * Uso: passar IDs de controles e o nome do setter do parâmetro do UserControl (ex.: "setTargetValue").
 */

(function (TcHmi) {
    var Functions;
    (function (Functions) {
        var HMI_Dark;
        (function (HMI_Dark) {

            /**
             * @param {string} numericInputId  ID do TcHmiNumericInput (dentro do UserControl)
             * @param {string} userControlId   ID do UserControl (raiz)
             * @param {string} setterName      Nome do método setter do parâmetro interno (ex.: "setTargetValue")
             * @returns {boolean}              true se escreveu com sucesso; false caso contrário
             */
            function CopyNumericToUCParam(numericInputId, userControlId, setterName) {
                var user = TcHmi.Controls.get(setterName);
                var control = user.getParameter('TcHmiTextblock_13575')
                console.log('setterName', control);

            }
            
            // Registro no framework para uso no Actions & Conditions (docs: registerFunctionEx).
            TcHmi.Functions.registerFunctionEx('CopyNumericToUCParam', 'TcHmi.Functions.HMI_Dark', CopyNumericToUCParam);

        })(HMI_Dark = Functions.HMI_Dark || (Functions.HMI_Dark = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);
