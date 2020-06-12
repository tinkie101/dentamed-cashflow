sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/UIComponent",
], function(jQuery, UIComponent) {
	"use strict";

	return UIComponent.extend("dentamed.cashflow.Component", {
		metadata: {
			manifest: "json",
		},

		init: function() {
			let oComponent = this;

			UIComponent.prototype.init.apply(oComponent, arguments);
			oComponent.getRouter().initialize();
		}
	});
});
