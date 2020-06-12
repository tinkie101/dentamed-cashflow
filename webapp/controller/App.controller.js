sap.ui.define([
		"./Base.controller",
		"sap/ui/model/json/JSONModel",
	], function(BaseController, JSONModel) {
		"use strict";

		return BaseController.extend("dentamed.cashflow.controller.App", {
			_oViewModel: new JSONModel({
				busy: false,
				delay: 0,
			}),

			onInit: function() {
				let oController = this;

				oController.getView().setModel(oController._oViewModel, "viewModel");
			},
		});
	},
);
