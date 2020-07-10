sap.ui.define([
		"./Base.controller",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Fragment",
		"sap/ui/core/format/NumberFormat",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/MessageType",
		"dentamed/cashflow/type/Date",
	], function(BaseController, JSONModel, Fragment, NumberFormat, Filter, FilterOperator, MessageType, DateType) {
		"use strict";

		return BaseController.extend("dentamed.cashflow.controller.Overview", {
			_oViewModel: new JSONModel(),

			onInit: function() {
				let oController = this;
				let oOwnerComponent = oController.getOwnerComponent();
				let oModel = oOwnerComponent.getModel();

				oController._initViewModelData();

				oModel.attachPropertyChange(undefined, () => {
					if (oModel.hasPendingChanges()) {
						oController._displayMessage(MessageType.Warning, oOwnerComponent.getModel("i18n").getResourceBundle().getText("unsavedChanges"));
					}
				}, oController);

				oController.onRouteMatch("overview", oController._onRouteMatch);
			},

			_onRouteMatch: function(oEvent) {
				let oController = this;
				let oView = oController.getView();
				let oModel = oView.getModel();

				oController._updateTableBindings();
			},

			_getMinMaxDates: function(selectedDate) {
				let dateParts = selectedDate.split("-");
				let splitDates = {
					month: dateParts[0],
					year: dateParts[1],
				};

				//new Date() has month start index 0, whereas newDate has month start index 1
				let minDate = new Date(Date.UTC(splitDates.year, splitDates.month - 1, 1, 23));
				let maxDate = new Date(Date.UTC(splitDates.year, splitDates.month, 0));

				return {minDate, maxDate};
			},

			_initViewModelData: function() {
				let oController = this;
				let date = new Date();
				let selectedDate = (date.getMonth() + 1) + "-" + date.getFullYear();

				let {minDate, maxDate} = this._getMinMaxDates(selectedDate);

				oController._oViewModel = new JSONModel({
					busy: false,
					delay: 0,
					editable: false,
					printing: false,
					messageVisible: false,
					messageType: MessageType.None,
					messageText: "",
					income: "income",
					expense: "expense",
					net: "net",
					selectedDate: selectedDate,
					minDate: minDate,
					maxDate: maxDate,
				});

				oController.getView().setModel(oController._oViewModel, "viewModel");
			},

			_updateTableBindings: function() {
				let oController = this;
				let oTable = oController.getView().byId("resultsTable");

				if (oTable) {
					let oBinding = oTable.getBinding("items");
					if (oBinding) {
						oBinding.filter(oController._getTableFilters());
					}
				}
			},

			_getTableFilters: function() {
				let oController = this;

				return new Filter("Date", FilterOperator.BT, oController._oViewModel.getProperty("/minDate"), oController._oViewModel.getProperty("/maxDate"));
			},

			onRefreshPressed: function() {
				let oController = this;

				oController._initViewModelData();
				oController._updateTableBindings();
			},

			onSavePressed: function() {
				let oController = this;
				let oView = oController.getView();
				let oModel = oView.getModel();
				let oResourceBundle = oController.getOwnerComponent().getModel("i18n").getResourceBundle();

				function successMessage() {
					oController._oViewModel.setProperty("/editable", false);
					oController._displayMessage(MessageType.Success, oResourceBundle.getText("saveSuccessful"), 3000);
				}

				if (oModel.hasPendingChanges()) {
					oModel.submitChanges({
						success: () => {
							successMessage();
						},
						error: (oError) => {
							oController._displayMessage(MessageType.Error, oResourceBundle.getText("saveFailed"));
						},
					});
				}
				else {
					successMessage();
				}
			},

			onCancelPressed: function() {
				let oController = this;
				let oView = oController.getView();
				let oModel = oView.getModel();

				if (oModel.hasPendingChanges()) {
					oController._displayMessage(MessageType.Warning, oView.getModel("i18n").getResourceBundle().getText("cancelledChanges"), 3000);
					oModel.resetChanges(undefined, true);
				}

				oController._oViewModel.setProperty("/editable", false);
			},

			_displayMessage: function(type, text, duration) {
				let oController = this;

				oController._oViewModel.setProperty("/messageType", type);
				oController._oViewModel.setProperty("/messageText", text);
				oController._oViewModel.setProperty("/messageVisible", true);

				if (duration) {
					setTimeout(() => {
						oController._oViewModel.setProperty("/messageVisible", false);
					}, duration);
				}
			},

			onEditPressed: function() {
				let oController = this;

				oController._oViewModel.setProperty("/editable", true);
			},

			onAddPressed: function() {
				let oController = this;
				let oView = oController.getView();

				// create dialog lazily
				if (!oController.byId("addDialog")) {
					// load asynchronous XML fragment
					Fragment.load({
						id: oView.getId(),
						name: "dentamed.cashflow.fragment.AddDialog",
					}).then(function(oDialog) {
						// connect dialog to the root view of this component (models, lifecycle)
						oView.addDependent(oDialog);
						oDialog.open();
					});
				}
				else {
					this.byId("addDialog").open();
				}
			},

			onToggleType: function(oEvent) {
				let oView = this.getView();
				let oSource = oEvent.getSource();
				let oBindContext = oSource.getBindingContext();

				if (oView.getModel("viewModel").getProperty("/editable")) {
					oBindContext.getModel().setProperty(oBindContext.getPath("Income"), !oBindContext.getProperty("Income"));
				}
			},

			onDateChange: function(newDate) {
				let oController = this;
				let {minDate, maxDate} = oController._getMinMaxDates(newDate);

				//new Date() has month start index 0, whereas newDate has month start index 1
				oController._oViewModel.setProperty("/minDate", minDate);
				oController._oViewModel.setProperty("/maxDate", maxDate);

				oController._updateTableBindings();
			},

			onPrintPressed: async function() {
				let oController = this;

				oController._oViewModel.setProperty("/printing", true);

				let template = await this.loadFile();
				let zip = new JSZip(template);
				let document = new window.docxtemplater().loadZip(zip);
				let dateParts = oController._oViewModel.getProperty("/selectedDate").split("-");
				let date = {
					month: dateParts[0],
					year: dateParts[1],
				};

				let entries = await oController._getEntries();

				document.setData({
					Month: date.month,
					Year: date.year,
					entries: entries,
				});

				document.render();
				let output = document.getZip().generate({
					type: "blob",
					mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				});

				let pdfBlob = await oController._convertToPDFBlob(output);
				oController._downloadBlob(pdfBlob);

				oController._oViewModel.setProperty("/printing", false);
			},

			_getEntries: function() {
				let oController = this;

				return new Promise((resolve, reject) => {
					oController.getView().getModel().read("/Entrys", {
						filters: [oController._getTableFilters()],
						success: (oData) => {
							resolve(oData.results);
						},
						error: (oError) => {
							throw oError;
						},
					});
				});
			},

			_convertToPDFBlob: async function(docxFile) {
				let oController = this;
				let response = await fetch("http://localhost:8082/proxy/http/localhost:8080/pdf/docxToPdf", {
					method: "POST",
					body: docxFile,
				});

				if (response.ok) {
					let byteArray = await response.arrayBuffer();
					return new Blob([byteArray], {type: "application/pdf"});
				}
			},

			_downloadBlob: function(blob) {
				const URL = window.URL || window.webkitURL;
				const downloadUrl = URL.createObjectURL(blob);
				const a = document.createElement("a");
				const filename = "testdoc.pdf";

				if (typeof a.download === "undefined") {
					window.location = downloadUrl;
				}
				else {
					a.href = downloadUrl;
					a.download = filename;
					document.body.appendChild(a);
					a.click();
					window.URL.revokeObjectURL(downloadUrl);
					document.body.removeChild(a);
				}
			},

			loadFile: function() {
				return new Promise((resolve, reject) => {
					let xhr = new XMLHttpRequest();
					xhr.open("GET", "print-template.docx", true);

					xhr.responseType = "arraybuffer";

					xhr.onload = function(e) {
						if (this.status === 200) {
							resolve(this.response);
						}
					};
					xhr.onerror = function(error) {
						reject(error);
					};
					xhr.send();
				});
			},

			formatCurrency: function(value) {
				let oFormat = NumberFormat.getCurrencyInstance({
					"currencyCode": false,
					"customCurrencies": {
						"ZAR": {
							"symbol": "R",
							"decimals": 2,
						},
					},
				});
				return oFormat.format(value, "ZAR");
			},

			calculateTotal: function(aEntries, type) {
				if (!aEntries) {
					return null;
				}
				return aEntries.reduce((sum, entry) => {
					if (type === "income") {
						if (entry.income) {
							sum += entry.value;
						}
					}
					else if (type === "expense") {
						if (!entry.income) {
							sum += entry.value;
						}
					}
					else {
						entry.income ? sum += entry.value : sum -= entry.value;
					}
					return sum;
				}, 0);
			},
		});
	},
);
