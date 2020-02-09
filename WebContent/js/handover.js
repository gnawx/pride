function handover()
{
    document.getElementsByName("mine")[0].click(); //simulate click on tabs

    var subbtn = $('button[name="handsub"]');
    var targetuser = alasql('SELECT name, pos, code FROM login WHERE acclvl = 1 AND emp != ?', [emp]);
    if (subbtn.hasClass("w3-hide")) //if feature not displayed
    {
        subbtn.removeClass('w3-hide'); //display submit button
        $('button[name="handover"]').removeClass("w3-black");
        $('button[name="handover"]').addClass("w3-blue");
        
        $('#Mine #thead-per tr').append('<th>Target</th>'); //add per header
        $('#Mine #thead-eqp tr').append('<th>Target</th>'); //add eqp header

        //do tbody-per first
        var percontent = $('#Mine #tbody-per').children();
        for (var i = 0; i < percontent.length; i++)
        {
            var rowid = percontent.eq(i).attr('id');
            var tr = $('#Mine #tbody-per #' + rowid);
            var td = $('<td name="tgtopt"></td>');
            var select = $('<select class="w3-select w3-round w3-light-grey" name="target"></select>');
            select.append('<option value="-1" disabled selected>Select Target</option>');
            for (var j = 0; j < targetuser.length; j++)
            {
                var opt = '<option value="' + targetuser[j].code + '">' + targetuser[j].name + ", " + targetuser[j].pos + '</option>'
                select.append(opt);
            }
            select.appendTo(td);
            td.appendTo(tr);
        }

        //then do tbody-eqp
        var eqpcontent = $('#Mine #tbody-eqp').children();
        for (var i = 0; i < eqpcontent.length; i++)
        {
            var rowid = eqpcontent.eq(i).attr('id');
            var tr = $('#Mine #tbody-eqp #' + rowid);
            var td = $('<td name="tgtopt"></td>');
            var select = $('<select class="w3-select w3-round w3-light-grey" name="target"></select>');
            select.append('<option value="-1" disabled selected>Select Target</option>');
            for (var j = 0; j < targetuser.length; j++)
            {
                var opt = '<option value="' + targetuser[j].code + '">' + targetuser[j].name + ", " + targetuser[j].pos + '</option>'
                select.append(opt);
            }
            select.appendTo(td);
            td.appendTo(tr);
        }
    }
    else //if feature displayed
    {
        subbtn.addClass('w3-hide');
        $('button[name="handover"]').addClass("w3-black");
        $('button[name="handover"]').removeClass("w3-blue");

        $('#Mine #thead-per tr th:last').remove();
        $('#Mine #thead-eqp tr th:last').remove();

        //remove body contents
        $('td[name="tgtopt"]').remove();
    }
}

function handSub()
{
    //do text
    $('#cfm_modal #cfmtext').empty();
    $('#cfm_modal #cfmtext').append('<span>Are you sure you want to submit?</span>');

    var btnstr = '<button type="button" class="w3-button w3-green w3-round w3-margin" \
                    onclick="finishHandover()"> \
                    <span class="glyphicon glyphicon-ok"></span> Yes \
                  </button> \
                    <button type="button" class="w3-button w3-red w3-round w3-margin" \
                     onclick="document.getElementById(' + "'cfm_modal'" + ').style.display=' +
                     "'none'" + '" ><span class="glyphicon glyphicon-remove"></span> No \
                </button>'
    $('#cfm_modal #buttoncontainer').empty();
    $('#cfm_modal #buttoncontainer').append(btnstr);
    $('#cfm_modal #buttoncontainer').removeClass("w3-hide");

    document.getElementById('cfm_modal').style.display='block';
}

function finishHandover()
{
    //do tbody-per first
    var percontent = $('#Mine #tbody-per').children();
    for (var i = 0; i < percontent.length; i++)
    {
        var fromstockid = percontent.eq(i).attr('id'); //stock id of closed proj/lab
        var itemid = alasql('SELECT item FROM stock WHERE id = ' + fromstockid)[0].item; //item id
        var target = $('#Mine #tbody-per #' + fromstockid + ' select').val(); //receiver of item
        if (target != null)
        {
            if (target.startsWith("P") == true)
            {
                var loc = alasql('SELECT loc FROM proj WHERE code = ?', [target])[0].loc;
            }
            else
            {
                var loc = target;
            }
            var tostockid = alasql('SELECT id FROM stock WHERE item = ' + itemid + ' AND owner = "' + target + '"');
            if (tostockid.length == 0) //if owner does not have the item
            {
                var prevtransid = alasql('SELECT MAX(id) AS id FROM trans WHERE stock = ' + fromstockid)[0].id;
                var newtransid = alasql('SELECT MAX(id) + 1 AS id FROM trans')[0].id;
                var prevtransdet = alasql('SELECT qty, balance FROM trans WHERE id = ?', [prevtransid])[0];
                var srcdetail = alasql('SELECT name, pos FROM login WHERE emp = ?', [emp])[0];
                var memo = "Transfer from " + srcdetail.name + ", " + srcdetail.pos;
                alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?,?)', [newtransid, fromstockid,new Date().toISOString().slice(0,10), prevtransdet.qty, prevtransdet.balance, memo, 1, emp, 0, 0]);
                alasql('UPDATE stock SET stat = 1, loc = "' + loc + '", owner = "' + target + '" WHERE id = ' + fromstockid);
            }
            else
            {
                var prevtransid = alasql('SELECT MAX(id) AS id FROM trans WHERE stock = ' + tostockid)[0].id;
                var newtransid = alasql('SELECT MAX(id) + 1 AS id FROM trans')[0].id;
                var prevtransbal = alasql('SELECT balance FROM trans WHERE id = ?', [prevtransid])[0].balance;
                var addeddbal = alasql('SELECT balance FROM stock WHERE id = ?', [fromstockid])[0].balance;
                var srcdetail = alasql('SELECT name, pos FROM login WHERE emp = ?', [emp])[0];
                var memo = "Transfer from " + srcdetail.name + ", " + srcdetail.pos;
                alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?,?)', [newtransid, tostockid,new Date().toISOString().slice(0,10), addedbal, prevtransbal + addedbal, memo, 1, emp, 0, 0]);
                alasql('UPDATE stock SET balance = ' + prevtransbal + addedbal + ' WHERE id = ' + tostockid);
            }
            $('#Mine #tbody-per #' + fromstockid).remove();
        }
    }

    //then do equip
    var eqpcontent = $('#Mine #tbody-eqp').children();
    for (var i = 0; i < eqpcontent.length; i++)
    {
        var fromequipid = eqpcontent.eq(i).attr('id'); //stock id of closed proj/lab
        var itemid = alasql('SELECT item FROM equip WHERE id = ' + fromequipid)[0].item; //item id
        var target = $('#Mine #tbody-eqp #' + fromequipid + ' select').val(); //receiver of item
        if (target != null)
        {
            if (target.startsWith("P") == true)
            {
                var loc = alasql('SELECT loc FROM proj WHERE code = ?', [target])[0].loc;
            }
            else
            {
                var loc = target;
            }
            var toequipid = alasql('SELECT id FROM stock WHERE item = ' + itemid + ' AND owner = "' + target + '"');
            if (toequipid.length == 0) //if owner does not have the item
            {
                var prevhistid = alasql('SELECT MAX(id) AS id FROM hist WHERE equip = ' + fromequipid)[0].id;
                var newhistid = alasql('SELECT MAX(id) + 1 AS id FROM hist')[0].id;
                var prevhistdet = alasql('SELECT qty, balance FROM hist WHERE id = ?', [prevhistid])[0];
                var srcdetail = alasql('SELECT name, pos FROM login WHERE emp = ?', [emp])[0];
                var memo = "Transfer from " + srcdetail.name + ", " + srcdetail.pos;
                alasql('INSERT INTO hist VALUES(?,?,?,?,?,?,?,?,?,?)', [newhistid, fromequipid,new Date().toISOString().slice(0,10), prevhistdet.qty, prevhistdet.balance, 1, memo, emp, 0, 0]);
                alasql('UPDATE equip SET stat = 1, loc = "' + loc + '", owner = "' + target + '" WHERE id = ' + fromequipid);
            }
            else
            {
                var prevhistid = alasql('SELECT MAX(id) AS id FROM hist WHERE equip = ' + toequipid)[0].id;
                var newhistid = alasql('SELECT MAX(id) + 1 AS id FROM hist')[0].id;
                var prevhistbal = alasql('SELECT balance FROM hist WHERE id = ?', [prevhistid])[0].balance;
                var addeddbal = alasql('SELECT balance FROM equip WHERE id = ?', [fromequipid])[0].balance;
                var srcdetail = alasql('SELECT name, pos FROM login WHERE emp = ?', [emp])[0];
                var memo = "Transfer from " + srcdetail.name + ", " + srcdetail.pos;
                alasql('INSERT INTO hist VALUES(?,?,?,?,?,?,?,?,?,?)', [newhistid, toequipid, new Date().toISOString().slice(0,10), addedbal, prevhistbal + addedbal, 1, memo, emp, 0, 0]);
                alasql('UPDATE equip SET balance = ' + prevtransbal + addedbal + ' WHERE id = ' + toequipid);
            }
            $('#Mine #tbody-eqp #' + fromequipid).remove();
        }
    }
    
    //show confirmation (redo text and remove button)
    $('#cfm_modal #buttoncontainer').addClass("w3-hide");
    $('#cfm_modal #cfmtext').empty();
    $('#cfm_modal #cfmtext').append('<span>Form submitted.</span>');
}