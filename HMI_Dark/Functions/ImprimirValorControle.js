/// <reference path="../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />
(function (/** @type {globalThis.TcHmi} */ TcHmi) {
    var Functions;
    (function (Functions) {
        var HMI_Dark;
        (function (HMI_Dark) {

            function ImprimirValorControle(controlIID) {
                if (typeof controlId !== 'string') {
                    console.error("Parâmetro deve ser do tipo string (ControlId).");
                  
                }
                var controle = TcHmi.Controls.get(controlId);
                if (controle && typeof controle.getText === 'function') {
                    var valor = controle.getText();
                    console.log("Valor do controle [" + controlId + "]: " + valor);
                } else {
                    console.error("Controle não encontrado ou getText não disponível: " + controlId);
                }
            }

            HMI_Dark.ImprimirValorControle = ImprimirValorControle;

        })(HMI_Dark = Functions.HMI_Dark || (Functions.HMI_Dark = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);

// Registrar a função
TcHmi.Functions.registerFunctionEx('ImprimirValorControle', 'TcHmi.Functions.HMI_Dark', TcHmi.Functions.HMI_Dark.ImprimirValorControle);
