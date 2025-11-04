
(function (TcHmi) {
    var Functions;
    (function (Functions) {
        var HMI_Dark;
        (function (HMI_Dark) {

            /**
             * case 0 -> bind %s%%pp%stSensors%/pp%[0].stRampInput.fTargetValue%/s%
             * case 1 -> bind %s%%pp%stSensors%/pp%[1].stRampInput.fTargetValue%/s%
             * Cria binding na propriedade Value do NumericInput passado (objeto controle).
             *
             * @param {number|string} iSensorBind
             * @param {any}           _stSensors
             * @param {any}           _stFeedback
             * @param {TcHmi.Controls.System.baseTcHmiControl} numericInputCtrl
             * @param {any=}          __context
             * @returns {boolean}
             */
            function BindSensorToNumericInput(iSensorBind, stSensors, stFeedback, numericInputCtrl, dfff) {
                try {
                    var idx = Number(iSensorBind);
                    if (!numericInputCtrl || typeof numericInputCtrl.setValue !== 'function') return false;

                    // limpa binding anterior do atributo 'Value'
                    try { TcHmi.Binding.removeEx2(null, 'Value', numericInputCtrl); } catch (e) { }

                    // monta expressão símbolo (PLC) via PP (raiz) + S (símbolo completo)
                    var expr;
                    switch (idx) {
                        case 0:
                            expr = '%s%%pp%stSensors%/pp%[0].stRampInput.fTargetValue%/s%';
                            break;
                        case 1:
                            expr = '%s%%pp%stSensors%/pp%[1].stRampInput.fTargetValue%/s%';
                            break;
                        default:
                            return false;
                    }

                    // cria o binding com conversão p/ número (evita E_VALUE_INVALID no NumericInput)
                    TcHmi.Binding.create(expr, function (v) {
                        var n = (typeof v === 'number') ? v : parseFloat(v);
                        if (isFinite(n)) this.setValue(n);
                    }, numericInputCtrl);

                    return true;
                } catch (err) {
                    console.error('[BindSensorToNumericInput] erro:', err);
                    return false;
                }
            }

            TcHmi.Functions.registerFunctionEx(
              'BindSensorToNumericInput',
              'TcHmi.Functions.HMI_Dark',
              BindSensorToNumericInput
            );

        })(HMI_Dark = Functions.HMI_Dark || (Functions.HMI_Dark = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);
