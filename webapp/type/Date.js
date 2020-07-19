sap.ui.define([
	"sap/ui/model/odata/type/Date",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/FormatException"
], function(DateType, DateFormat, FormatException) {
	"use strict";

	return DateType.extend("dentamed.cashflow.type.Date", {
		formatValue(sValue, sInternalType) {
			let oType = this;
			let oDate;

			if (sValue === undefined || sValue === null) {
				return null;
			}
			switch (this.getPrimitiveType(sInternalType)) {
				case "any":
					return sValue;
				case "object":
					return sValue instanceof Date
						? new Date(sValue.getUTCFullYear(), sValue.getUTCMonth(), sValue.getUTCDate())
						: oType.getModelFormat().parse(sValue, false);
				case "string":
					oDate = sValue instanceof Date ? sValue : oType.getModelFormat().parse(sValue);
					return oDate ? oType.getFormatter().format(oDate) : sValue;
				default:
					throw new FormatException("Don't know how to format " + oType.getName() + " to "
						+ sInternalType);
			}
		},

		parseValue(sValue, sInternalType) {
			let oType = this;
			let modelFormatter = oType.getModelFormat();

			return modelFormatter.parse(sValue);
		},

		validateValue(sValue) {
		 return sValue instanceof Date;
		},

		getFormatter() {
			let oType = this;
			let oFormatOptions;

			if (!oType.oFormat) {
				oFormatOptions = jQuery.extend({strictParsing: true}, oType.oFormatOptions);
				//Why was this hardcoded in the first place?
				//oFormatOptions.UTC = true;
				oType.oFormat = DateFormat.getDateInstance(oFormatOptions);
			}
			return oType.oFormat;
		},
	});
});
