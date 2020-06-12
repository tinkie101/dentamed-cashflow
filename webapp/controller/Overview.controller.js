sap.ui.define([
		"./Base.controller",
		"sap/ui/model/json/JSONModel",
	], function(BaseController, JSONModel) {
		"use strict";

		return BaseController.extend("dentamed.cashflow.controller.Overview", {
			_oViewModel: new JSONModel({
				busy: false,
				delay: 0,
				editable: false
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
				this.getView().getModel("viewModel").setProperty("/editable", !bEditable)
			}
		});
	},
);
