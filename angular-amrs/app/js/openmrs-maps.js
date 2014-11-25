var name = {
    getGivenName : function(obj) { return obj.givenName; },
    getFamilyName : function(obj) { return obj.familyName; },
};


var Person = {
    data : {},
    schema : "",
    map : {},

    getMethods : function(names) {
	for(n in names) {
	    
	this.map['name'] = this.data.preferredName;
	
    }

    name = name.clone(this.data.preferredName),    
};


var data = {uuid:'1234',preferredName:{givenName:"John"}};

var p = Person.clone(data);
p.

/*
var abstractPerson = {
    data: {},
    clone : function() {
        var a = {data:{},};
        for(var k in this) {
	    if(typeof this[k] == 'function' && k != "clone") {
                a[k] = this[k];
	    }
        }
        return a;
    },
    getUuid : function() { return this.data.uuid; },
    getName : function() { 
	return (this.data.person.preferredName.givenName || "") + " " 
	    + (this.data.person.preferredName.middleName || "") + " " 
	    + this.data.person.preferredName.familyName;
    },
    getGivenName : function() { return this.data.person.preferredName.givenName; },
    setGivenName : function(s) { return this.data.person.preferredName.givenName = s; },
    
    getFamily : function() { return this.data.person.preferredName.familyName; },
    setFamilyName : function(s) { return this.data.person.preferredName.familyName = s; },
    
    getMiddleName : function() { return this.data.person.preferredName.middleName; },
    setMiddleName : function(s) { return this.data.person.preferredName.middleName = s; },
    
    getBirthdate : function() { return this.data.person.birthdate; },
    getDead : function() { return this.data.person.dead},
    getDeathDate : function() { return this.data.person.deathDate},
    getGender : function() { return this.data.person.gender},
    
    getIdentifiers : function(identifierType) {	      
	return this.data.identifiers;
    },
    
    getPhoneNumber : function() {
	for(var i in this.data.person.attributes) {
	    var attr = this.data.person.attributes[i];
	    if(attr.attributeType.uuid == "72a759a8-1359-11df-a1f1-0026b9348838") {
		return attr.value;
	    }
	}
    }
    
};

*/
