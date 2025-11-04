// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/TcHmi.d.ts" />
/* eslint-disable no-undef */
(function (TcHmi) {
    var Functions;
    (function (Functions) {
        var HMI_Dark;
        (function (HMI_Dark) {

            TcHmi.Functions.registerFunctionEx(
              'ReadUCParamToLog',
              'TcHmi.Functions.HMI_Dark',
              function (ctx, paramArg, ucIdArg) {
                  // LOG IMEDIATO: garante saída mesmo se nada mais acontecer
                  TcHmi.Log.infoEx('[ReadUCParamToLog] disparou. Tipos:', typeof paramArg, typeof ucIdArg);

                  // Helper: resolve símbolo por referência, expressão %...% ou literal
                  var resolveArg = function (arg, cb) {
                      try {
                          if (arg && typeof arg.read === 'function') {
                              TcHmi.Log.debugEx('[ReadUCParamToLog] arg = símbolo por referência (tem .read).');
                              arg.read(function (data) { cb(data); });
                              return;
                          }
                          if (typeof arg === 'string' && arg.indexOf('%') !== -1) {
                              TcHmi.Log.debugEx('[ReadUCParamToLog] arg = string com expressão de símbolo: ' + arg);
                              TcHmi.Symbol.readEx2(arg, function (data) { cb(data); });
                              return;
                          }
                          TcHmi.Log.debugEx('[ReadUCParamToLog] arg = literal já resolvido.');
                          cb({ value: arg, error: null });
                      } catch (e) {
                          cb({ error: e && e.message ? e.message : String(e) });
                      }
                  };

                  resolveArg(paramArg, function (p) {
                      if (p && p.error) {
                          TcHmi.Log.errorEx('[ReadUCParamToLog] ERRO lendo parâmetro: ' + p.error);
                          ctx.error(p.error);
                          return;
                      }
                      var paramValue = p ? p.value : undefined;
                      TcHmi.Log.infoEx('[ReadUCParamToLog] ParamValue = ' + String(paramValue));

                      resolveArg(ucIdArg, function (u) {
                          if (u && u.error) {
                              TcHmi.Log.warnEx('[ReadUCParamToLog] Aviso: falha lendo UC id: ' + u.error);
                          }
                          var ucId = (u && !u.error) ? u.value : undefined;
                          TcHmi.Log.infoEx('[ReadUCParamToLog] UC_ID = ' + String(ucId));

                          ctx.success();
                      });
                  });
              }
            );

        })(HMI_Dark = Functions.HMI_Dark || (Functions.HMI_Dark = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);
