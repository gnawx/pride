function openModalP(id, target) //perishables detail modal
{
    // reset modal content
    $('#det_name').empty();
    $('#det_photo').empty();
    $('#det_type').empty();
    $('#det_owner').empty();
    $('#det_loc').empty();
    $('#det_source').empty();
    $('#det_stock').empty();
    $("#det_stat").empty();
    $('#hist_head').empty();
    $('#hist_body').empty();
    $('#buttoncontainer').empty();

    // get data from db
    p_details = alasql('SELECT item, loc, owner, balance, threshold FROM stock WHERE id = ?', [id]);
    p_item = alasql('SELECT kind, detail, unit FROM item WHERE id = ?', [p_details[0].item]);
    p_kind = alasql('SELECT descr, cls FROM kind WHERE id = ?', [p_item[0].kind]);
    p_source = alasql('SELECT maker FROM src WHERE item = ?', [p_details[0].item]);
    
    // insert modal item detail content
    $('#det_name').append(p_item[0].detail);
    $('#det_photo').append('<img src="img/' + p_details[0].item + '.jpg" alt="" style="width:100%;">');
    $('#det_type').append('<td>Type:</td><td>' + p_kind[0].descr + '</td>');
    $('#det_owner').append('<td>Owner:</td><td>' + DB.own(p_details[0].owner) + '</td>');
    $('#det_loc').append('<td>Location:</td><td>' + DB.locate(p_details[0].loc) + '</td>');
    $('#det_source').append('<td>Source:</td>')
    var tr = ($('<td></td>'));
    for (var i = 0; i < p_source.length; i++)
    {
        tr.append(p_source[i].maker);
        if (i < p_source.length-1)
        {
            tr.append(', ');
        }
    }
    tr.appendTo($('#det_source'));
    $('#det_stock').append('<td>Balance:</td>');
    var tr = ($('<td></td>'));
    tr.append('<div class="w3-col s4">' + p_details[0].balance + ' ' + p_item[0].unit + '</div>');
    if (target == "Mine")
    {
        if (p_details[0].threshold != 0)
        {
            tr.append('<div class="w3-col s6 l7 w3-opacity"><span class="w3-right w3-text-grey" name="threshold">Limit: ' + p_details[0].threshold + ' ' + p_item[0].unit + '</span></div>');
            tr.append('<div class="w3-col s2 l1" style="margin-top: 4px;"><a class="w3-tiny w3-right" href="javascript:void(0)" onclick="editThreshold(' + id + ",'" + target + "'" + ')">EDIT</a></div>')
        }
        else if (p_details[0].threshold == 0)
        {
            tr.append('<div class="w3-col s6 l7 w3-opacity"><span class="w3-right w3-text-blue" name="threshold">Limit: ' + p_details[0].threshold + ' ' + p_item[0].unit +
                    '&nbsp;<span class="glyphicon glyphicon-info-sign"></span></span></div>');
            tr.append('<div class="w3-col s2 l1" style="margin-top: 4px;"><a class="w3-tiny w3-right" href="javascript:void(0)" onclick="editThreshold(' + id + ",'" + target + "'" + ')">SET</a></div>')
        }
        tr.appendTo($('#det_stock'));
    }
    else
    {
        $('#det_stock').append('<td>' + p_details[0].balance + ' ' + p_item[0].unit + '</td>');
    }
    
    // insert modal history content
    $("#hist_head").append('<tr> \
                    <th>Date</th> \
                    <th>Memo</th> \
                    <th>Quantity (' + p_item[0].unit +
                    ')</th> \
                    <th>Balance (' + p_item[0].unit +
                    ')</th> \
                    </tr>');

    p_trans = alasql('SELECT date, memo, qty, balance FROM trans WHERE stat = 1 AND stock = ?', [id]);
    
    for (var i = 0; i < p_trans.length; i++)
    {
        var tr = $('<tr></tr>');
        tr.append('<td>' + p_trans[i].date + '</td>');
        tr.append('<td>' + p_trans[i].memo + '</td>');
        tr.append('<td>' + p_trans[i].qty + '</td>');
        tr.append('<td>' + p_trans[i].balance + '</td>');
        tr.prependTo($('#hist_body'));
    }
    
    $('#buttoncontainer').append('<button type="submit" class="w3-button w3-green w3-round w3-margin" \
                            onclick="window.location.assign(' + "'forms.html?emp=" + emp + '&item=' +
                            p_details[0].item + '&loc=' + p_details[0].owner + "&tab=f_Per'" +')">Use</button>')    
    $('#buttoncontainer').append('<button type="submit" class="w3-button w3-orange w3-round w3-margin" \
                            onclick="window.location.assign(' + "'forms.html?emp=" + emp + '&item=' +
                            p_details[0].item + '&loc=' + p_details[0].owner + "&tab=f_Reorder'" + ')">Restock</button>')

    // display modal
    $("#det_stock").removeClass("w3-hide");
    $("#det_stat").addClass("w3-hide");
    document.getElementById('d_modal').style.display='block'
}

function openModalE(id) //equipment detail modal
{
    // reset modal content
    $('#det_name').empty();
    $('#det_photo').empty();
    $('#det_type').empty();
    $('#det_owner').empty();
    $('#det_loc').empty();
    $('#det_source').empty();
    $('#det_stock').empty();
    $("#det_stat").empty();
    $('#hist_head').empty();
    $('#hist_body').empty();
    $('#buttoncontainer').empty();
    
    // get data from db
    e_details = alasql('SELECT item, loc, owner, balance, stat FROM equip WHERE id = ?', [id]);
    e_item = alasql('SELECT kind, detail, unit FROM item WHERE id = ?', [e_details[0].item]);
    e_kind = alasql('SELECT descr, cls FROM kind WHERE id = ?', [e_item[0].kind]);
    e_source = alasql('SELECT maker FROM src WHERE item = ?', [e_details[0].item]);
    
    // insert modal item detail content
    $('#det_name').append(e_item[0].detail);
    $('#det_photo').append('<img src="img/' + e_details[0].item + '.jpg" alt="" style="width:100%;">');
    $('#det_type').append('<td>Type:</td><td>' + e_kind[0].descr + '</td>');
    $('#det_owner').append('<td>Owner:</td><td>' + DB.own(e_details[0].owner) + '</td>');
    $('#det_loc').append('<td>Location:</td><td>' + DB.locate(e_details[0].loc) + '</td>');
    $('#det_source').append('<td>Source:</td>')
    var tr = ($('<td></td>'));
    for (var i = 0; i < e_source.length; i++)
    {
        tr.append(e_source[i].maker);
        if (i < e_source.length-1)
        {
            tr.append(', ');
        }
    }
    tr.appendTo($('#det_source'));
    $('#det_stock').append('<td>Quantity:</td><td>' + e_details[0].balance + ' ' + e_item[0].unit + '</td>');  
    $('#det_stat').append('<td>Status:</td><td>' + DB.stat(e_details[0].stat) + '</td>');  
    
    // insert modal history content
    $("#hist_head").append('<tr> \
                    <th>Date</th> \
                    <th>Memo</th> \
                    <th>Status</th> \
                    </tr>');

    e_hist = alasql('SELECT date, memo, stat FROM hist WHERE equip = ?', [id]);
    
    for (var i = 0; i < e_hist.length; i++)
    {
        var tr = $('<tr></tr>');
        tr.append('<td>' + e_hist[i].date + '</td>');
        tr.append('<td>' + e_hist[i].memo + '</td>');
        tr.append('<td>' + DB.stat(e_hist[i].stat) + '</td>');
        tr.prependTo($('#hist_body'));
    }

    // insert modal action buttons - CALL ANOTHER FX HERE (TO DO)!
    // function MUST check access level of user!
    $('#buttoncontainer').append('<button type="submit" class="w3-button w3-green w3-round w3-margin" \
                                    onclick="window.location.assign(' + "'forms.html?emp=" + emp + '&item=' +
                                    e_details[0].item + '&loc=' + e_details[0].owner + "&tab=f_Eqp'" + ')">Book Usage</button>')
    $('#buttoncontainer').append('<button type="submit" class="w3-button w3-orange w3-round w3-margin" disabled>Check Repair Status</button>')
    $('#buttoncontainer').append('<button type="submit" class="w3-button w3-red w3-round w3-margin" disabled>Arrange for Repair</button>')
    // display modal
    $("#det_stat").removeClass("w3-hide");
    $("#det_stock").removeClass("w3-hide");
    document.getElementById('d_modal').style.display='block'
}

function editThreshold(id, target) //function to show input box to edit threshold set on perishables
{
    var it = alasql('SELECT item FROM stock WHERE id = ?', [id])[0].item;
    var ut = alasql('SELECT unit FROM item WHERE id = ?', [it])[0].unit;
    $('#det_stock span[name="threshold"]').empty();
    var inp = '<div class="w3-col s6"><input class="w3-input w3-tiny" name="newthres" type="number" placeholder="' + ut + '"></div>';
    var btn = '<div class="w3-col s6"><button class="w3-button w3-tiny w3-teal w3-round" type="button" onclick="thresSub(' + id + ",'" + target + "'" + ')"> \
            <span class="glyphicon glyphicon-ok"></span></button>';
    $('#det_stock span[name="threshold"]').append(inp);
    $('#det_stock span[name="threshold"]').append(btn);
}

function thresSub(id, target) //function to update threshold set on perishables
{
    //store new threshold in var
    var newthres = $('#det_stock input[name="newthres"]').val();
    var it = alasql('SELECT item FROM stock WHERE id = ?', [id])[0].item;
    var bal = alasql('SELECT balance FROM stock WHERE id = ?', [id])[0].balance;
    var ut = alasql('SELECT unit FROM item WHERE id = ?', [it])[0].unit;
    //update threshold
    alasql('UPDATE stock SET threshold = ' + newthres + ' WHERE id = ' + id);
    //redo modal display
    $('#det_stock span[name="threshold"]').empty();
    var newstr = 'Limit: ' + newthres + ' ' + ut;
    $('#det_stock span[name="threshold"]').append(newstr);
    $('#det_stock span[name="threshold"]').removeClass($('#det_stock span[name="threshold"]').attr('class'));
    if (newthres != 0)
    {
        $('#det_stock span[name="threshold"]').addClass("w3-text-grey w3-right");
        $('#det_stock a').empty();
        $('#det_stock a').append('EDIT');
    }
    else
    {
        $('#det_stock span[name="threshold"]').addClass("w3-text-blue w3-right");
        $('#det_stock a').empty();
        $('#det_stock a').append('SET');
    }
    //redo table display - Mine
    var namecol = $('#' + target + ' #' + id + ' td[name="detail"]');
    var balcol = $('#' + target + ' #' + id + ' td[name="balance"]');
    var namecolall = $('#All #' + id + ' td[name="detail"]');
    var balcolall = $('#All #' + id + ' td[name="balance"]');
    namecol.children().eq(1).remove(); namecolall.children().eq(1).remove();
    balcol.removeClass(balcol.attr('class')); balcolall.removeClass(balcol.attr('class'));
    if (newthres != 0)
    {
        if (bal <= 0)
        {
            namecol.append('<span class="w3-text-red glyphicon glyphicon-alert"></span>');
            balcol.addClass('w3-text-red');
            namecolall.append('<span class="w3-text-red glyphicon glyphicon-alert"></span>');
            balcolall.addClass('w3-text-red');
            
        }
        else if (bal <= newthres)
        {
            namecol.append('<span class="w3-text-orange glyphicon glyphicon-exclamation-sign"></span>');
            balcol.addClass('w3-text-orange');
            namecolall.append('<span class="w3-text-orange glyphicon glyphicon-exclamation-sign"></span>');
            balcolall.addClass('w3-text-orange');
        }
    }
    else if (newthres == 0)
    {
        namecol.append('<span class="w3-text-blue glyphicon glyphicon-info-sign"></span>');
    }
}