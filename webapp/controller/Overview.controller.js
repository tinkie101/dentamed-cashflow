sap.ui.define([
		"./Base.controller",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Fragment",
	], function(BaseController, JSONModel, Fragment) {
		"use strict";

		return BaseController.extend("dentamed.cashflow.controller.Overview", {
			_oViewModel: new JSONModel({
				busy: false,
				delay: 0,
				editable: false,
				selectedDate: (new Date().getMonth() + 1) + "-" + new Date().getFullYear(),
				value: 10000.00,
				items: [{income: true}, {income: false}, {income: false}, {income: true}, {income: true}],
				minDate: new Date(2020, 5, 1),
				maxDate: new Date(2020, 6, 0)
			}),

			onInit: function() {
				let oController = this;

				oController.getView().setModel(oController._oViewModel, "viewModel");
				oController.onRouteMatch("overview", oController._onRouteMatch);
			},

			_onRouteMatch: function(oEvent) {
				let oController = this;
			},

			onRefresh: function() {

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

				if(oView.getModel("viewModel").getProperty("/editable")) {
					oBindContext.getModel().setProperty(oBindContext.getPath("income"), !oBindContext.getProperty("income"));
				} else {

				}
			},

			onDateChange: function(newDate) {
				let oViewModel = this.getView().getModel("viewModel");

				let dateParts = newDate.split("-");
				let date =  {
					month: dateParts[0],
					year: dateParts[1]
				};

				//new Date() has month start index 0, whereas newDate has month start index 1
				oViewModel.setProperty("/minDate", new Date(date.year, date.month-1, 1));
				oViewModel.setProperty("/maxDate", new Date(date.year, date.month, 0));
			},

		});
	},
);
