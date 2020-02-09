$ (function() {
    //add budget
    var budget_lab = alasql('SELECT emp, budget FROM (SELECT * FROM login \
                        LEFT JOIN lab ON login.code = lab.code) \
                        WHERE emp = "' + emp +'"');
    var budget_proj = alasql('SELECT emp, budget FROM (SELECT * FROM login \
                        LEFT JOIN proj ON login.code = proj.code) \
                        WHERE emp = "' + emp +'"');
    if (budget_lab[0].budget != undefined)
    {
        $('#dashbudget').append(numberWithCommas(budget_lab[0].budget.toFixed(2)));
    }
    else if (budget_proj[0].budget != undefined)
    {
        $('#dashbudget').append(numberWithCommas(budget_proj[0].budget.toFixed(2)));
    }

    //add members or projects
    var access = alasql('SELECT code, acclvl FROM login WHERE emp = ?', [emp])[0];
    if (access.code.startsWith("P") == true) //if project
    {
        $('h5[name="memberproj"]').append('<b><span class="glyphicon glyphicon-user"></span>&nbsp;Fellow Researchers:</b>')
        var teammates = alasql('SELECT emp, name, pos, acclvl FROM login WHERE emp != ? AND code = ?', [emp , access.code]);
        var divsize = 12/(teammates.length);
        for (var i = 0; i < teammates.length; i++)
        {
            var fellowlist = $('div[name="memberprojlist"]');
            var detaildiv = $('<div class="w3-col" style="max-width: 280px;"></div>');
            var detailcard = $('<div class="w3-card-2 w3-round-large w3-grey w3-center" style="width: 90%"></div>');
            var detailcont = $('<div class="w3-container w3-center">');
            detailcont.append('<img class="w3-circle w3-margin-top" src="img/' + teammates[i].emp.toLowerCase() + '.png" alt="" style="width: 80%;">');
            detailcont.append('<h5>' + teammates[i].name + '</h5>');
            detailcont.appendTo(detailcard);
            detailcard.appendTo(detaildiv);
            detaildiv.appendTo(fellowlist);
        }
    }
    else if (access.code.startsWith("L") == true) //if lab
    {
        $('h5[name="memberproj"]').append('<b><span class="glyphicon glyphicon-user"></span>&nbsp;In-House Project Managers:</b>')
        var teammates = alasql('SELECT login.emp, login.name, login.pos, login.code, proj.loc FROM login \
                                LEFT JOIN proj ON login.code = proj.code WHERE login.acclvl = 1 AND \
                                login.code LIKE "P%" AND login.emp != ? ', [emp]);
        var divsize = 12/(teammates.length);
        for (var i = 0; i < teammates.length; i++)
        {
            if (teammates[i].loc == access.code) //if located in lab
            {
                var fellowlist = $('div[name="memberprojlist"]');
                var detaildiv = $('<div class="w3-col" style="max-width: 280px;"></div>');
                var detailcard = $('<div class="w3-card-2 w3-round-large w3-grey w3-center" style="width: 90%"></div>');
                var detailcont = $('<div class="w3-container w3-center">');
                detailcont.append('<img class="w3-circle w3-margin-top" src="img/' + teammates[i].emp.toLowerCase() + '.png" alt="" style="width: 80%;">');
                detailcont.append('<h5>' + teammates[i].name + '</h5>');
                detailcont.append('<h6>' + teammates[i].pos + '</h6>');
                detailcont.appendTo(detailcard);
                detailcard.appendTo(detaildiv);
                detaildiv.appendTo(fellowlist);
            }
        }        
    }

    var access = alasql('SELECT code, acclvl FROM login WHERE emp = ?', [emp])[0];

    //do overview
    var currper = alasql('SELECT * FROM stock WHERE stat = 1 AND owner = ?', [access.code]);
    var curreqp = alasql('SELECT * FROM equip WHERE stat != 5 AND stat != 4 AND owner = ?', [access.code]);
    
    // --- item hitting threshold --- //
    if (currper.length != 0)
    {
        var count = 0;
        var belowcount = 0;
        for (var i = 0; i < currper.length; i++)
        {
            if (currper[i].balance <= currper[i].threshold)
            {
                count += 1;
                if (currper[i].balance == 0)
                {
                    belowcount == 1;
                }
            }
        }
        $('#itemthres h2[name="num"]').append(count);
        if (count == 0)
        {
            $('#itemthres div[name="bg"]').addClass("w3-green");
        }
        else if (count != 0 && belowcount == 0)
        {
            $('#itemthres div[name="bg"]').addClass("w3-orange");
        }
        else if (count != 0 && belowcount != 0)
        {
            $('#itemthres div[name="bg"]').addClass("w3-red");
        }
    }
    else
    {
        $('#itemthres h2[name="num"]').append("-");
        $('#itemthres div[name="bg"]').addClass("w3-grey");
    }

    // --- equip under repair --- //
    if (curreqp.length != 0)
    {
        var count = 0;
        for (var i = 0; i < curreqp.length; i++)
        {
            if (curreqp[i].stat == 2)
            {
                count += 1;
            }
        }
        $('#equiprep h2[name="num"]').append(count);
        if (count == 0)
        {
            $('#equiprep div[name="bg"]').addClass("w3-green");
        }
        else
        {
            $('#equiprep div[name="bg"]').addClass("w3-orange");
        }
    }
    else
    {
        $('#equiprep h2[name="num"]').append("-");
        $('#equiprep div[name="bg"]').addClass("w3-grey");
    }
    
    // --- trans and hist pending completion/collection --- //
    var usagecoltrans = alasql('SELECT * FROM trans LEFT JOIN stock ON trans.stock = stock.id WHERE trans.stat = 2 AND trans.qty < 0 AND (stock.owner = ? OR trans.req = ?)', [access.code, emp]);
    var usagecolhist = alasql('SELECT * FROM hist LEFT JOIN equip ON hist.equip = equip.id WHERE ((hist.stat = 1 AND time != 0) OR hist.stat = 3) AND (equip.owner = ? OR hist.req = ?)', [access.code, emp]);

    var count = 0;
    var redcount = 0;
    var lag = [];
    if (usagecolhist.length != 0) //do equip first so can do dep analysis later
    {
        for (var i = 0; i < usagecolhist[i].length; i++)
        {
            count += 1;
            now = Date.parse(new Date());
            starttime = Date.parse(usagecolhist[i].date);
            dur = usagecolhist.time * 1000;
            if ((now - dur - starttime) > 7200000) //2h considered overdue, else it's due now
            {
                redcount = 1;
            }
            var dep = alasql('SELECT lag FROM dep WHERE lead = ?', [usagecolhist[i].item]);
            for (var j = 0; j < dep.length; j++)
            {
                lag.push(dep[j].lag);
            }
        }
    }
    if (usagecoltrans.length != 0) //do for stock now, remove lags
    {
        for (var i = 0; i < usagecoltrans.length; i++)
        {
            count += 1; //add first
            var datetime = usagecoltrans[i].date + " " + parseInt(usagecoltrans[i].time/3600).toString().padStart(2,"0") + ':' + parseInt((usagecoltrans[i].time%3600)/60).toString().padStart(2,"0");
            for (var j = 0; j < lag.length; j++)
            {
                if (usagecoltrans[i].item == lag[j])
                {
                    count -= 1; //remove if found to be a lag
                }
                else //if not a lag, check for overdue
                {
                    if (Date.parse(new Date()) - Date.parse(datetime) > 7200000) //2h considered overdue, else it's due now
                    {
                        redcount = 1;
                    }
                }
            }
        }
    }
    $('#usagecol h2[name="num"]').append(count);
    if (count == 0)
    {
        $('#usagecol div[name="bg"]').addClass("w3-green");
    }
    else if (count != 0 && redcount == 0)
    {
        $('#usagecol div[name="bg"]').addClass("w3-orange");
    }
    else if (count != 0 && redcount != 0)
    {
        $('#usagecol div[name="bg"]').addClass("w3-red");
    }

    // --- trans and hist pending approval --- //
    var usageapprtrans = alasql('SELECT * FROM trans LEFT JOIN stock ON trans.stock = stock.id WHERE trans.stat = 3 AND trans.qty < 0 AND (stock.owner = ? OR trans.req = ?)', [access.code, emp]);
    var usageapprhist = alasql('SELECT * FROM hist LEFT JOIN equip ON hist.equip = equip.id WHERE hist.stat = 5 AND hist.time != 0 AND (equip.owner = ? OR hist.req = ?)', [access.code, emp]);

    var count = 0;
    var redcount = 0;
    var lag = [];
    if (usageapprhist.length != 0) //do equip first so can do dep analysis later
    {
        for (var i = 0; i < usageapprhist.length; i++)
        {
            count += 1;
            now = Date.parse(new Date());
            starttime = Date.parse(usageapprhist[i].date);
            dur = usageapprhist[i].time * 1000;
            if ((now - dur - starttime) > -3*86400000)
            {
                redcount = 1;
            }
            var dep = alasql('SELECT lag FROM dep WHERE lead = ?', [usageapprhist[i].item]);
            for (var j = 0; j < dep.length; j++)
            {
                lag.push(dep[j].lag);
            }
        }
    }
    if (usageapprtrans.length != 0) //do for stock now, remove lags
    {
        for (var i = 0; i < usageapprtrans.length; i++)
        {
            count += 1; //add first
            var datetime = usageapprtrans[i].date + " " + parseInt(usageapprtrans[i].time/3600).toString().padStart(2,"0") + ':' + parseInt((usageapprtrans[i].time%3600)/60).toString().padStart(2,"0");
            for (var j = 0; j < lag.length; j++)
            {
                if (usageapprtrans[i].item == lag[j])
                {
                    count -= 1; //remove if found to be a lag
                }
                else //if not a lag, check for overdue
                {
                    if (Date.parse(new Date()) - Date.parse(datetime) > -3*86400000)
                    {
                        redcount = 1;
                    }
                }
            }
        }
    }
    $('#usageappr h2[name="num"]').append(count);
    if (count == 0)
    {
        $('#usageappr div[name="bg"]').addClass("w3-green");
    }
    else if (count != 0 && redcount == 0)
    {
        $('#usageappr div[name="bg"]').addClass("w3-orange");
    }
    else if (count != 0 && redcount != 0)
    {
        $('#usageappr div[name="bg"]').addClass("w3-red");
    }

    // --- trans and hist proc pending delivery --- //
    var procdeltrans = alasql('SELECT * FROM trans LEFT JOIN stock ON trans.stock = stock.id WHERE trans.stat = 2 AND trans.qty > 0 AND (stock.owner = ? OR trans.req = ?)', [access.code, emp]);
    var procdelhist = alasql('SELECT * FROM hist LEFT JOIN equip ON hist.equip = equip.id WHERE hist.stat = 4 AND (equip.owner = ? OR hist.req = ?)', [access.code, emp]);

    var count = 0;
    var redcount = 0;
    if (procdelhist.length != 0) //do equip first
    {
        for (var i = 0; i < procdelhist.length; i++)
        {
            count += 1;
            if (Date.parse(new Date()) - Date.parse(procdelhist[i].date) > 86400000)
            {
                redcount = 1;
            }
        }
    }
    if (procdeltrans.length != 0) //do for stock now
    {
        for (var i = 0; i < procdeltrans.length; i++)
        {
            count += 1;
            if (Date.parse(new Date()) - Date.parse(procdeltrans[i].date) > 86400000)
            {
                redcount = 1;
            }
        }
    }
    $('#procdel h2[name="num"]').append(count);
    if (count == 0)
    {
        $('#procdel div[name="bg"]').addClass("w3-green");
    }
    else if (count != 0 && redcount == 0)
    {
        $('#procdel div[name="bg"]').addClass("w3-orange");
    }
    else if (count != 0 && redcount != 0)
    {
        $('#procdel div[name="bg"]').addClass("w3-red");
    }

    // --- trans and hist proc pending approval --- //
    var procapprtrans = alasql('SELECT * FROM trans LEFT JOIN stock ON trans.stock = stock.id WHERE trans.stat = 3 AND trans.qty > 0 AND (stock.owner = ? OR trans.req = ?)', [access.code, emp]);
    var procapprhist = alasql('SELECT * FROM hist LEFT JOIN equip ON hist.equip = equip.id WHERE hist.stat = 5 AND hist.time = 0 AND (equip.owner = ? OR hist.req = ?)', [access.code, emp]);

    var count = 0;
    var redcount = 0;
    if (procapprhist.length != 0) //do equip first
    {
        for (var i = 0; i < procapprhist.length; i++)
        {
            count += 1;
            if (Date.parse(new Date()) - Date.parse(procapprhist[i].date) > -3*86400000)
            {
                redcount = 1;
            }
        }
    }
    if (procapprtrans.length != 0) //do for stock now
    {
        for (var i = 0; i < procapprtrans.length; i++)
        {
            count += 1;
            if (Date.parse(new Date()) - Date.parse(procapprtrans[i].date) > -3*86400000)
            {
                redcount = 1;
            }
        }
    }
    $('#procappr h2[name="num"]').append(count);
    if (count == 0)
    {
        $('#procappr div[name="bg"]').addClass("w3-green");
    }
    else if (count != 0 && redcount == 0)
    {
        $('#procappr div[name="bg"]').addClass("w3-orange");
    }
    else if (count != 0 && redcount != 0)
    {
        $('#procappr div[name="bg"]').addClass("w3-red");
    }
});