sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
	], function(BaseController, JSONModel) {
		"use strict";

		return BaseController.extend("dentamed.cashflow.controller.Base", {
			onRouteMatch: function(sRoute, fn) {
				let oController = this;
				oController.getRouter().getRoute(sRoute).attachPatternMatched(fn, oController);
			},

			getResourceBundle: function() {
				let oController = this;
				let oComponent = oController.getOwnerComponent();
				let oLanguageModel = oComponent.getModel("i18n");
				return oLanguageModel.getResourceBundle();
			},

			getRouter: function() {
				let oController = this;
				return oController.getOwnerComponent().getRouter();
			}
		});
	},
);
