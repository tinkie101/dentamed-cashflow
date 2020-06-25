sap.ui.define([
	"sap/ui/model/odata/type/Date",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/FormatException"
], function(DateType, DateFormat, FormatException) {
	"use strict";

	return DateType.extend("dentamed.cashflow.type.Date", {
		formatValue(sValue, sInternalType) {
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
						: this.getModelFormat().parse(sValue, false);
				case "string":
					oDate = sValue instanceof Date ? sValue : this.getModelFormat().parse(sValue);
					return oDate ? this.getFormatter(this).format(oDate) : sValue;
				default:
					throw new FormatException("Don't know how to format " + this.getName() + " to "
						+ sInternalType);
			}
		},

		getFormatter(oType) {
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
