// sap.ui.define([
//     "sap/m/MessageToast"
// ], function(MessageToast) {
//     'use strict';
 
//     return {
//         Preview: function(oEvent) {
//             MessageToast.show("Custom handler invoked.");
//         }
//     }
// });
 
sap.ui.define([
 
    "sap/m/MessageToast",
 
    "sap/m/MessageBox",
 
    "sap/ui/model/odata/v2/ODataModel"
 
], function (MessageToast, MessageBox, ODataModel) {
 
    "use strict";
 
    return {
 
        Preview: function (oEvent) {
 
            const oView = this.getView();
 
            const oTable = oEvent.getSource()
 
                .getParent()
 
                .getParent();
 
            const aSelectedItems = oTable.getSelectedItems();
 
            if (!aSelectedItems.length) {
 
                MessageToast.show("Please select at least one record");
 
                return;
 
            }
 
            oView.setBusy(true);
 
            const oModel = new ODataModel("/sap/opu/odata/sap/ZSB_TAX_INVOICE", true);
 
            let iCompleted = 0;
 
            aSelectedItems.forEach((oItem) => {
 
                const aCells = oItem.getCells();
 
                const sBillingDocument = aCells[0].getText();
 
                // const sYear = aCells[3].getText();
 
                const sPath =
 
                    `/ZC_TAX_INVOICE(BillingDocument='${sBillingDocument}')`;
 
                oModel.read(sPath, {
 
                    success: (oData) => {
 
                        this.printPreview(oData.base64);
 
                        iCompleted++;
 
                        if (iCompleted === aSelectedItems.length) {
 
                            oView.setBusy(false);
 
                        }
 
                    },
 
                    error: () => {
 
                        oView.setBusy(false);
 
                        MessageBox.error("Error fetching PDF file");
 
                    }
 
                });
 
            });
 
        },
 
        printPreview: function (sBase64) {
 
            const oBlob = this.pdfBlobConversion(sBase64, "application/pdf");
 
            const sUrl = URL.createObjectURL(oBlob);
 
            const oWindow = window.open(sUrl);
 
            if (!oWindow) {
 
                MessageBox.error("Popup blocked. Please allow popups.");
 
                return;
 
            }
 
            oWindow.onload = function () {
 
                oWindow.print();
 
            };
 
        },
 
        pdfBlobConversion: function (b64Data, contentType) {
 
            contentType = contentType || "application/pdf";
 
            b64Data = b64Data.replace(/^[^,]+,/, "").replace(/\s/g, "");
 
            const byteCharacters = atob(b64Data);
 
            const byteArrays = [];
 
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
 
                const slice = byteCharacters.slice(offset, offset + 512);
 
                const byteNumbers = new Array(slice.length);
 
                for (let i = 0; i < slice.length; i++) {
 
                    byteNumbers[i] = slice.charCodeAt(i);
 
                }
 
                byteArrays.push(new Uint8Array(byteNumbers));
 
            }
 
            return new Blob(byteArrays, { type: contentType });
 
        }
 
    };
 
});
 