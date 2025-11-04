// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />

(function (/** @type {globalThis.TcHmi} */ TcHmi) {
    var Functions;
    (function (/** @type {globalThis.TcHmi.Functions} */ Functions) {
        var HMI_Dark;
        (function (HMI_Dark) {
            function TestFuncion(ParamSymbol) {
                return ParamSymbol;
            }
            HMI_Dark.TestFuncion = TestFuncion;
        })(HMI_Dark = Functions.HMI_Dark || (Functions.HMI_Dark = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);
TcHmi.Functions.registerFunctionEx('TestFuncion', 'TcHmi.Functions.HMI_Dark', TcHmi.Functions.HMI_Dark.TestFuncion);
