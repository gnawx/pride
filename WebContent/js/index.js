// get login credentials
var uname = $.url().param('uname');
var psw = $.url().param('psw');

// build sql
var login = alasql('SELECT * FROM login');

//login check
var legit = 0;
for (var i = 0; i < login.length; i++)
{
	if (uname == login[i]["emp"])
	{
		if (psw == login[i]["pass"])
		{
			legit = 1;
		}
	}
}

//display wrong credentials warning
if (legit == 1)
{
	window.location.assign('dashboard.html?emp=' + uname);
	$("#wrongalert").removeClass('w3-show');
}
else if (legit == 0 && uname != undefined)
{
	$("#wrongalert").addClass('w3-show');
}