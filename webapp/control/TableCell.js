sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Text",
	"sap/m/Input",
	"sap/ui/core/format/NumberFormat",
], function(Control, Text, Input, NumberFormat) {
	"use strict";
	return Control.extend("dentamed.cashflow.control.TableCell", {
		metadata: {
			properties: {
				value: {
					type: "string",
					defaultValue: "",
				},
				editMode: {
					type: "boolean",
					defaultValue: false,
				},
				editType: {
					type: "sap.m.InputType",
					defaultValue: "Text",
				},
				readType: {
					type: "sap.ui.model.CompositeType",
					defaultValue: "sap.ui.model.type.String",
				},
			},
			aggregations: {
				_text: {
					type: "sap.m.Text",
					multiple: false,
				},
				_input: {
					type: "sap.m.Input",
					multiple: false,
				},
			},
		},

		init: function() {
			this.setAggregation("_text", new Text({
				text: this.getProperty("value"),
				visible: !this.getProperty("editMode"),
			}));

			this.setAggregation("_input", new Input({
				visible: this.getProperty("editMode"),
				type: this.getProperty("editType"),
			}));
		},

		setValue: function(sValue) {
			let _text = this.getAggregation("_text");
			let _input = this.getAggregation("_input");

			this.setProperty("value", sValue, true);
			_text.setText(sValue);
			_input.setValue(sValue);
		},

		setEditMode: function(bEditMode) {
			let _text = this.getAggregation("_text");
			let _input = this.getAggregation("_input");

			this.setProperty("editMode", bEditMode);
			_text.setVisible(!bEditMode);
			_input.setVisible(bEditMode);
		},

		setEditType: function(sType) {
			let _input = this.getAggregation("_input");

			this.setProperty("editType", sType);
			_input.setType(sType);
		},

		renderer: function(oRM, oControl) {
			oRM.openStart("div", oControl);
			oRM.openEnd();
			if (oControl.getProperty("editMode") === true) {
				oRM.renderControl(oControl.getAggregation("_input"));
			}
			else {
				if (oControl.getProperty("editType") === sap.m.InputType.Number) {
					let _text = oControl.getAggregation("_text");
					let oFormat = NumberFormat.getCurrencyInstance({
						"currencyCode": false,
						"customCurrencies": {
							"ZAR": {
								"symbol": "R",
								"decimals": 2
							}
						}
					});
					_text.setText(oFormat.format(oControl.getProperty("value"), "ZAR"));
					oRM.renderControl(_text);
				} else {
					oRM.renderControl(oControl.getAggregation("_text"));
				}
			}
			oRM.close("div");
		},
	});
});
