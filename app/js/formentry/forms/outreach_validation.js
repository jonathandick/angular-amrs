$.validator.setDefaults({
    ignore: ""
});
var errors = "";

$(document).ready( function() {
    $("#outreach_form").validate({
        rules: {
            date_found: {needs_date_found:true},
	    missed_return_visit_date:{required:true},
	    patient_status: {required:true},
	    location_of_contact: {needs_location_of_contact:true},
	    return_visit_date: {needs_rtc_date:true},
	    likelihood_of_return: {needs_likelihood_of_return:true},

	    transfer_location: {needs_transfer_location:true},
	    phone_number: {needs_phone_number:true},
	    date_of_death: {needs_death_info:true},

	    cause_for_death: {needs_death_info:true},
	    provider: {required:true},
	    encounter_datetime: {required:true},
        }
    });      

});


jQuery.validator.addMethod(
    "needs_date_found", 
    function(value, element) {
	if(value === '') {
            return ($("#contacted_in_field option:selected").text().toLowerCase() != 'yes'
		    && $("#contacted_by_phone option:selected").text().toLowerCase() != 'yes');
	}
       else { return true; }
    }, 
    "* Must provide date found"
);

jQuery.validator.addMethod(
    "needs_location_of_contact", 
    function(value, element) {
	if(value === '') {
            return ($("#contacted_in_field option:selected").text().toLowerCase() != 'yes'
		    && $("#contacted_by_phone option:selected").text().toLowerCase() != 'yes')
		&& $("#date_found").val() == ''
	}
	else { return true;}
    }, 
    "* Must provide location of contact"
);


jQuery.validator.addMethod(
    "needs_rtc_date", 
    function(value, element) {
	if($("#patient_status option:selected").text().toLowerCase().match('^patient wishes')) {
            return value != '';
	}
	else { return true; }
    }, 
    "* Must provide RTC date"
);


jQuery.validator.addMethod(
    "needs_likelihood_of_return", 
    function(value, element) {
	if($("#patient_status option:selected").text().toLowerCase().match('^patient wishes')) {
	    return value != '';
	}
	else { return true; }
    }, 
    "* Must provide likelihood of patient returning"
);


jQuery.validator.addMethod(
    "needs_transfer_location", 
    function(value, element) {
	if($("#patient_status option:selected").text().toLowerCase().match('to ampath')) {
            return value != '';
	}
	else { return true; }
    }, 
    "* Must provide transfer location"
);

jQuery.validator.addMethod(
    "needs_phone_number", 
    function(value, element) {
	if($("#contacted_by_phone option:selected").text().toLowerCase() === 'yes') {
            return value != '';
	}
	else { return true; }
    }, 
    "* Must provide phone number"
);
  

jQuery.validator.addMethod(
    "needs_death_info", 
    function(value, element) {
	if($("#patient_status option:selected").text().toLowerCase() === 'patient dead') {
            return value != '';
	}
	else { return true; }
    }, 
    "* Must provide death date and cause for death"
);

jQuery.validator.addMethod(
    "check_death_date", 
    function(value, element) {
	var re = /^\d{4}-\d{2}-\d{2}$/;
	// valid if optional and empty OR if it passes the regex test
	return (this.optional(element) && value=="") || re.test(value);
    },
    "* Date is in invalid format. Please use YYYY-MM-DD"
);
