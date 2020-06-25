sap.ui.define([
		"./Base.controller",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Fragment",
		"sap/ui/core/format/NumberFormat",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"dentamed/cashflow/type/Date",
	], function(BaseController, JSONModel, Fragment, NumberFormat, Filter, FilterOperator, CustomDate) {
		"use strict";

		return BaseController.extend("dentamed.cashflow.controller.Overview", {
			_oViewModel: new JSONModel(),

			onInit: function() {
				let oController = this;

				oController._initViewModelData();
				oController.onRouteMatch("overview", oController._onRouteMatch);
			},

			_onRouteMatch: function(oEvent) {
				let oController = this;
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
						let oFilter = new Filter("Date", FilterOperator.BT, oController._oViewModel.getProperty("/minDate"), oController._oViewModel.getProperty("/maxDate"));

						oBinding.filter(oFilter);
					}
				}
			},

			onRefreshPressed: function() {
				let oController = this;

				oController._initViewModelData();
				oController._updateTableBindings();
			},

			onEditPressed: function(bEditable) {
				this.getView().getModel("viewModel").setProperty("/editable", !bEditable);
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
				let oBindContext = oSource.getBindingContext("viewModel");

				if (oView.getModel("viewModel").getProperty("/editable")) {
					oBindContext.getModel().setProperty(oBindContext.getPath("income"), !oBindContext.getProperty("income"));
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

			onPrintPressed: function() {
				let oController = this;
				this.loadFile().then((template) => {
					let zip = new JSZip(template);

					let document = new window.docxtemplater().loadZip(zip);
					let dateParts = oController._oViewModel.getProperty("/selectedDate").split("-");
					let date = {
						month: dateParts[0],
						year: dateParts[1],
					};

					document.setData({
						Month: date.month,
						Year: date.year,
						entries: oController._oViewModel.getProperty("/items"),
					});

					document.render();

					let output = document.getZip().generate({
						type: "blob",
						mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					});
					saveAs(output);
				});
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
