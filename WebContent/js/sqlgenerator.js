function sqlgenerator(target, src, choice){
    if (choice == "inv")
    {
        // get ID of perishables and equipment respectively from kind
        var perishables = alasql('SELECT * FROM kind WHERE cls="Perishables"');
        var equipment = alasql('SELECT * FROM kind WHERE cls="Equipment"');

        // additional SQL Filters
        if (target == "All")
        {
            var p_filter = "";
            var e_filter = "";
        }
        else //get only those owned by user's group
        {
            var p_filter = ' WHERE stock.stat == 1 AND stock.owner = "' + target + '"';
            //check active menu
            var e_filter = ' WHERE (equip.stat != 5 AND equip.stat != 4) AND equip.owner = "' + target + '"';            
        }

        // search kw preparation
        var kw = src.split(",");

        for (var i = 0; i < kw.length; i++) //looping over all keywords
        {
            kw[i] = kw[i].replace(/^\s+/,""); //left trim of spaces in keywords with REGEX
            kw[i] = kw[i].replace(/\s+$/,""); //left trim of spaces in keywords with REGEX
            if (kw[i] != "")
            {
                var lab = alasql('SELECT code FROM lab WHERE name LIKE "%'+kw[i]+'%"');
                var proj = alasql('SELECT code FROM proj WHERE name LIKE"%'+kw[i]+'%"');
                if (lab.length != 0)
                {
                    kw[i] = lab[0].code;
                }
                else if (proj.length != 0)
                {
                    kw[i] = proj[0].code;
                }
            }
        }

        if (kw[kw.length-1] == "") //remove empty item
        {
            kw.pop();
        }

        // build search SQL condition
        var search_cat = ["detail", "descr", "owner", "loc"];
        var squery = '(';
        
        for (var i = 0; i < kw.length; i++)
        {
            for (var j = 0; j < search_cat.length; j++)
            {
                squery = squery.concat(search_cat[j] + " LIKE '%" + kw[i] + "%'");
                if (j < (search_cat.length-1)) //1 less than the last iteration
                {
                    squery = squery.concat(" OR ");
                }
                else
                {
                    squery = squery.concat(")");
                }
            }
            if (i < (kw.length-1)) //1 less than last iteration
            {
                squery = squery.concat(" AND (");
            }
        }

        // build sql for perishables
        var pquery = 'SELECT stock.id, item.unit, item.detail, kind.descr, stock.loc, stock.owner, stock.balance, stock.threshold \
        FROM stock \
        JOIN item ON stock.item = item.id \
        JOIN kind ON item.kind = kind.id'

        if (p_filter != "") // condition check for tabbing + search
        {
            pquery = pquery.concat(p_filter);
        }
        if (squery != "(")
        {
            if (p_filter != "")
            {
                pquery = pquery.concat(' AND ' + squery);
            }
            else
            {
                pquery = pquery.concat(' WHERE ' + squery);
            }
        }
        //check active menu
        pquery = pquery.concat(' AND stock.stat == 1 ORDER BY item.detail');
        var psql = alasql(pquery);

        // update tables
        if (target != "All") //change target from code to 'Mine'
        {
            target = "Mine";
        }
        
        var thead = $("#" + target + ' #thead-per');
        var tbody = $("#" + target + ' #tbody-per');
        $(thead).empty();$(tbody).empty();
        if (psql.length != 0)
        {
            thead.append('<tr> \
                            <th>Name</th> \
                            <th>Description</th> \
                            <th>Location</th> \
                            <th>Owner</th> \
                            <th style="text-align: right;">Balance</th> \
                        </tr>');
            for (var i = 0; i < psql.length; i++) {
                var p_stock = psql[i];
                var tr = $('<tr id="' + p_stock.id + '"></tr>');
                if (p_stock.threshold == 0)
                {
                    if (target == "Mine")
                    {
                        tr.append('<td name="detail"><a href="javascript:void(0)" onclick="openModalP(' + p_stock.id + ",'" + target + "'" + ')">' + p_stock.detail + '</a> \
                        <span class="w3-text-blue glyphicon glyphicon-info-sign"></span></td>');
                    }
                    else
                    {
                        tr.append('<td name="detail"><a href="javascript:void(0)" onclick="openModalP(' + p_stock.id + ",'" + target + "'" + ')">' + p_stock.detail + '</a> </td>');
                    }
                }
                else if (p_stock.balance > p_stock.threshold)
                {
                    tr.append('<td name="detail"><a href="javascript:void(0)" onclick="openModalP(' + p_stock.id + ",'" + target + "'" + ')">' + p_stock.detail + '</a> </td>');
                }
                else if (p_stock.balance > 0)
                {
                    tr.append('<td name="detail"><a href="javascript:void(0)" onclick="openModalP(' + p_stock.id + ",'" + target + "'" + ')">' + p_stock.detail + '</a> \
                            <span class="w3-text-orange glyphicon glyphicon-exclamation-sign"></span></td>');
                }
                else
                {
                    tr.append('<td name="detail"><a href="javascript:void(0)" onclick="openModalP(' + p_stock.id + ",'" + target + "'" + ')">' + p_stock.detail + '</a> \
                            <span class="w3-text-red glyphicon glyphicon-alert"></span></td>');
                }
                tr.append('<td name="type">' + p_stock.descr + '</td>');
                tr.append('<td name="loc">' + DB.locate(p_stock.loc) + '</td>');
                tr.append('<td name="owner">' + DB.own(p_stock.owner) + '</td>');
                if (p_stock.balance > p_stock.threshold)
                {
                    tr.append('<td name="balance" style="text-align: right;">' + numberWithCommas(p_stock.balance) + '&nbsp;' + p_stock.unit + '</td>')                    
                }
                else if (p_stock.balance > 0)
                {
                    tr.append('<td name="balance" class="w3-text-orange" style="text-align: right;">' + numberWithCommas(p_stock.balance) + '&nbsp;' + p_stock.unit + '</td>')                    
                }
                else
                {
                    tr.append('<td name="balance" class="w3-text-red" style="text-align: right;">' + numberWithCommas(p_stock.balance) + '&nbsp;' + p_stock.unit + '</td>')                    
                }
                tr.appendTo(tbody);
            }    
        }
        else
        {
            $(thead).empty();
            $(thead).append("<th style='text-align: center'>NO PERISHABLES FOUND</th>");
        }

        // build sql for equipment
        var equery = 'SELECT equip.id, item.unit, item.detail, kind.descr, equip.loc, equip.owner, equip.stat \
        FROM equip \
        JOIN item ON equip.item = item.id \
        JOIN kind ON item.kind = kind.id'

        if (e_filter != "") // condition check for tabbing + search
        {
            equery = equery.concat(e_filter);
        }
        if (squery != "(")
        {
            if (e_filter != "")
            {
                equery = equery.concat(' AND ' + squery);
            }
            else
            {
                //check active menu
                equery = equery.concat(' WHERE (equip.stat != 5 AND equip.stat != 4) AND ' + squery);
            }
        }
        equery = equery.concat(' ORDER BY item.detail');
        var esql = alasql(equery);

        // update tables
        var thead = $("#" + target + ' #thead-eqp');
        var tbody = $("#" + target + ' #tbody-eqp');
        $(thead).empty();$(tbody).empty();
        if (esql.length != 0)
        {
            thead.append('<tr> \
                            <th>Name</th> \
                            <th>Description</th> \
                            <th>Location</th> \
                            <th>Owner</th> \
                            <th style="text-align: right;">Status</th> \
                        </tr>');
            for (var i = 0; i < esql.length; i++) {
                var e_stock = esql[i];
                var tr = $('<tr id="' + e_stock.id + '"></tr>');
                if (e_stock.stat == 1) //if status is available
                {
                    var now = Date.parse(new Date());
                    // check if there's any uncollected / to start jobs
                    var eqpstat = alasql('SELECT * FROM hist WHERE time != 0 AND stat = 1 AND equip = ' + e_stock.id);
                    if (eqpstat.length != 0) //if have
                    {
                        var pastfilter = 0;
                        for (var j = 0; j < eqpstat.length; j++)
                        {
                            var starttime = Date.parse(eqpstat[j].date);
                            if ((now - starttime - eqpstat[j].time*1000) > 0) //ensure that job has completed (not upcoming)
                            {
                                pastfilter = 1;
                            }
                        }
                        if (pastfilter == 1)
                        {
                            tr.append('<td name="detail"><a href="javascript:void(0)" onclick="openModalE(' + e_stock.id + ')">' + e_stock.detail + '</a> \
                            <span class="w3-text-green glyphicon glyphicon-check"></span></td>');
                        }
                        else
                        {
                            tr.append('<td name="detail"><a href="javascript:void(0)" onclick="openModalE(' + e_stock.id + ')">' + e_stock.detail + '</a> </td>');
                        }
                    }
                    else //if none (all collected/none starting)
                    {
                        tr.append('<td name="detail"><a href="javascript:void(0)" onclick="openModalE(' + e_stock.id + ')">' + e_stock.detail + '</a> </td>');
                    }
                }
                else if (e_stock.stat == 2)
                {
                    tr.append('<td name="detail"><a href="javascript:void(0)" onclick="openModalE(' + e_stock.id + ')">' + e_stock.detail + '</a> \
                    <span class="w3-text-red glyphicon glyphicon-wrench"></span></td>');
                }
                else if (e_stock.stat == 3)
                {
                    tr.append('<td name="detail"><a href="javascript:void(0)" onclick="openModalE(' + e_stock.id + ')">' + e_stock.detail + '</a> \
                    <span class="w3-text-orange glyphicon glyphicon-hourglass w3-animate-fading"></span></td>');
                }
                tr.append('<td name="type">' + e_stock.descr + '</td>');
                tr.append('<td name="loc">' + DB.locate(e_stock.loc) + '</td>');
                tr.append('<td name="owner">' + DB.own(e_stock.owner) + '</td>');
                if (e_stock.stat == 1)
                {
                    tr.append('<td name="balance" style="text-align: right;">' + DB.stat(e_stock.stat) + '</td>');
                }
                else if (e_stock.stat == 2)
                {
                    tr.append('<td name="balance" class="w3-text-red" style="text-align: right;">' + DB.stat(e_stock.stat) + '</td>');
                }
                else if (e_stock.stat == 3)
                {
                    tr.append('<td name="balance" class="w3-text-orange" style="text-align: right;">' + DB.stat(e_stock.stat) + '</td>');
                }
                tr.appendTo(tbody);
            }    
        }
        else
        {
            $(thead).empty();
            $(thead).append("<th style='text-align: center'>NO EQUIPMENT FOUND</th>");
        }
    }


    else if (choice == 'proc')
    {
        //get user's project/lab code
        var empcode = alasql('SELECT code FROM login WHERE emp = ?', [emp])[0].code;
        
        //basic alasql for trans and hist
		var trans_q = 'SELECT trans.id, trans.stock, stock.item, item.detail, item.unit, trans.date, trans.time, trans.qty, trans.punit, \
                trans.req, trans.memo, trans.stat FROM trans LEFT JOIN stock ON trans.stock = stock.id \
                LEFT JOIN item ON stock.item = item.id';
        var hist_q = 'SELECT hist.id, hist.equip, equip.item, item.detail, item.unit, hist.date, hist.time, hist.qty, hist.punit, \
                hist.req, hist.memo, hist.stat FROM hist LEFT JOIN equip ON hist.equip = equip.id \
                LEFT JOIN item ON equip.item = item.id';

        if (target == 'Delivery')
        {
            trans_q = trans_q.concat(' WHERE trans.stat = 2 AND trans.punit != 0 AND trans.qty > 0');
            hist_q = hist_q.concat(' WHERE hist.stat = 4 AND hist.punit != 0 AND hist.time == 0');

            var trans = alasql(trans_q);
            var hist = alasql(hist_q);
            
            var thead = $("#" + target + ' #thead-per');
            var tbody = $("#" + target + ' #tbody-per');
            $(thead).empty(); $(tbody).empty();
            if (trans.length != 0)
            {
                var gotentry = 0;
                for (var i = 0; i < trans.length; i++) {
                    var transstock = trans[i];
                    var transcode = alasql('SELECT code FROM login WHERE emp = ?', [transstock.req])[0].code;
                    if (empcode == transcode || emp == transstock.req) //show only those relevant to user
                    {
                        gotentry = 1;
                        var tr = $('<tr id="' + transstock.id + '"></tr>');
                        var td = $('<td></td>');
                        td.append(transstock.detail);
                        if (Date.parse(new Date()) - Date.parse(transstock.date) > 86400000)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-red">Overdue</span>');
                        }
                        else if (Date.parse(new Date()) - Date.parse(transstock.date) > 0)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-orange">Due Today</span>');
                        }
                        td.appendTo(tr);
                        tr.append('<td>' + transstock.qty + '&nbsp;' + transstock.unit + '</td>');
                        tr.append('<td>' + (1*transstock.qty*(1*transstock.punit)).toFixed(2) + '</td>');
                        tr.append('<td>' + DB.nm(transstock.req) + '</td>');
                        tr.append('<td>' + transstock.date + '</td>');
                        tr.append('<td>' + transstock.memo + '</td>');
                        tr.append('<td class="w3-center"><input class="w3-check w3-margin-bottom" type="checkbox" name="' +
                                    transstock.id + '"></td>');
                        tr.appendTo(tbody);
                    }
                }
                if (gotentry == 1)
                {
                    thead.append('<tr> \
                        <th>Name</th> \
                        <th>Qty</th> \
                        <th>Total Price ($)</th> \
                        <th>Requestor</th> \
                        <th>Delivery Date</th> \
                        <th>Memo</th> \
                        <th class="w3-center">Delivered</th> \
                    </tr>');
                }
                else
                {
                    $(thead).empty();
                    $(thead).append("<th style='text-align: center'>NO PERISHABLES PENDING DELIVERY</th>");
                }
            }
            else
            {
                $(thead).empty();
                $(thead).append("<th style='text-align: center'>NO PERISHABLES PENDING DELIVERY</th>");
            }

            var thead = $("#" + target + ' #thead-eqp');
            var tbody = $("#" + target + ' #tbody-eqp');
            if (hist.length != 0)
            {
                var gotentry = 0;
                for (var i = 0; i < hist.length; i++) {
                    var histstock = hist[i];
                    var histcode = alasql('SELECT code FROM login WHERE emp = ?', [histstock.req])[0].code;
                    if (empcode == histcode || emp == histstock.req) //show only those relevant to user
                    {
                        gotentry = 1;
                        var tr = $('<tr id="' + histstock.id + '"></tr>');
                        var td = $('<td></td>');
                        td.append(histstock.detail);
                        if (Date.parse(new Date()) - Date.parse(histstock.date) > 86400000)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-red">Overdue</span>');
                        }
                        else if (Date.parse(new Date()) - Date.parse(histstock.date) > 0)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-orange">Due Today</span>');
                        }
                        td.appendTo(tr);
                        tr.append('<td>' + histstock.qty + '&nbsp;' + histstock.unit + '</td>');
                        tr.append('<td>' + (1*histstock.qty*(1*histstock.punit)).toFixed(2) + '</td>');
                        tr.append('<td>' + DB.nm(histstock.req) + '</td>');
                        tr.append('<td>' + histstock.date + '</td>');
                        tr.append('<td>' + histstock.memo + '</td>');
                        tr.append('<td class="w3-center"><input class="w3-check w3-margin-bottom" type="checkbox" name="' +
                                    histstock.id + '"></td>');
                        tr.appendTo(tbody);
                    }
                }
                if (gotentry == 1)
                {
                    thead.append('<tr> \
                        <th>Name</th> \
                        <th>Qty</th> \
                        <th>Total Price ($)</th> \
                        <th>Requestor</th> \
                        <th>Delivery Date</th> \
                        <th>Memo</th> \
                        <th class="w3-center">Delivered</th> \
                    </tr>');
                }
                else
                {
                    $(thead).empty();
                    $(thead).append("<th style='text-align: center'>NO EQUIPMENT PENDING DELIVERY</th>");
                }
            }
            else
            {
                $(thead).empty();
                $(thead).append("<th style='text-align: center'>NO EQUIPMENT PENDING DELIVERY</th>");
            }
        }
        else if (target == 'Approval')
        {
            trans_q = trans_q.concat(' WHERE trans.stat = 3 AND trans.qty > 0');
            hist_q = hist_q.concat(' WHERE hist.stat = 5 AND hist.punit != 0 AND hist.time == 0');

            var trans = alasql(trans_q);
            var hist = alasql(hist_q);
            console.log(trans);
            var thead = $("#" + target + ' #thead-per');
            var tbody = $("#" + target + ' #tbody-per');
            $(thead).empty(); $(tbody).empty();
            if (trans.length != 0)
            {
                var gotentry = 0;
                for (var i = 0; i < trans.length; i++) {
                    var transstock = trans[i];
                    var transcode = alasql('SELECT code FROM login WHERE emp = ?', [transstock.req])[0].code;
                    if (empcode == transcode || emp == transstock.req) //show only those relevant to user
                    {
                        gotentry = 1;
                        var tr = $('<tr id="' + transstock.id + '"></tr>');
                        var td = $('<td></td>');
                        td.append(transstock.detail);
                        if (Date.parse(new Date()) - Date.parse(transstock.date) > -3*86400000)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-red">Urgent</span>');
                        }
                        else if (Date.parse(new Date()) - Date.parse(transstock.date) > -5*86400000)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-orange">Important</span>');
                        }
                        td.appendTo(tr);
                        tr.append('<td>' + transstock.qty + '&nbsp;' + transstock.unit + '</td>');
                        tr.append('<td>' + (1*transstock.qty*(1*transstock.punit)).toFixed(2) + '</td>');
                        tr.append('<td>' + DB.nm(transstock.req) + '</td>');
                        tr.append('<td>' + transstock.date + '</td>');
                        tr.append('<td>' + transstock.memo + '</td>');
                        if (access.acclvl == 1)
                        {
                            tr.append('<td class="w3-center"><form class="w3-container" name="' +
                            transstock.id + '"><input class="w3-radio w3-margin-bottom" type="radio" \
                            name="yesno" value="yes"><label>Yes</label>\
                            <input class="w3-radio w3-margin-bottom" type="radio" \
                            name="yesno" value="no"><label>No</label></form></td>');
                        }
                        else
                        {
                            tr.append('<td class="w3-center">Pending Approval</td>');
                        }
                        tr.appendTo(tbody);    
                    }
                }  
                if (gotentry == 1)
                {
                    thead.append('<tr> \
                        <th>Name</th> \
                        <th>Qty</th> \
                        <th>Total Price ($)</th> \
                        <th>Requestor</th> \
                        <th>Delivery Date</th> \
                        <th>Memo</th> \
                        <th class="w3-center">Approval</th> \
                    </tr>');                    
                }
                else
                {
                    $(thead).empty();
                    $(thead).append("<th style='text-align: center'>NO PERISHABLES PENDING APPROVAL</th>");
                }
            }
            else
            {
                $(thead).empty();
                $(thead).append("<th style='text-align: center'>NO PERISHABLES PENDING APPROVAL</th>");
            }

            var thead = $("#" + target + ' #thead-eqp');
            var tbody = $("#" + target + ' #tbody-eqp');
            if (hist.length != 0)
            {
                var gotentry = 0;
                for (var i = 0; i < hist.length; i++) {
                    var histstock = hist[i];
                    var histcode = alasql('SELECT code FROM login WHERE emp = ?', [histstock.req])[0].code;
                    if (empcode == histcode || emp == histstock.req) //show only those relevant to user
                    {
                        gotentry = 1;
                        var tr = $('<tr id="' + histstock.id + '"></tr>');
                        var td = $('<td></td>');
                        td.append(histstock.detail);
                        if (Date.parse(new Date()) - Date.parse(histstock.date) > -3*86400000)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-red">Urgent</span>');
                        }
                        else if (Date.parse(new Date()) - Date.parse(histstock.date) > -5*86400000)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-orange">Important</span>');
                        }
                        tr.append('<td>' + histstock.qty + '&nbsp;' + histstock.unit + '</td>');
                        tr.append('<td>' + (1*histstock.qty*(1*histstock.punit)).toFixed(2) + '</td>');
                        tr.append('<td>' + DB.nm(histstock.req) + '</td>');
                        tr.append('<td>' + histstock.date + '</td>')
                        tr.append('<td>' + histstock.memo + '</td>');
                        if (access.acclvl == 1)
                        {
                        tr.append('<td class="w3-center"><form class="w3-container" name="' +
                                    histstock.id + '"><input class="w3-radio w3-margin-bottom" type="radio" \
                                    name="yesno" value="yes"><label>Yes</label>\
                                    <input class="w3-radio w3-margin-bottom" type="radio" \
                                    name="yesno" value="no"><label>No</label></form></td>');
                        }
                        else
                        {
                            tr.append('<td class="w3-center">Pending Approval</td>');
                        }
                        tr.appendTo(tbody);
                    }
                }
                if (gotentry == 1)
                {
                    thead.append('<tr> \
                        <th>Name</th> \
                        <th>Qty</th> \
                        <th>Total Price ($)</th> \
                        <th>Requestor</th> \
                        <th>Delivery Date</th> \
                        <th>Memo</th> \
                        <th class="w3-center">Approval</th> \
                    </tr>');
                }
                else
                {
                    $(thead).empty();
                    $(thead).append("<th style='text-align: center'>NO EQUIPMENT PENDING APPROVAL</th>");
                }
            }
            else
            {
                $(thead).empty();
                $(thead).append("<th style='text-align: center'>NO EQUIPMENT PENDING APPROVAL</th>");
            }
        }
    }


    else if (choice == 'usage')
    {
        //get user's project/lab code
        var empcode = alasql('SELECT code FROM login WHERE emp = ?', [emp])[0].code;
        
        //basic alasql for trans and hist
		var trans_q = 'SELECT trans.id, trans.stock, stock.item, item.detail, item.unit, trans.date, trans.time, trans.qty, trans.punit, \
                trans.req, trans.memo, trans.stat FROM trans LEFT JOIN stock ON trans.stock = stock.id \
                LEFT JOIN item ON stock.item = item.id';
        var hist_q = 'SELECT hist.id, hist.equip, equip.item, item.detail, item.unit, hist.date, hist.time, hist.qty, hist.punit, \
                hist.req, hist.memo, hist.stat FROM hist LEFT JOIN equip ON hist.equip = equip.id \
                LEFT JOIN item ON equip.item = item.id';

        if (target == 'Completion')
        {
            trans_q = trans_q.concat(' WHERE trans.stat = 2 AND trans.qty < 0');
            hist_q = hist_q.concat(' WHERE (hist.stat = 3 OR (hist.stat != 5 AND hist.stat != 4 AND hist.time != 0))');

            var trans = alasql(trans_q);
            var hist = alasql(hist_q);

            var thead = $("#" + target + ' #thead-per');
            var tbody = $("#" + target + ' #tbody-per');
            $(thead).empty(); $(tbody).empty();
            if (trans.length != 0)
            {
                var gotentry = 0;
                for (var i = 0; i < trans.length; i++) {
                    var transstock = trans[i];
                    var transcode = alasql('SELECT owner FROM stock WHERE id = ?', [transstock.stock])[0].owner;
                    if (empcode == transcode || emp == transstock.req) //show only those relevant to user
                    {
                        gotentry = 1;
                        var tr = $('<tr id="' + transstock.id + '"></tr>');
                        var td = $('<td></td>');
                        td.append(transstock.detail);
                        var datetime = transstock.date + " " + parseInt(transstock.time/3600).toString().padStart(2,"0") + ':' + parseInt((transstock.time%3600)/60).toString().padStart(2,"0");
                        if (Date.parse(new Date()) - Date.parse(datetime) > 7200000)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-red">Overdue</span>');
                        }
                        else if (Date.parse(new Date()) - Date.parse(datetime) > 0)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-orange">Due Now</span>');
                        }
                        else if (Date.parse(new Date()) - Date.parse(datetime) > -7200000)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-blue">Upcoming</span>');
                        }
                        td.appendTo(tr);
                        tr.append('<td>' + transstock.qty + '&nbsp;' + transstock.unit + '</td>');
                        tr.append('<td>' + DB.nm(transstock.req) + '</td>');
                        tr.append('<td>' + transstock.date + '</td>');
                        tr.append('<td>' + parseInt(transstock.time/3600).toString().padStart(2,"0") + ':' + parseInt((transstock.time%3600)/60).toString().padStart(2,"0") + '</td>');
                        tr.append('<td>' + transstock.memo + '</td>');
                        tr.append('<td class="w3-center"><input class="w3-check w3-margin-bottom" type="checkbox" name="' +
                                    transstock.id + '"></td>');
                        tr.appendTo(tbody);
                    }
                }
                if (gotentry == 1)
                {
                    thead.append('<tr> \
                        <th>Name</th> \
                        <th>Qty</th> \
                        <th>Requestor</th> \
                        <th>Collection Date</th> \
                        <th>Collection Time</th> \
                        <th>Memo</th> \
                        <th class="w3-center">Collected</th> \
                    </tr>');
                }
                else
                {
                    $(thead).empty();
                    $(thead).append("<th style='text-align: center'>NO PERISHABLES PENDING COLLECTION</th>");
                }
            }
            else
            {
                $(thead).empty();
                $(thead).append("<th style='text-align: center'>NO PERISHABLES PENDING COLLECTION</th>");
            }

            var thead = $("#" + target + ' #thead-eqp');
            var tbody = $("#" + target + ' #tbody-eqp');
            if (hist.length != 0)
            {
                var gotentry = 0;
                for (var i = 0; i < hist.length; i++) {
                    var histstock = hist[i];
                    var histcode = alasql('SELECT owner FROM equip WHERE id = ?', [histstock.equip])[0].owner;
                    if (empcode == histcode || emp == histstock.req) //show only those relevant to user
                    {
                        gotentry = 1;
                        //get deps and remove relevant perishables entries
                        var deps = alasql('SELECT lag FROM dep WHERE lead = ' + histstock.item);
                        var histstockdep = "";
                        for (var j = 0; j < deps.length; j++)
                        {
                            var transdet = alasql('SELECT trans.id, trans.qty, item.detail, item.unit FROM trans LEFT JOIN stock \
                            ON trans.stock = stock.id LEFT JOIN item ON stock.item = item.id \
                            WHERE stock.item = ' + deps[j].lag + ' AND trans.time = ' + histstock.time)[0];
                            
                            if (transdet != undefined)
                            {
                                histstockdep = histstockdep + '<p class="w3-margin" name="' + transdet.id + '">' + 
                                transdet.detail + ": " + transdet.qty + " " + transdet.unit +
                                '</span>';

                                $("#" + target + ' #tbody-per' + ' #' + transdet.id).remove();
                            }
                        }
                        var tr = $('<tr id="' + histstock.id + '"></tr>');
                        var td = $('<td></td>');
                        now = Date.parse(new Date());
                        starttime = Date.parse(histstock.date);
                        dur = histstock.time * 1000;
                        td.append(histstock.detail);
                        if ((now - dur - starttime) > 7200000)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-red">Overdue</span>');
                        }
                        else if ((now - dur - starttime) > 0)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-green">Completed</span>');
                        }
                        else if ((now - starttime) > 0 && (now - dur - starttime) < 0)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-orange">In Progress</span>');
                        }
                        else if ((now - starttime) > - 7200000)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-blue">Upcoming</span>');
                        }
                        td.appendTo(tr);
                        tr.append('<td>' + histstockdep + '</td>');
                        tr.append('<td>' + DB.nm(histstock.req) + '</td>');
                        tr.append('<td>' + histstock.date + '</td>');
                        tr.append('<td>' + parseInt(histstock.time/3600).toString().padStart(2,"0") + ':' + parseInt((histstock.time%3600)/60).toString().padStart(2,"0") + '</td>');
                        tr.append('<td>' + histstock.memo + '</td>');
                        tr.append('<td class="w3-center"><input class="w3-check w3-margin-bottom" type="checkbox" name="' +
                                    histstock.id + '"></td>');
                        tr.appendTo(tbody);
                        if ($("#" + target + ' #tbody-per').children().length == 0)
                        {
                            $("#" + target + ' #thead-per').empty();
                            $("#" + target + ' #thead-per').append("<th style='text-align: center'>NO PERISHABLES PENDING COLLECTION</th>");
                        }
                    }
                }
                if (gotentry == 1)
                {
                    thead.append('<tr> \
                    <th>Equipment</th> \
                    <th>Dependencies</th> \
                    <th>Requestor</th> \
                    <th>Start Time</th> \
                    <th>Duration</th> \
                    <th>Memo</th> \
                    <th class="w3-center">Completed</th> \
                </tr>');
                }
                else
                {
                    $(thead).empty();
                    $(thead).append("<th style='text-align: center'>NO EQUIPMENT TASK PENDING COMPLETION</th>");
                }
            }
            else
            {
                $(thead).empty();
                $(thead).append("<th style='text-align: center'>NO EQUIPMENT TASK PENDING COMPLETION</th>");
            }
        }

        else if (target == 'Approval')
        {
            trans_q = trans_q.concat(' WHERE trans.stat = 3 AND trans.punit == 0 AND trans.qty < 0');
            hist_q = hist_q.concat(' WHERE hist.stat = 5 AND hist.punit == 0 AND hist.time != 0');

            var trans = alasql(trans_q);
            var hist = alasql(hist_q);
            
            var thead = $("#" + target + ' #thead-per');
            var tbody = $("#" + target + ' #tbody-per');
            $(thead).empty(); $(tbody).empty();
            if (trans.length != 0)
            {
                var gotentry = 0;
                for (var i = 0; i < trans.length; i++) {
                    var transstock = trans[i];
                    var transcode = alasql('SELECT owner FROM stock WHERE id = ?', [transstock.stock])[0].owner;
                    if (empcode == transcode || emp == transstock.req) //show only those relevant to user
                    {
                        gotentry = 1;
                        var tr = $('<tr id="' + transstock.id + '"></tr>');
                        var td = $('<td></td>');
                        td.append(transstock.detail);
                        var datetime = transstock.date + " " + parseInt(transstock.time/3600).toString().padStart(2,"0") + ':' + parseInt((transstock.time%3600)/60).toString().padStart(2,"0");
                        if (Date.parse(new Date()) - Date.parse(datetime) > -3*86400000)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-red">Urgent</span>');
                        }
                        else if (Date.parse(new Date()) - Date.parse(datetime) > -5*86400000)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-orange">Important</span>');
                        }
                        td.appendTo(tr);
                        tr.append('<td>' + transstock.qty + '&nbsp;' + transstock.unit + '</td>');
                        tr.append('<td>' + DB.nm(transstock.req) + '</td>');
                        tr.append('<td>' + transstock.date + '</td>');
                        tr.append('<td>' + parseInt(transstock.time/3600).toString().padStart(2,"0") + ':' + parseInt((transstock.time%3600)/60).toString().padStart(2,"0") + '</td>');
                        tr.append('<td>' + transstock.memo + '</td>');
                        if (access.acclvl == 1)
                        {
                        tr.append('<td class="w3-center"><form class="w3-container" name="' +
                                    transstock.id + '"><input class="w3-radio w3-margin-bottom" type="radio" \
                                    name="yesno" value="yes"><label>Yes</label>\
                                    <input class="w3-radio w3-margin-bottom" type="radio" \
                                    name="yesno" value="no"><label>No</label></form></td>');
                        }
                        else
                        {
                            tr.append('<td class="w3-center">Pending Approval</td>');
                        }
                        tr.appendTo(tbody);
                    }
                }
                if (gotentry == 1)
                {
                    thead.append('<tr> \
                        <th>Name</th> \
                        <th>Qty</th> \
                        <th>Requestor</th> \
                        <th>Collection Date</th> \
                        <th>Collection Time</th> \
                        <th>Memo</th> \
                        <th class="w3-center">Approved</th> \
                    </tr>');
                }
                else
                {
                    $(thead).empty();
                    $(thead).append("<th style='text-align: center'>NO PERISHABLES PENDING APPROVAL</th>");
                }
            }
            else
            {
                $(thead).empty();
                $(thead).append("<th style='text-align: center'>NO PERISHABLES PENDING APPROVAL</th>");
            }

            var thead = $("#" + target + ' #thead-eqp');
            var tbody = $("#" + target + ' #tbody-eqp');
            if (hist.length != 0)
            {
                var gotentry = 0;
                for (var i = 0; i < hist.length; i++) {
                    var histstock = hist[i];
                    var histcode = alasql('SELECT owner FROM equip WHERE id = ?', [histstock.equip])[0].owner;
                    if (empcode == histcode || emp == histstock.req) //show only those relevant to user
                    {
                        gotentry = 1;
                        //get deps and remove relevant perishables entries
                        var deps = alasql('SELECT lag FROM dep WHERE lead = ' + histstock.item);
                        var histstockdep = "";
                        for (var j = 0; j < deps.length; j++)
                        {
                            var transdet = alasql('SELECT trans.id, trans.qty, item.detail, item.unit FROM trans LEFT JOIN stock \
                            ON trans.stock = stock.id LEFT JOIN item ON stock.item = item.id \
                            WHERE stock.item = ' + deps[j].lag + ' AND trans.time = ' + histstock.time)[0];
                            if (transdet != undefined)
                            {
                                histstockdep = histstockdep + '<p class="w3-margin" name="' + transdet.id + '">' + 
                                transdet.detail + ": " + transdet.qty + " " + transdet.unit +
                                '</span>';

                                $("#" + target + ' #tbody-per' + ' #' + transdet.id).remove();
                            }
                        }
                        var tr = $('<tr id="' + histstock.id + '"></tr>');
                        var td = $('<td></td>');
                        now = Date.parse(new Date());
                        starttime = Date.parse(histstock.date);
                        dur = histstock.time * 1000;
                        td.append(histstock.detail);
                        if ((now - dur - starttime) > -3*86400000)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-red">Urgent</span>');
                        }
                        else if ((now - starttime) > -5*86400000)
                        {
                            td.append('&nbsp;<span class="w3-tag w3-small w3-round w3-orange">Important</span>');
                        }
                        td.appendTo(tr);
                        tr.append('<td>' + histstockdep + '</td>');
                        tr.append('<td>' + DB.nm(histstock.req) + '</td>');
                        tr.append('<td>' + histstock.date + '</td>');
                        tr.append('<td>' + parseInt(histstock.time/3600).toString().padStart(2,"0") + ':' + parseInt((histstock.time%3600)/60).toString().padStart(2,"0") + '</td>');
                        tr.append('<td>' + histstock.memo + '</td>');
                        if (access.acclvl == 1)
                        {
                        tr.append('<td class="w3-center"><form class="w3-container" name="' +
                                    histstock.id + '"><input class="w3-radio w3-margin-bottom" type="radio" \
                                    name="yesno" value="yes"><label>Yes</label>\
                                    <input class="w3-radio w3-margin-bottom" type="radio" \
                                    name="yesno" value="no"><label>No</label></form></td>');
                        }
                        else
                        {
                            tr.append('<td class="w3-center">Pending Approval</td>');
                        }
                        tr.appendTo(tbody);

                        if ($("#" + target + ' #tbody-per').children().length == 0)
                        {
                            $("#" + target + ' #thead-per').empty();
                            $("#" + target + ' #thead-per').append("<th style='text-align: center'>NO PERISHABLES PENDING APPROVAL</th>");
                        }
                    }
                }
                if (gotentry == 1)
                {
                    thead.append('<tr> \
                    <th>Equipment</th> \
                    <th>Dependencies</th> \
                    <th>Requestor</th> \
                    <th>Start Time</th> \
                    <th>Duration</th> \
                    <th>Memo</th> \
                    <th class="w3-center">Approved</th> \
                </tr>');
                }
                else
                {
                    $(thead).empty();
                    $(thead).append("<th style='text-align: center'>NO EQUIPMENT PENDING APPROVAL</th>");
                }
            }
            else
            {
                $(thead).empty();
                $(thead).append("<th style='text-align: center'>NO EQUIPMENT PENDING APPROVAL</th>");
            }
        }
    }
}