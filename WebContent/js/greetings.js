// Setup Sidebar Credentials
var emp = $.url().param('emp');
// Parse Request Params
var q = $.url().param('q');

// TO FIGURE OUT! WHY q DOES NOT SUBMIT
// var q = $.url().param('q');
// console.log(emp, q);
var creds = alasql('SELECT name, pos, code FROM login WHERE emp="'+emp+'"');
$('#greetings').append('<img src="img/'+emp.toLowerCase()+'.png" class="w3-circle w3-margin-right" style="width:46px">')
$('#logname').append(creds[0]["name"]);
$('#logtitle').append(creds[0]["pos"]);