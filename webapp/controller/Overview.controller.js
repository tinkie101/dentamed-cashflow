sap.ui.define([
		"./Base.controller",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Fragment",
		"sap/ui/core/format/NumberFormat",
	], function(BaseController, JSONModel, Fragment, NumberFormat) {
		"use strict";

		return BaseController.extend("dentamed.cashflow.controller.Overview", {
			_oViewModel: new JSONModel({
				busy: false,
				delay: 0,
				editable: false,
				income: "income",
				expense: "expense",
				net: "net",
				items: [{income: true, value: 100, date: "01-06-2020", comment: "This is a test comment"},
					{income: false, value: 500, date: "05-06-2020", comment: "This is a test comment"},
					{income: false, value: 100, date: "01-06-2020", comment: "This is a test comment"},
					{income: true, value: 800, date: "10-06-2020", comment: "This is a test comment"},
					{income: true, value: 150, date: "20-06-2020", comment: "This is a test comment"}],
				selectedDate: undefined,
				minDate: undefined,
				maxDate: undefined,
			}),

			onInit: function() {
				let oController = this;
				let date = new Date();
				let newDate = (date.getMonth() + 1) + "-" + date.getFullYear();

				oController._oViewModel.setProperty("/selectedDate", newDate);
				oController.onDateChange(newDate);

				oController.getView().setModel(oController._oViewModel, "viewModel");
				oController.onRouteMatch("overview", oController._onRouteMatch);
			},

			_onRouteMatch: function(oEvent) {
				let oController = this;
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
				else {

				}
			},

			onDateChange: function(newDate) {
				let oController = this;
				let dateParts = newDate.split("-");
				let date = {
					month: dateParts[0],
					year: dateParts[1],
				};

				//new Date() has month start index 0, whereas newDate has month start index 1
				oController._oViewModel.setProperty("/minDate", new Date(date.year, date.month - 1, 1));
				oController._oViewModel.setProperty("/maxDate", new Date(date.year, date.month, 0));
			},

			onPrintPressed: function() {
				this.loadFile().then((template) => {
					let zip = new JSZip(template);

					let document = new window.docxtemplater().loadZip(zip);
					document.setData({
						Month: "Jan",
						Year: 2020,
						entries: [
							{
								Date: "date1",
								Type: "Income",
								Value: 1000,
								Comment: "Comment tsdfg",
							},
							{
								Date: "date2",
								Type: "Expense",
								Value: 1000,
								Comment: "Comment tsdfg",
							},
						],
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
				return aEntries.reduce((sum, entry) => {
					if(type === "income"){
						if(entry.income) sum += entry.value;
					} else if (type === "expense") {
						if(!entry.income) sum += entry.value;
					} else {
						entry.income? sum += entry.value : sum -= entry.value;
					}
					return sum;
				}, 0)
			},
		});
	},
);
