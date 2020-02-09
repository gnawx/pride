var DB = {};

DB.init = function() {
	if (window.confirm('are you sure to initialize database?')) {
		DB.load();
	}
};

DB.load = function() {
	alasql.options.joinstar = 'overwrite';

	// PROJ
	alasql('DROP TABLE IF EXISTS proj;');
	alasql('CREATE TABLE proj(id INT IDENTITY, code STRING, name STRING, loc STRING, budget FLOAT);');
	var pproj = alasql.promise('SELECT MATRIX * FROM CSV("data/PROJ-PROJ.csv", {headers: true})').then(function(projs) {
		for (var i = 0; i < projs.length; i++) {
			var proj = projs[i];
			alasql('INSERT INTO proj VALUES(?,?,?,?,?);', proj);
		}
	});

	// LAB
	alasql('DROP TABLE IF EXISTS lab;');
	alasql('CREATE TABLE lab(id INT IDENTITY, code STRING, name STRING, loc STRING, tel STRING, budget FLOAT);');
	var plab = alasql.promise('SELECT MATRIX * FROM CSV("data/LAB-LAB.csv", {headers: true})').then(function(labs) {
		for (var i = 0; i < labs.length; i++) {
			var lab = labs[i];
			alasql('INSERT INTO lab VALUES(?,?,?,?,?,?);', lab);
		}
	});

	// KIND
	alasql('DROP TABLE IF EXISTS kind;');
	alasql('CREATE TABLE kind(id INT IDENTITY, descr STRING, cls STRING);');
	var pkind = alasql.promise('SELECT MATRIX * FROM CSV("data/KIND-KIND.csv", {headers: true})').then(
			function(kinds) {
				for (var i = 0; i < kinds.length; i++) {
					var kind = kinds[i];
					alasql('INSERT INTO kind VALUES(?,?,?);', kind);
				}
			});

	// ITEM
	alasql('DROP TABLE IF EXISTS item;');
	alasql('CREATE TABLE item(id INT IDENTITY, kind INT, detail STRING, unit STRING);');
	var pitem = alasql.promise('SELECT MATRIX * FROM CSV("data/ITEM-ITEM.csv", {headers: true})').then(
			function(items) {
				for (var i = 0; i < items.length; i++) {
					var item = items[i];
					alasql('INSERT INTO item VALUES(?,?,?,?);', item);
				}
			});

	// SOURCE
	alasql('DROP TABLE IF EXISTS src;');
	alasql('CREATE TABLE src(id INT IDENTITY, item INT, maker STRING, price FLOAT, qty INT, contacts STRING);');
	var psource = alasql.promise('SELECT MATRIX * FROM CSV("data/SOURCE-SOURCE.csv", {headers: true})').then(
			function(sources) {
				for (var i = 0; i < sources.length; i++) {
					var source = sources[i];
					alasql('INSERT INTO src VALUES(?,?,?,?,?,?);', source);
				}
			});

	// DEP
	alasql('DROP TABLE IF EXISTS dep;');
	alasql('CREATE TABLE dep(id INT IDENTITY, lead INT, lag INT);');
	var pdep = alasql.promise('SELECT MATRIX * FROM CSV("data/DEP-DEP.csv", {headers: true})').then(
			function(deps) {
				for (var i = 0; i < deps.length; i++) {
					var dep = deps[i];
					alasql('INSERT INTO dep VALUES(?,?,?);', dep);
				}
			});
	
	// EQUIP
	alasql('DROP TABLE IF EXISTS equip;');
	alasql('CREATE TABLE equip(id INT IDENTITY, item INT, loc STRING, owner STRING, balance INT, stat INT);');
	var pequip = alasql.promise('SELECT MATRIX * FROM CSV("data/EQUIP-EQUIP.csv", {headers: true})').then(
			function(equips) {
				for (var i = 0; i < equips.length; i++) {
					var equip = equips[i];
					alasql('INSERT INTO equip VALUES(?,?,?,?,?,?);', equip);
				}
			});
	
	//HIST
	alasql('DROP TABLE IF EXISTS hist;');
	alasql('CREATE TABLE hist(id INT IDENTITY, equip INT, date DATE, qty INT, balance INT, stat INT, memo STRING, req STRING, time STRING, punit FLOAT);');
	var phist = alasql.promise('SELECT MATRIX * FROM CSV("data/HIST-HIST.csv", {headers: true})').then(
			function(hists) {
				for (var i = 0; i < hists.length; i++) {
					var hist = hists[i];
					alasql('INSERT INTO hist VALUES(?,?,?,?,?,?,?,?,?,?);', hist);
				}
			});

	// STOCK
	alasql('DROP TABLE IF EXISTS stock;');
	alasql('CREATE TABLE stock(id INT IDENTITY, item INT, loc STRING, owner STRING, balance INT, stat INT, threshold INT);');
	var pstock = alasql.promise('SELECT MATRIX * FROM CSV("data/STOCK-STOCK.csv", {headers: true})').then(
			function(stocks) {
				for (var i = 0; i < stocks.length; i++) {
					var stock = stocks[i];
					alasql('INSERT INTO stock VALUES(?,?,?,?,?,?,?);', stock);
				}
			});

	//TRANS
	alasql('DROP TABLE IF EXISTS trans;');
	alasql('CREATE TABLE trans(id INT IDENTITY, stock INT, date DATE, qty INT, balance INT, memo STRING, stat INT, req STRING, time STRING, punit FLOAT);');
	var ptrans = alasql.promise('SELECT MATRIX * FROM CSV("data/TRANS-TRANS.csv", {headers: true})').then(
			function(transs) {
				for (var i = 0; i < transs.length; i++) {
					var trans = transs[i];
					alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?,?);', trans);
				}
			});
	
	//PROCURE
	alasql('DROP TABLE IF EXISTS procure;');
	alasql('CREATE TABLE procure(id INT IDENTITY, stock INT, date DATE, qty INT);');
	var pprocure = alasql.promise('SELECT MATRIX * FROM CSV("data/PROCURE-PROCURE.csv", {headers: true})').then(
			function(procures) {
				for (var i = 0; i < procures.length; i++) {
					var procure = procures[i];
					alasql('INSERT INTO procure VALUES(?,?,?,?);', procure);
				}
			});

	//STATUS
	alasql('DROP TABLE IF EXISTS status;');
	alasql('CREATE TABLE status(id INT IDENTITY, text STRING);');
	var pstatus = alasql.promise('SELECT MATRIX * FROM CSV("data/STATUS-STATUS.csv", {headers: true})').then(
			function(statuss) {
				for (var i = 0; i < statuss.length; i++) {
					var status = statuss[i];
					alasql('INSERT INTO status VALUES(?,?);', status);
				}
			});

	//LOGIN
	alasql('DROP TABLE IF EXISTS login;');
	alasql('CREATE TABLE login(id INT IDENTITY, emp STRING, pass STRING, name STRING, pos STRING, code STRING, acclvl INT);');
	var plogin = alasql.promise('SELECT MATRIX * FROM CSV("data/LOGIN-LOGIN.csv", {headers: true})').then(
			function(logins) {
				for (var i = 0; i < logins.length; i++) {
					var login = logins[i];
					alasql('INSERT INTO login VALUES(?,?,?,?,?,?,?);', login);
				}
			});

	// Reload page
	Promise.all([ pproj , plab , pkind , pitem , psource , pdep , pequip , phist , pstock, ptrans, pprocure , pstatus , plogin ]).then(function() {
		window.location.reload(true);
	});
};

DB.locate = function(code) {
	var choices = alasql('SELECT loc FROM lab WHERE code = "' + code + '"');
	if (choices.length) {
		return choices[0].loc;
	} else {
		return '';
	}
};

DB.own = function(code) {
	if (code.startsWith("L") == true)
	{
		var choices = alasql('SELECT name FROM lab WHERE code = "' + code + '"');		
		if (choices.length) {
			return choices[0].name;
		} else {
			return '';
		}
	}
	else if (code.startsWith("P") == true)
	{
		var choices = alasql('SELECT name FROM proj WHERE code = "' + code + '"');		
		if (choices.length) {
			return choices[0].name;
		} else {
			return '';
		}
	}
};

DB.stat = function(id) {
	var choices = alasql('SELECT text FROM status WHERE id = ' + id + '');
	if (choices.length) {
		return choices[0].text;
	} else {
		return '';
	}
};

DB.nm = function(emp) {
	var choices = alasql('SELECT name FROM login WHERE emp = "' + emp + '"');
	if (choices.length) {
		return choices[0].name;
	} else {
		return '';
	}
};

DB.remove = function() {
	if (window.confirm('are you sure to delete dababase?')) {
		alasql('DROP localStorage DATABASE STK')
	}
};

// add commas to number
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// remove commas from number
function numberWithoutCommas(x) {
	return x.toString().replace(/(\d+),(\d)/g, '$1$2');
}

// DO NOT CHANGE!
alasql.promise = function(sql, params) {
	return new Promise(function(resolve, reject) {
		alasql(sql, params, function(data, err) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

// connect to database
try {
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
} catch (e) {
	alasql('CREATE localStorage DATABASE STK;');
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
	console.log("loading DB");
	DB.load();
}
