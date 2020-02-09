// tracking submit button fx
function trackSubmit(track){
     //do text
     $('#cfm_modal #cfmtext').empty();
     $('#cfm_modal #cfmtext').append('<span>Are you sure you want to submit?</span>');

     //and then button
     var btnstr = '<button type="button" class="w3-button w3-green w3-round w3-margin" \
                     onclick="cfmData(' + "'" + track + "'" + ')"> \
                     <span class="glyphicon glyphicon-ok"></span> Yes \
                 </button> \
                     <button type="button" class="w3-button w3-red w3-round w3-margin" \
                     onclick="document.getElementById(' + "'cfm_modal'" + ').style.display=' +
                     "'none'" + '" ><span class="glyphicon glyphicon-remove"></span> No \
                 </button>'
     $('#cfm_modal #buttoncontainer').empty();
     $('#cfm_modal #buttoncontainer').append(btnstr);
     $('#cfm_modal #buttoncontainer').removeClass("w3-hide");

     //and then show modal
     document.getElementById('cfm_modal').style.display='block';
}

function cfmData(track)
{
    //get access level of user
    var access = alasql('SELECT code, acclvl FROM login WHERE emp = "' + emp + '"')[0];
    
    // procurement form fx
    if (track == 'procDelivery')
    {
        var translist = $('#Delivery #tbody-per').children();
        for (var i = 0; i < translist.length; i++)
        {
            var transid = translist.eq(i).attr('id');
            //delivered
            if ($('input[name="'+ transid +'"]').is(':checked') == true)
            {
                var stockid = alasql('SELECT stock FROM trans WHERE id = ' + transid)[0].stock;
                var stockstat = alasql('SELECT stat FROM stock WHERE id = ' + stockid)[0].stat;
                alasql('UPDATE trans SET stat = 1 WHERE id = ' + transid);
                if (stockstat != 1)
                {
                    alasql('UPDATE stock SET stat = 1 WHERE id = ' + stockid);                    
                }
                else
                {
                    var newbalance = alasql('SELECT balance FROM trans WHERE id = ' + transid)[0].balance;
                    alasql('UPDATE stock SET balance = ' + newbalance + ' WHERE id = ' + stockid);
                }
                $('#' + transid).remove();
            }
        }
        var histlist = $('#Delivery #tbody-eqp').children();
        for (var i = 0; i < histlist.length; i++)
        {
            var histid = histlist.eq(i).attr('id');
            //delivered
            if ($('input[name="'+ histid +'"]').is(':checked') == true)
            {
                var equipid = alasql('SELECT equip FROM hist WHERE id = ' + histid)[0].equip;
                var equipstat = alasql('SELECT stat FROM equip WHERE id = ' + equipid)[0].stat;
                alasql('UPDATE hist SET stat = 1 WHERE id = ' + histid);
                if(equipstat != 1)
                {
                    alasql('UPDATE equip SET stat = 1 WHERE id = ' + equipid);                    
                }
                else
                {
                    var newbalance = alasql('SELECT balance FROM hist WHERE id = ' + histid)[0].balance;
                    alasql('UPDATE equip SET balance = ' + newbalance + ' WHERE id = ' + equipid);  
                }
                $('#' + histid).remove();
            }
        }
    }
    else if (track == 'procApproval')
    {
        var translist = $('#Approval #tbody-per').children();
        for (var i = 0; i < translist.length; i++)
        {
            var transid = translist.eq(i).attr('id');
            var transcheck = $('form[name="' + transid + '"] input[name="yesno"]');
            //approved
            if (transcheck.eq(0).is(':checked') == true)
            {
                var stockid = alasql('SELECT stock FROM trans WHERE id = ' + transid)[0].stock;
                var stockstat = alasql('SELECT stat FROM stock WHERE id = ' + stockid)[0].stat;
                alasql('UPDATE trans SET stat = 2 WHERE id = ' + transid);
                if (stockstat == 3)
                {
                    alasql('UPDATE stock SET stat = 2 WHERE id = ' + stockid);
                }

                //budget update
                var transcost = alasql('SELECT qty, punit FROM trans WHERE id = ' + transid)[0];
                var totalcost = 1*transcost.qty * 1*transcost.punit;

                var projbudget = alasql('SELECT budget FROM proj WHERE code = "' + access.code + '"');
                var labbudget = alasql('SELECT budget FROM lab WHERE code = "' + access.code + '"');
                
                if (projbudget == [])
                {
                    var currentbudget = labbudget[0].budget;
                    var remainder = (1*currentbudget - 1*totalcost);
                    alasql('UPDATE lab SET budget = ' + remainder.toFixed(2) + ' WHERE code = "' + access.code + '"');
                }
                else
                {
                    var currentbudget = projbudget[0].budget;
                    var remainder = (1*currentbudget - 1*totalcost);
                    alasql('UPDATE proj SET budget = ' + remainder.toFixed(2) + ' WHERE code = "' + access.code + '"');
                }

                $('#' + transid).remove();
            }
            else if (transcheck.eq(1).is(':checked') == true)
            {
                alasql('DELETE FROM trans WHERE id = ' + transid);
                if (stockstat == 3)
                {
                    alasql('DELETE FROM stock WHERE id = ' + stockid);
                }
                $('#' + transid).remove();
            }
        }
        var histlist = $('#Approval #tbody-eqp').children();
        for (var i = 0; i < histlist.length; i++)
        {
            var histid = histlist.eq(i).attr('id');
            var histcheck = $('form[name="' + histid + '"] input[name="yesno"]');
            //approved
            if (histcheck.eq(0).is(':checked') == true)
            {
                var equipid = alasql('SELECT equip FROM hist WHERE id = ' + histid)[0].equip;
                var equipstat = alasql('SELECT stat FROM equip WHERE id = ' + equipid)[0].stat;
                alasql('UPDATE hist SET stat = 2 WHERE id = ' + histid);
                if (equipstat == 5)
                {
                    alasql('UPDATE equip SET stat = 4 WHERE id = ' + equipid);
                }

                //budget update
                var histcost = alasql('SELECT qty, punit FROM hist WHERE id = ' + histid)[0];
                var totalcost = 1*histcost.qty * 1*histcost.punit;

                var projbudget = alasql('SELECT budget FROM proj WHERE code = "' + access.code + '"');
                var labbudget = alasql('SELECT budget FROM lab WHERE code = "' + access.code + '"');
                
                if (projbudget.length == 0)
                {
                    var currentbudget = labbudget[0].budget;
                    var remainder = (1*currentbudget - 1*totalcost);
                    alasql('UPDATE lab SET budget = ' + remainder.toFixed(2) + ' WHERE code = "' + access.code + '"');
                }
                else
                {
                    var currentbudget = projbudget[0].budget;
                    var remainder = (1*currentbudget - 1*totalcost);
                    alasql('UPDATE proj SET budget = ' + remainder.toFixed(2) + ' WHERE code = "' + access.code + '"');
                }

                $('#' + histid).remove();
            }
            else if (histcheck.eq(1).is(':checked') == true)
            {
                alasql('DELETE FROM hist WHERE id = ' + histid);
                if (equipstat == 5)
                {
                    alasql('DELETE FROM equip WHERE id = ' + equipid);
                }
                $('#' + histid).remove();
            }
        }
    }
    else if (track == 'usageComp')
    {
        var translist = $('#Completion #tbody-per').children();
        for (var i = 0; i < translist.length; i++)
        {
            var transid = translist.eq(i).attr('id');
            //completed
            if ($('input[name="'+ transid +'"]').is(':checked') == true)
            {
                var stockid = alasql('SELECT stock FROM trans WHERE id = ' + transid)[0].stock;
                var stockstat = alasql('SELECT stat FROM stock WHERE id = ' + stockid)[0].stat;
                alasql('UPDATE trans SET stat = 1 WHERE id = ' + transid);
                if (stockstat != 1)
                {
                    alasql('UPDATE stock SET stat = 1 WHERE id = ' + stockid);                    
                }
                else
                {
                    var newbalance = alasql('SELECT balance FROM trans WHERE id = ' + transid)[0].balance;
                    alasql('UPDATE stock SET balance = ' + newbalance + ' WHERE id = ' + stockid);
                }
                $('#' + transid).remove();
            }
        }
        var histlist = $('#Completion #tbody-eqp').children();
        for (var i = 0; i < histlist.length; i++)
        {
            var histid = histlist.eq(i).attr('id');
            //completed
            if ($('input[name="'+ histid +'"]').is(':checked') == true)
            {
                var equipid = alasql('SELECT equip FROM hist WHERE id = ' + histid)[0].equip;
                var equipstat = alasql('SELECT stat FROM equip WHERE id = ' + equipid)[0].stat;
                alasql('UPDATE hist SET stat = 1, time = 0 WHERE id = ' + histid);
                if(equipstat != 1)
                {
                    alasql('UPDATE equip SET stat = 1 WHERE id = ' + equipid);                    
                }
                else
                {
                    var newbalance = alasql('SELECT balance FROM hist WHERE id = ' + histid)[0].balance;
                    alasql('UPDATE equip SET balance = ' + newbalance + ' WHERE id = ' + equipid);  
                }
                var deps = $('#Completion #tbody-eqp p');
                for (var j = 0; j < deps.length; j++)
                {
                    var transid = deps.eq(j).attr('name');
                    var stockid = alasql('SELECT stock FROM trans WHERE id = ' + transid)[0].stock;
                    var stockstat = alasql('SELECT stat FROM stock WHERE id = ' + stockid)[0].stat;
                    alasql('UPDATE trans SET stat = 1 WHERE id = ' + transid);
                    if (stockstat != 1)
                    {
                        alasql('UPDATE stock SET stat = 1 WHERE id = ' + stockid);                    
                    }
                    else
                    {
                        var newbalance = alasql('SELECT balance FROM trans WHERE id = ' + transid)[0].balance;
                        alasql('UPDATE stock SET balance = ' + newbalance + ' WHERE id = ' + stockid);
                    }
                }
                $('#' + histid).remove();
            }
        }
    }
    else if (track == 'usageApproval')
    {
        var translist = $('#Approval #tbody-per').children();
        for (var i = 0; i < translist.length; i++)
        {
            var transid = translist.eq(i).attr('id');
            var transcheck = $('form[name="' + transid + '"] input[name="yesno"]');
            //approved
            if (transcheck.eq(0).is(':checked') == true)
            {
                var stockid = alasql('SELECT stock FROM trans WHERE id = ' + transid)[0].stock;
                var stockstat = alasql('SELECT stat FROM stock WHERE id = ' + stockid)[0].stat;
                alasql('UPDATE trans SET stat = 2 WHERE id = ' + transid);

                $('#' + transid).remove();
            }
            else if (transcheck.eq(1).is(':checked') == true)
            {
                alasql('DELETE FROM trans WHERE id = ' + transid);
                
                $('#' + transid).remove();
            }
        }
        var histlist = $('#Approval #tbody-eqp').children();
        for (var i = 0; i < histlist.length; i++)
        {
            var histid = histlist.eq(i).attr('id');
            var histcheck = $('form[name="' + histid + '"] input[name="yesno"]');
            //approved
            if (histcheck.eq(0).is(':checked') == true)
            {
                var equipid = alasql('SELECT equip FROM hist WHERE id = ' + histid)[0].equip;
                var equipstat = alasql('SELECT stat FROM equip WHERE id = ' + equipid)[0].stat;
                alasql('UPDATE hist SET stat = 1 WHERE id = ' + histid);
                var deps = $('#Approval #tbody-eqp p');
                for (var j = 0; j < deps.length; j++)
                {
                    var transid = deps.eq(j).attr('name');
                    var stockid = alasql('SELECT stock FROM trans WHERE id = ' + transid)[0].stock;
                    var stockstat = alasql('SELECT stat FROM stock WHERE id = ' + stockid)[0].stat;
                    alasql('UPDATE trans SET stat = 2 WHERE id = ' + transid);
                }
                $('#' + histid).remove();
            }
            else if (histcheck.eq(1).is(':checked') == true)
            {
                alasql('DELETE FROM hist WHERE id = ' + histid);
                var deps = $('#Approval #tbody-eqp p');
                for (var j = 0; j < deps.length; j++)
                {
                    var transid = deps.eq(j).attr('name');
                    var stockid = alasql('SELECT stock FROM trans WHERE id = ' + transid)[0].stock;
                    var stockstat = alasql('SELECT stat FROM stock WHERE id = ' + stockid)[0].stat;
                    alasql('DELETE FROM trans WHERE id = ' + transid);
                }
                $('#' + histid).remove();
            }
        }
    }

    //show confirmation (redo text and remove button)
    $('#cfm_modal #buttoncontainer').addClass("w3-hide");
    $('#cfm_modal #cfmtext').empty();
    $('#cfm_modal #cfmtext').append('<span>Submission successful.</span>');
}