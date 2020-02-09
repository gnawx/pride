// submit function for Perishables
function pSubmit(){    
    //get data
    var itemSub = $('select[name="p_opt"]').val();
    var ownerval = $('select[name="p_loc"]').val();
    var ownerSub = $('select[name="p_loc"] option[value=' + ownerval + ']').eq(0).attr('name');
    var qtySub = $('input[name="p_qty"]').val();
    var pudSub = $('input[name="p_pud"]').val();
    var putSub = $('input[name="p_put"]').val();
    var memoSub = $('input[name="p_memo"]').val();

    //update global p_data variable
    p_data = [itemSub,ownerSub,qtySub,pudSub,putSub,memoSub];

    //Input Check
    var filled = 0;
    if (itemSub == null)
    {
        $('select[name="p_opt"]').addClass("w3-border-red");
        filled = 0;
    }
    else
    {
        $('select[name="p_opt"]').removeClass("w3-border-red");
        if (ownerSub == null)
        {
            $('select[name="p_loc"]').addClass("w3-border-red");
            filled = 0;
        }
        else 
        {
            $('select[name="p_loc"]').removeClass("w3-border-red");
            if (pudSub == "")
            { 
                $('input[name="p_pud"]').addClass("w3-border-red");
                filled = 0;
            }
            else
            {
                $('input[name="p_pud"]').removeClass("w3-border-red");
                if (putSub.length == 0)
                {
                    $('input[name="p_put"]').addClass("w3-border-red");
                    filled = 0;
                }
                else
                {
                    $('input[name="p_put"]').removeClass("w3-border-red");
                    if (memoSub.length == 0)
                    {
                        $('input[name="p_memo"]').addClass("w3-border-red");
                        filled = 0;
                    }
                    else
                    {
                        $('input[name="p_memo"]').removeClass("w3-border-red");
                        filled = 1;
                    }
                }
            }
        }
    }
    
    if (filled == 0)
    {
        $('#f_Per #formproblem').addClass('w3-show');
        $('#f_Per #qtylimit').removeClass('w3-show');
    }
    else
    {
        // Quantity Limit Check
        $('#f_Per #formproblem').removeClass('w3-show');
        var qtylimit = alasql('SELECT balance FROM stock WHERE item = ' +
                itemSub + ' AND owner ="' + ownerSub +'"');

        if (qtySub > qtylimit[0].balance || qtySub < 1)
        {
            $('#f_Per #qtylimit').addClass('w3-show');
            $('input[name="p_qty"]').addClass("w3-border-red");
        }
        else
        {
            $('#f_Per #qtylimit').removeClass('w3-show');
            $('input[name="p_qty"]').removeClass("w3-border-red");

            //do text
            $('#cfm_modal #cfmtext').empty();
            $('#cfm_modal #cfmtext').append('<span>Are you sure you want to submit this form?</span>');

            var btnstr = '<button type="button" class="w3-button w3-green w3-round w3-margin" \
                            onclick="updateData(' + "'perishables'" + ', p_data)"> \
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
    }
}

// submit function for Equipment
function eSubmit(){    
    //get data
    var itemSub = $('select[name="e_opt"]').val();
    var ownerval = $('select[name="e_loc"]').val();
    var ownerSub = $('select[name="e_loc"] option[value=' + ownerval + ']').eq(0).attr('name');
    var qtySub = [];
    var durHSub = $('input[name="e_dur_h"]').val();
    var durMSub = $('input[name="e_dur_m"]').val();
    var strDSub = $('input[name="e_str_d"]').val();
    var strTSub = $('input[name="e_str_t"]').val();
    var memoSub = $('input[name="e_memo"]').val();

    for (var i = 0; i < depitem.length; i++)
    {
        qtySub.push([depitem[i],parseInt($('input[name="p_qty_' + depitem[i] + '"]').val())]);
    }

    //update global e_data variable
    e_data = [itemSub,ownerSub,qtySub,durHSub,durMSub,strDSub,strTSub,memoSub];

    //Input Check
    var filled = 0;
    if (itemSub == null)
    {
        $('select[name="e_opt"]').addClass("w3-border-red");
        filled = 0;
    }
    else
    {
        $('select[name="e_opt"]').removeClass("w3-border-red");
        if (ownerSub == null)
        {
            $('select[name="e_loc"]').addClass("w3-border-red");
            filled = 0;
        }
        else 
        {
            $('select[name="e_loc"]').removeClass("w3-border-red");
             if (durHSub == "")
            { 
                $('input[name="e_dur_h"]').addClass("w3-border-red");
                filled = 0;
            }
            else
            {
                $('input[name="e_dur_h"]').removeClass("w3-border-red");
                if (durMSub == "")
                { 
                    $('input[name="e_dur_m"]').addClass("w3-border-red");
                    filled = 0;
                }
                else
                {
                    $('input[name="e_dur_m"]').removeClass("w3-border-red");
                    if (strDSub.length == 0)
                    {
                        $('input[name="e_str_d"]').addClass("w3-border-red");
                        filled = 0;
                    }
                    else
                    {
                        $('input[name="e_str_d"]').removeClass("w3-border-red");
                        if (strTSub.length == 0)
                        {
                            $('input[name="e_str_t"]').addClass("w3-border-red");
                            filled = 0;
                        }
                        else
                        {
                            $('input[name="e_str_t"]').removeClass("w3-border-red");
                            if (memoSub.length == 0)
                            {
                                $('input[name="e_memo"]').addClass("w3-border-red");
                                filled = 0;
                            }
                            else
                            {
                                $('input[name="e_memo"]').removeClass("w3-border-red");
                                filled = 1;
                            }
                        }
                    }
                }
            }
        }
    }
        
    if (filled == 0)
    {
        $('#f_Eqp #formproblem').addClass('w3-show');
        $('#f_Eqp #qtylimit').removeClass('w3-show');
    }
    else
    {
        // Quantity Limit Check
        $('#f_Eqp #formproblem').removeClass('w3-show');
        if (e_data[2].length != 0)
        var limitcheck = 0;
        {
            for (var i = 0; i < e_data[2].length; i++)
            {
                console.log(e_data[2][i][0], ownerSub);
                qtylimit = alasql('SELECT balance FROM stock \
                WHERE item = ' + e_data[2][i][0] + ' AND owner ="' + ownerSub +'"');

                if (e_data[2][i][1] > qtylimit[0].balance)
                {
                    limitcheck = 1;
                    $('input[name="p_qty_' + e_data[2][i][0] + '"]').addClass("w3-border-red");
                }
            }
            if (limitcheck == 1)
            {
                $('#f_Eqp #qtylimit').addClass('w3-show');
            }
            else
            {
                $('#f_Eqp #qtylimit').removeClass('w3-show');
                for (var i = 0; i < e_data[2].length; i++)
                {
                    $('input[name="p_qty_' + e_data[2][i][0] + '"]').removeClass("w3-border-red");                    
                }

                //do text
                $('#cfm_modal #cfmtext').empty();
                $('#cfm_modal #cfmtext').append('<span>Are you sure you want to submit this form?</span>');

                //and then button
                var btnstr = '<button type="button" class="w3-button w3-green w3-round w3-margin" \
                                onclick="updateData(' + "'equipment'" + ', e_data)"> \
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
        }
    }
}

// submit function for Reordering
function rSubmit(){
    r_data = []; //reset r_data after failed submission
    var existingid = []; //existing entries

    var n = $('#tbody-reorder').children();
    for (var i = 0; i < n.length; i++)
    {
        existingid.push(n.eq(i).attr('id'));
    }
    
    for (var i = 0; i < existingid.length; i++)
    {
        //get data
        var itemSub = $('select[name="src' + existingid[i] + '"]').val();
        var priceSub = numberWithoutCommas($('input[name="prc' + existingid[i] + '"]').val());
        var qtySub = $('input[name="qty' + existingid[i] + '"]').val();
        var unitSub = $('input[name="unit' + existingid[i] + '"]').val();
        var delDSub = $('input[name="date' + existingid[i] + '"]').val();

        //Input Check
        if (itemSub == null)
        {
            $('select[name="src' + existingid[i] + '"]').addClass("w3-border-red");
            filled = 0;
        }
        else
        {
            $('select[name="src' + existingid[i] + '"]').removeClass("w3-border-red");
            if (priceSub == "")
            {
                $('input[name="prc' + existingid[i] + '"]').addClass("w3-border-red");
                filled = 0;
            }
            else 
            {
                $('input[name="prc' + existingid[i] + '"]').removeClass("w3-border-red");
                 if (qtySub == "")
                { 
                    $('input[name="qty' + existingid[i] + '"]').addClass("w3-border-red");
                    filled = 0;
                }
                else
                {
                    $('input[name="qty' + existingid[i] + '"]').removeClass("w3-border-red");
                    if (unitSub == "")
                    { 
                        $('input[name="unit' + existingid[i] + '"]').addClass("w3-border-red");
                        filled = 0;
                    }
                    else
                    {
                        $('input[name="unit' + existingid[i] + '"]').removeClass("w3-border-red");
                        if (delDSub.length == 0)
                        {
                            $('input[name="date' + existingid[i] + '"]').addClass("w3-border-red");
                            filled = 0;
                        }
                        else
                        {
                            $('input[name="date' + existingid[i] + '"]').removeClass("w3-border-red");
                            filled = 1;

                            //update global r_data variable ONLY IF IT'S FULLY FILLED
                            r_data.push([itemSub,priceSub,qtySub,unitSub,delDSub]);
                        }
                    }
                }
            }
        }
    }

    if (filled == 0)
    {
        $('#f_Reorder #formproblem').addClass('w3-show');
        $('#f_Reorder #qtylimit').removeClass('w3-show');
    }
    else
    {
        // Quantity Limit Check
        $('#f_Reorder #formproblem').removeClass('w3-show');
        if (remainder < 0)
        {
            $('#f_Reorder #qtylimit').addClass('w3-show');
            $('input[name="b_qty"]').addClass("w3-border-red");
        }
        else
        {
            $('#f_Reorder #qtylimit').removeClass('w3-show');
            $('input[name="b_qty"]').removeClass("w3-border-red");
            //do text
            $('#cfm_modal #cfmtext').empty();
            $('#cfm_modal #cfmtext').append('<span>Are you sure you want to submit this form?</span>');

            //and then button
            var btnstr = '<button type="button" class="w3-button w3-green w3-round w3-margin" \
                            onclick="updateData(' + "'reorder'" + ', r_data)"> \
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
    }
}

// submit function for New Item
function bSubmit(){
    b_data = []; //reset after failed submission
    var existingid = [0]; //existing lead + lag

    var n = $('div[name="lagcontent"]').children();
    for (var i = 0; i < n.length; i++)
    {
        existingid.push(n.eq(i).attr('name'));
    }

    for (var i = 0; i < existingid.length; i++) //use numerical name to iterate
    {
        //get data
        var catSub = $('div[name="' + existingid[i] + '"] select[name="b_cat"]').val();
        var itemSub = $('div[name="' + existingid[i] + '"] input[name="b_opt"]').val();
        var srcSub = $('div[name="' + existingid[i] + '"] input[name="b_src"]').val();
        var qtySub = $('div[name="' + existingid[i] + '"] input[name="b_qty"]').val();
        var ordDSub = $('div[name="' + existingid[i] + '"] input[name="b_ord_d"]').val();
        var delDSub = $('div[name="' + existingid[i] + '"] input[name="b_del_d"]').val();
        var contactSub = $('div[name="' + existingid[i] + '"] input[name="b_cont"]').val();
        var unitSub = $('div[name="' + existingid[i] + '"] input[name="b_unit"]').val();
        var priceUSub = numberWithoutCommas($('div[name="' + existingid[i] + '"] input[name="b_price"]').val());
        var memoSub = $('div[name="' + existingid[i] + '"] input[name="b_memo"]').val();

        //Input Check
        var filled = 0;
        if (catSub == null)
        {
            $('div[name="' + existingid[i] + '"] select[name="b_cat"]').addClass("w3-border-red");
            filled = 0;
        }
        else
        {
            $('div[name="' + existingid[i] + '"] select[name="b_cat"]').removeClass("w3-border-red");
            if (itemSub == "")
            {
                $('div[name="' + existingid[i] + '"] input[name="b_opt"]').addClass("w3-border-red");
                filled = 0;
            }
            else
            {
                $('div[name="' + existingid[i] + '"] input[name="b_opt"]').removeClass("w3-border-red");
                if (srcSub == "")
                {
                    $('div[name="' + existingid[i] + '"] input[name="b_src"]').addClass("w3-border-red");
                    filled = 0;
                }
                else 
                {
                    $('div[name="' + existingid[i] + '"] input[name="b_src"]').removeClass("w3-border-red");
                    if (ordDSub == "")
                    { 
                        $('div[name="' + existingid[i] + '"] input[name="b_ord_d"]').addClass("w3-border-red");
                        filled = 0;
                    }
                    else
                    {
                        $('div[name="' + existingid[i] + '"] input[name="b_ord_d"]').removeClass("w3-border-red");
                        if (delDSub == "")
                        { 
                            $('div[name="' + existingid[i] + '"] input[name="b_del_d"]').addClass("w3-border-red");
                            filled = 0;
                        }
                        else
                        {
                            $('div[name="' + existingid[i] + '"] input[name="b_del_d"]').removeClass("w3-border-red");
                            if (contactSub.length == 0)
                            {
                                $('div[name="' + existingid[i] + '"] input[name="b_cont"]').addClass("w3-border-red");
                                filled = 0;
                            }
                            else
                            {
                                $('div[name="' + existingid[i] + '"] input[name="b_cont"]').removeClass("w3-border-red");
                                if (unitSub.length == 0)
                                {
                                    $('div[name="' + existingid[i] + '"] input[name="b_unit"]').addClass("w3-border-red");
                                    filled = 0;
                                }
                                else
                                {
                                    $('div[name="' + existingid[i] + '"] input[name="b_unit"]').removeClass("w3-border-red");
                                    if (priceUSub.length == 0)
                                    {
                                        $('div[name="' + existingid[i] + '"] input[name="b_price"]').addClass("w3-border-red");
                                        filled = 0;
                                    }
                                    else
                                    {
                                        $('div[name="' + existingid[i] + '"] input[name="b_price"]').removeClass("w3-border-red");
                                            if (memoSub.length == 0)
                                        {
                                            $('div[name="' + existingid[i] + '"] input[name="b_memo"]').addClass("w3-border-red");
                                            filled = 0;
                                        }
                                        else
                                        {
                                            $('div[name="' + existingid[i] + '"] input[name="b_memo"]').removeClass("w3-border-red");
                                            filled = 1;
                                            //update global b_data variable ONLY IF IT'S FULLY FILLED
                                            b_data.push([catSub,itemSub,srcSub,qtySub,ordDSub,delDSub,contactSub,unitSub,priceUSub,memoSub]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
        
    if (filled == 0)
    {
        $('#f_Buy #formproblem').addClass('w3-show');
        $('#f_Buy #qtylimit').removeClass('w3-show');
    }
    else
    {
        // Quantity Limit Check
        $('#f_Buy #formproblem').removeClass('w3-show');
        if (remainder < 0)
        {
            $('#f_Buy #qtylimit').addClass('w3-show');
            $('input[name="b_qty"]').addClass("w3-border-red");
        }
        else
        {
            $('#f_Buy #qtylimit').removeClass('w3-show');
            $('input[name="b_qty"]').removeClass("w3-border-red");
            
            //do text
            $('#cfm_modal #cfmtext').empty();
            $('#cfm_modal #cfmtext').append('<span>Are you sure you want to submit this form?</span>');

            //and then button
            var btnstr = '<button type="button" class="w3-button w3-green w3-round w3-margin" \
                            onclick="updateData(' + "'newitem'" + ', b_data)"> \
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
    }
}