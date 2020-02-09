//Function for Confirmation Modal
function updateData(form,data){
    
        console.log(data);
    
        //get access level of user
        var access = alasql('SELECT code, acclvl FROM login WHERE emp = "' + emp + '"')[0];
        //for perishables form
        if (form == 'perishables')
        {
            var stockid = alasql('SELECT id FROM stock WHERE item = ?', [parseInt(data[0])])[0].id;
        
            //get time difference
            var time = data[4].split(":");
            var sec = parseInt(time[0])*3600 + parseInt(time[1])*60;
        
            //update trans
            var newid = alasql('SELECT MAX(id) + 1 AS id FROM trans')[0].id;
            var previd = alasql('SELECT MAX(id) AS id FROM trans WHERE stock = ' + stockid)[0].id;
            var prevstk = alasql('SELECT balance FROM trans WHERE id = ' + (previd))[0].balance;
    
            //check if item is owned, and update DB accordingly
            if (data[1] == access.code)
            {
                alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?,?)', [newid, stockid, data[3], -1*data[2], prevstk - data[2], data[5], 2, emp, sec, 0]);
            }
            else
            {   
                //check if item is owned, and update DB accordingly
                alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?,?)', [newid, stockid, data[3], -1*data[2], prevstk - data[2], data[5], 3, emp, sec, 0]);
            }
        }
        else if (form == 'equipment')
        {        
            if (data[1] == access.code)
            {
                //update hist
                var equipid = alasql('SELECT id FROM equip WHERE item = ? AND owner = ?',[ parseInt(data[0]) , data[1] ])[0].id;
                var equipstat = alasql('SELECT stat FROM equip WHERE item = ? AND owner = ?',[ parseInt(data[0]) , data[1] ])[0].stat;
                var newid = alasql('SELECT MAX(id) + 1 AS id FROM hist')[0].id;
                var previd = alasql('SELECT MAX(id) AS id FROM hist WHERE equip = ' + equipid)[0].id;
                var prevstat = alasql('SELECT qty, balance, stat FROM hist WHERE id = ' + previd)[0];
                var startT = data[6].split(":");
                var sec = data[3]*3600 + data[4]*60; //time to completion from 00:00 of start date
                // update DB
                alasql('INSERT INTO hist VALUES(?,?,?,?,?,?,?,?,?,?)', [newid, equipid, (data[5] + " " + data[6]), prevstat.qty, prevstat.balance, equipstat, data[7], emp, sec,0]);
                
                //update trans
                var transdata = data[2]; //trans data of perishables usage
                for (var i = 0; i < transdata.length; i++)
                {
                    if (parseInt(transdata[i][1]) != 0)
                    {
                        var stockid = alasql('SELECT id FROM stock WHERE item = ? AND owner = ?', [ parseInt(transdata[i][0]) , data[1] ])[0].id;
                        var newtransid = alasql('SELECT MAX(id) + 1 AS id FROM trans')[0].id;
                        var prevtransid = alasql('SELECT MAX(id) AS id FROM trans WHERE stock = ' + stockid)[0].id;
                        var prevtransstk = alasql('SELECT balance FROM trans WHERE id = ' + (prevtransid))[0].balance;
                        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?,?)', [newtransid, stockid, data[5], -1*transdata[i][1], prevtransstk - transdata[i][1], data[7], 2, emp, sec,0]);
                    }
                }
            }
            else
            {
                //update hist
                var equipid = alasql('SELECT id FROM equip WHERE item = ? AND owner = ?',[ parseInt(data[0]) , data[1] ])[0].id;
                var newid = alasql('SELECT MAX(id) + 1 AS id FROM hist')[0].id;
                var previd = alasql('SELECT MAX(id) AS id FROM hist WHERE equip = ' + equipid)[0].id;
                var prevstat = alasql('SELECT qty, balance, stat FROM hist WHERE id = ' + previd)[0];
                var startT = data[6].split(":");
                var sec = data[3]*3600 + data[4]*60; //time to completion from 00:00 of start date
                // update DB
                console.log([newid, equipid, (data[5] + " " + data[6]), prevstat.qty, prevstat.balance, 5, data[7], emp, sec,0]);
                alasql('INSERT INTO hist VALUES(?,?,?,?,?,?,?,?,?,?)', [newid, equipid, (data[5] + " " + data[6]), prevstat.qty, prevstat.balance, 5, data[7], emp, sec,0]);
    
                //update trans
                var transdata = data[2];
                for (var i = 0; i < transdata.length; i++)
                {
                    if (parseInt(transdata[i][1]) != 0)
                    {
                        var stockid = alasql('SELECT id FROM stock WHERE item = ?', [parseInt(transdata[i][0])])[0].id;
                        var newtransid = alasql('SELECT MAX(id) + 1 AS id FROM trans')[0].id;
                        var prevtransid = alasql('SELECT MAX(id) AS id FROM trans WHERE stock = ' + stockid)[0].id;
                        var prevtransstk = alasql('SELECT balance FROM trans WHERE id = ' + (prevtransid))[0].balance;
                        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?,?)', [newtransid, stockid, data[5], -1*transdata[i][1], prevtransstk - transdata[i][1], data[7], 3, emp, sec,0]);
                    }
                }
            }
        }
        else if (form == 'reorder')
        {
            //get data about owner and loc
            var owner = alasql('SELECT code FROM login WHERE emp = ?', [emp])[0].code;
            var loc = alasql('SELECT loc FROM proj WHERE code = ?', [owner])[0];
            console.log(loc);
            if (loc == undefined)
            {
                loc = owner;
            }
            else
            {
                loc = loc.loc;
            }

            // log total cost
            var totalcost = 0;

            for (var i = 0; i < data.length; i++)
            {
                if (access.acclvl == 1)
                {
                    // update total cost
                    totalcost = totalcost + (1*data[i][1] * 1*data[i][2]);

                    potstkid = alasql('SELECT id FROM stock WHERE item = ? AND owner = ?', [ parseInt(data[i][0]), access.code]);
                    poteqpid = alasql('SELECT id FROM equip WHERE item = ? AND owner = ?', [ parseInt(data[i][0]), access.code]);
                    if (poteqpid.length != 0)
                    {
                        var equipid = poteqpid[0].id;
                        var newid = alasql('SELECT MAX(id) + 1 AS id FROM hist')[0].id;
                        var previd =  alasql('SELECT MAX(id) AS id FROM hist WHERE equip = ' + equipid)[0].id;
                        var prevstat = alasql('SELECT qty, balance, stat FROM hist WHERE id = ' + previd)[0];
                        // update DB
                        alasql('INSERT INTO hist VALUES(?,?,?,?,?,?,?,?,?,?)', [newid, equipid, data[i][4], 1*data[i][2], 1*prevstat.balance + 1*data[i][2], 4, "Reorder", emp, 0, data[i][1]]);
                    }
                    else
                    {
                        poteqpid = alasql('SELECT id FROM equip WHERE item = ?', [ parseInt(data[i][0]) ]);
                        if (poteqpid.length != 0)
                        {
                            var equipid = alasql('SELECT MAX(id) + 1 AS id FROM equip')[0].id; //new equip id for unowned item
                            var newid = alasql('SELECT MAX(id) + 1 AS id FROM hist')[0].id;
                            // update hist and equip DB
                            alasql('INSERT INTO hist VALUES(?,?,?,?,?,?,?,?,?,?)', [newid, equipid, data[i][4], 1*data[i][2], 1*data[i][2], 4, "Initial Order", emp, 0, data[i][1]]);
                            alasql('INSERT INTO equip VALUES(?,?,?,?,?,?)', [equipid, data[i][0], loc, owner, 1*data[i][2], 4]);
                        }
                    }
                    if (potstkid.length != 0)
                    {
                        var stockid = potstkid[0].id;
                        var newtransid = alasql('SELECT MAX(id) + 1 AS id FROM trans')[0].id;
                        var prevtransid = alasql('SELECT MAX(id) AS id FROM trans WHERE stock = ' + stockid)[0].id;
                        var prevtransstk = alasql('SELECT balance FROM trans WHERE id = ' + (prevtransid))[0].balance;
                        // update db
                        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?,?)', [newtransid, stockid, data[i][4], 1*data[i][2], 1*prevtransstk + 1*data[i][2], "Reorder", 2, emp, 0, data[i][1]]);
                    }
                    else
                    {
                        potstkid = alasql('SELECT id FROM stock WHERE item = ?', [ parseInt(data[i][0]) ]);
                        if (potstkid.length != 0)
                        {
                            var stockid = alasql('SELECT MAX(id) + 1 AS id FROM stock')[0].id; //new stock id for unowned item
                            var newtransid = alasql('SELECT MAX(id) + 1 AS id FROM trans')[0].id;
                            // update trans and stock db
                            alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?,?)', [newtransid, stockid, data[i][4], 1*data[i][2], 1*data[i][2], "Initial Order", 2, emp, 0, data[i][1]]);
                            alasql('INSERT INTO stock VALUES(?,?,?,?,?,?,?)', [stockid, data[i][0], loc, owner, 1*data[i][2],2,0]);
                        }
                    }
                }
                else
                {
                    potstkid = alasql('SELECT id FROM stock WHERE item = ? AND owner = ?', [ parseInt(data[i][0]), access.code]);
                    poteqpid = alasql('SELECT id FROM equip WHERE item = ? AND owner = ?', [ parseInt(data[i][0]), access.code]);
                    if (poteqpid.length != 0)
                    {
                        var equipid = poteqpid[0].id;
                        var newid = alasql('SELECT MAX(id) + 1 AS id FROM hist')[0].id;
                        var previd =  alasql('SELECT MAX(id) AS id FROM hist WHERE equip = ' + equipid)[0].id;
                        var prevstat = alasql('SELECT qty, balance, stat FROM hist WHERE id = ' + previd)[0];
                        // update DB
                        alasql('INSERT INTO hist VALUES(?,?,?,?,?,?,?,?,?,?)', [newid, equipid, data[i][4], 1*data[i][2], 1*prevstat.balance + 1*data[i][2], 5, "Reorder", emp, 0], data[i][1]);
                    }
                    else
                    {
                        poteqpid = alasql('SELECT id FROM equip WHERE item = ?', [ parseInt(data[i][0]) ]);
                        if (poteqpid.length != 0)
                        {
                            var equipid = alasql('SELECT MAX(id) + 1 AS id FROM equip')[0].id; //new equip id for unowned item
                            var newid = alasql('SELECT MAX(id) + 1 AS id FROM hist')[0].id;
                            // update hist and equip DB
                            alasql('INSERT INTO hist VALUES(?,?,?,?,?,?,?,?,?,?)', [newid, equipid, data[i][4], 1*data[i][2], 1*data[i][2], 5, "Initial Order", emp, 0, data[i][1]]);
                            alasql('INSERT INTO equip VALUES(?,?,?,?,?,?)', [equipid, data[i][0], loc, owner, 1*data[i][2], 5]);
                        }
                    }
                    if (potstkid.length != 0)
                    {
                        var stockid = potstkid[0].id;
                        var newtransid = alasql('SELECT MAX(id) + 1 AS id FROM trans')[0].id;
                        var prevtransid = alasql('SELECT MAX(id) AS id FROM trans WHERE stock = ' + stockid)[0].id;
                        var prevtransstk = alasql('SELECT balance FROM trans WHERE id = ' + (prevtransid))[0].balance;
                        // update db
                        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?,?)', [newtransid, stockid, data[i][4], 1*data[i][2], 1*prevtransstk + 1*data[i][2], "Reorder", 3, emp, 0, data[i][1]]);
                    }
                    else
                    {
                        potstkid = alasql('SELECT id FROM stock WHERE item = ?', [ parseInt(data[i][0]) ]);
                        if (potstkid.length != 0)
                        {
                            var stockid = alasql('SELECT MAX(id) + 1 AS id FROM stock')[0].id; //new stock id for unowned item
                            var newtransid = alasql('SELECT MAX(id) + 1 AS id FROM trans')[0].id;
                            // update trans and stock db (because new stock of existing item)
                            alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?,?)', [newtransid, stockid, data[i][4], 1*data[i][2], 1*data[i][2], "Initial Order", 3, emp, 0, data[i][1]]);
                            alasql('INSERT INTO stock VALUES(?,?,?,?,?,?,?)', [stockid, data[i][0], loc, owner, 1*data[i][2],3,0]);
                        }
                    }
                }
            }

            //budget update
            var projbudget = alasql('SELECT budget FROM proj WHERE code = "' + access.code + '"')[0];
            var labbudget = alasql('SELECT budget FROM lab WHERE code = "' + access.code + '"')[0];
            
            if (projbudget == undefined)
            {
                var currentbudget = labbudget.budget;
                var remainder = (1*currentbudget - 1*totalcost);
                alasql('UPDATE lab SET budget = ' + remainder.toFixed(2) + ' WHERE code = "' + access.code + '"');
            }
            else
            {
                var currentbudget = projbudget.budget;
                var remainder = (1*currentbudget - 1*totalcost);
                alasql('UPDATE proj SET budget = ' + remainder.toFixed(2) + ' WHERE code = "' + access.code + '"');
            }
        }
        else if (form == 'newitem')
        {
            var lead = 0;
            //get data about owner and loc
            var owner = alasql('SELECT code FROM login WHERE emp = ?', [emp])[0].code;
            var loc = alasql('SELECT loc FROM proj WHERE code = ?', [owner])[0];

            // log total cost
            var totalcost = 0;

            if (loc == undefined)
            {
                loc = owner;
            }
            else
            {
                loc = loc.loc;
            }
            for (var i = 0; i < data.length; i++)
            {
                var kind = alasql('SELECT id, cls FROM kind WHERE descr = ?', [data[i][0]])[0];
                if (access.acclvl == 1)
                {
                    totalcost = totalcost + (1*data[i][3] * 1*data[i][8]);
                    if (kind.cls == 'Equipment')
                    {
                        // update hist DB
                        var equipid = alasql('SELECT MAX(id) + 1 AS id FROM equip')[0].id; //new equip id for unowned item
                        var newid = alasql('SELECT MAX(id) + 1 AS id FROM hist')[0].id;
                        alasql('INSERT INTO hist VALUES(?,?,?,?,?,?,?,?,?,?)', [newid, equipid, data[i][5], 1*data[i][3], 1*data[i][3], 4, data[i][9], emp, 0, data[i][8]]);
                        // update equip DB
                        var itemid = alasql('SELECT MAX(id) + 1 AS id FROM item')[0].id;
                        alasql('INSERT INTO equip VALUES(?,?,?,?,?,?)', [equipid, itemid, loc, owner, 1*data[i][3], 4]);
                        // update item DB
                        alasql('INSERT INTO item VALUES(?,?,?,?)', [itemid, kind.id, data[i][1], data[i][7]]);
                        // update source DB
                        var srcid = alasql('SELECT MAX(id) + 1 AS id FROM src')[0].id;
                        alasql('INSERT INTO src VALUES(?,?,?,?,?,?)', [srcid, itemid, data[i][2], data[i][8], 1, data[i][6]]);
                    }
                    else if (kind.cls == 'Perishables')
                    {
                        // update hist DB
                        var stockid = alasql('SELECT MAX(id) + 1 AS id FROM stock')[0].id; //new equip id for unowned item
                        var newtransid = alasql('SELECT MAX(id) + 1 AS id FROM trans')[0].id;
                        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?,?)', [newtransid, stockid, data[i][5], 1*data[i][3], 1*data[i][3], data[i][9], 2, emp, 0, data[i][8]]);
                        // update equip DB
                        var itemid = alasql('SELECT MAX(id) + 1 AS id FROM item')[0].id;
                        alasql('INSERT INTO stock VALUES(?,?,?,?,?,?,?)', [stockid, itemid, loc, owner, 1*data[i][3],2,0]);
                        // update item DB
                        alasql('INSERT INTO item VALUES(?,?,?,?)', [itemid, kind.id, data[i][1], data[i][7]]);
                        // update source DB
                        var srcid = alasql('SELECT MAX(id) + 1 AS id FROM src')[0].id;
                        alasql('INSERT INTO src VALUES(?,?,?,?,?,?)', [srcid, itemid, data[i][2], data[i][8], 1, data[i][6]]);
                    }
                    if (i == 0) //store lead val
                    {
                        lead = itemid;
                    }
                    if (i > 0) //update dep DB
                    {
                        var lag = itemid;
                        var depid = alasql('SELECT MAX(id) + 1 AS id FROM dep')[0].id;
                        alasql('INSERT INTO dep VALUES(?,?,?)', [depid, lead, lag]);
                    }
                }
                else
                {
                    if (kind.cls == 'Equipment')
                    {
                        // update hist DB
                        var equipid = alasql('SELECT MAX(id) + 1 AS id FROM equip')[0].id; //new equip id for unowned item
                        var newid = alasql('SELECT MAX(id) + 1 AS id FROM hist')[0].id;
                        alasql('INSERT INTO hist VALUES(?,?,?,?,?,?,?,?,?,?)', [newid, equipid, data[i][5], 1*data[i][3], 1*data[i][3], 5, data[i][9], emp, 0, data[i][8]]);
                        // update equip DB
                        var itemid = alasql('SELECT MAX(id) + 1 AS id FROM item')[0].id;
                        alasql('INSERT INTO equip VALUES(?,?,?,?,?,?)', [equipid, itemid, loc, owner, 1*data[i][3], 5]);
                        // update item DB
                        alasql('INSERT INTO item VALUES(?,?,?,?)', [itemid, kind.id, data[i][1], data[i][7]]);
                        // update source DB
                        var srcid = alasql('SELECT MAX(id) + 1 AS id FROM src')[0].id;
                        alasql('INSERT INTO src VALUES(?,?,?,?,?,?)', [srcid, itemid, data[i][2], data[i][8], 1, data[i][6]]);
                    }
                    else if (kind.cls == 'Perishables')
                    {
                        // update hist DB
                        var stockid = alasql('SELECT MAX(id) + 1 AS id FROM stock')[0].id; //new equip id for unowned item
                        var newtransid = alasql('SELECT MAX(id) + 1 AS id FROM trans')[0].id;
                        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?,?)', [newtransid, stockid, data[i][5], 1*data[i][3], 1*data[i][3], data[i][9], 3, emp, 0, data[i][8]]);
                        // update equip DB
                        var itemid = alasql('SELECT MAX(id) + 1 AS id FROM item')[0].id;
                        alasql('INSERT INTO stock VALUES(?,?,?,?,?,?,?)', [stockid, itemid, loc, owner, 1*data[i][3],3,0]);
                        // update item DB
                        alasql('INSERT INTO item VALUES(?,?,?,?)', [itemid, kind.id, data[i][1], data[i][7]]);
                        // update source DB
                        var srcid = alasql('SELECT MAX(id) + 1 AS id FROM src')[0].id;
                        alasql('INSERT INTO src VALUES(?,?,?,?,?,?)', [srcid, itemid, data[i][2], data[i][8], 1, data[i][6]]);
                    }
                    if (i == 0) //store lead val
                    {
                        lead = itemid;
                    }
                    if (i > 0) //update dep DB
                    {
                        var lag = itemid;
                        var depid = alasql('SELECT MAX(id) + 1 AS id FROM dep')[0].id;
                        alasql('INSERT INTO dep VALUES(?,?,?)', [depid, lead, lag]);
                    }
                }
            }

            //budget update
            var projbudget = alasql('SELECT budget FROM proj WHERE code = "' + access.code + '"')[0];
            var labbudget = alasql('SELECT budget FROM lab WHERE code = "' + access.code + '"')[0];
            
            if (projbudget == undefined)
            {
                var currentbudget = labbudget.budget;
                var remainder = (1*currentbudget - 1*totalcost);
                alasql('UPDATE lab SET budget = ' + remainder.toFixed(2) + ' WHERE code = "' + access.code + '"');
            }
            else
            {
                var currentbudget = projbudget.budget;
                var remainder = (1*currentbudget - 1*totalcost);
                alasql('UPDATE proj SET budget = ' + remainder.toFixed(2) + ' WHERE code = "' + access.code + '"');
            }
        }
        //update trans database
        var data_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
        var data_qty = (-1)*parseInt(data[2]);
        // TO FIGURE OUT BALANCE CALC - LOOK AT SAMPE STOCK-FORM.JS!
        // alasql('INSERT INTO ' + target + ' VALUES(?,?,?,?,?,?,?)', [ data_id, data[0], data[3], (-1)*parseInt(data[2]), balance + data_qty, data[5], 3]);
        
        //show confirmation (redo text and remove button)
        $('#cfm_modal #buttoncontainer').addClass("w3-hide");
        $('#cfm_modal #cfmtext').empty();
        $('#cfm_modal #cfmtext').append('<span>Form submitted.</span>');
    
        //reset data of Perishables Form
        $('select[name="p_opt"]').val(-1);
        $('select[name="p_loc"]').val(-1);
        $('input[name="p_qty"]').val(1);
        $('input[name="p_pud"]').val(Date.now());
        $('input[name="p_put"]').val(Date.now());
        $('input[name="p_memo"]').val("");
    
        //reset data of Equipment Form
        $('select[name="e_opt"]').val(-1);
        $('select[name="e_loc"]').val(-1);
        $('input[name="e_dur_h"]').val(0);
        $('input[name="e_dur_m"]').val(0);
        $('input[name="e_str_d"]').val(Date.now());
        $('input[name="e_str_t"]').val(Date.now());
        $('input[name="e_memo"]').val("");
        $('div[name="depopt"]').removeClass("w3-show");
    
        //reset data of Reorder Form
        $('select[name="r_item"]').val(-1);
        $('#tbody-reorder').empty();
        $('span[name="total"]').empty();
        $('span[name="remainder"]').empty();
        remainder = initial;
    
        //reset data of New Item Form
        $('select[name="b_cat"]').val(-1);
        $('input[name="b_opt"]').val("");
        $('input[name="b_src"]').val("");
        $('input[name="b_cont"]').val("");
        $('input[name="b_qty"]').val(0);
        $('input[name="b_unit"]').val("");
        $('input[name="b_price"]').val("");
        $('input[name="b_ord_d"]').val(Date.now());
        $('input[name="b_del_d"]').val(Date.now());
        $('input[name="b_memo"]').val("");
        $('span[name="total"]').empty();
        $('span[name="remainder_new"]').empty();
        $('a[name="lagTog"]').empty();
        $('a[name="lagTog"]').append('Do you want to add dependencies?');
        $('a[name="lagTog"]').addClass("w3-hide");
        $('div[name="lagcontent"]').empty();
        remainder = initial;
        lagcounter = 0;
        
    }