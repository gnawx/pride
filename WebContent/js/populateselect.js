// ----------- START OF POPULATING OPTIONS FUNCTIONS ----------- //

//Function to Populate Item in Forms
function popItem_p(kw){
    var itemopt= $('select[name="'+ kw +'"]');
    itemopt.append('<option value="-1" disabled selected>Select Item</option>');
    for (var i = 0; i < lsql_p.length; i++)
    {
        if (kw != "b_opt")
        {
            var opt = '<option value="' + lsql_p[i].item + '" onclick="popLoc_p(' + lsql_p[i].item + ')">' + lsql_p[i].detail + '</option>'
        }
        itemopt.append(opt);
    }
}

function popItem_e(kw){
    var itemopt= $('select[name="'+ kw +'"]');
    itemopt.append('<option value="-1" disabled selected>Select Item</option>');
    for (var i = 0; i < lsql_e.length; i++)
    {
        if (kw != "b_opt")
        {
            var opt = '<option value="' + lsql_e[i].item + '" onclick="popLoc_e(' + lsql_e[i].item + ')">' + lsql_e[i].detail + '</option>'
        }
        itemopt.append(opt);
    }
}

function popItem_b(kw){
    $('select[name="b_opt"]').empty(); //reset Item
    if (kw == "Perishables")
    {
        // $('a[name="lagTog"]').addClass("w3-hide");
        // $('div[name="lagcontent"]').empty();
        // lagcounter = 0; //reset lagcounter
        // $('a[name="lagTog"]').empty(); //reset lagTog words
        // $('a[name="lagTog"]').append('Do you want to add dependencies?');
    }
    else if (kw == "Equipment")
    {
        $('a[name="lagTog"]').removeClass("w3-hide");
        $('a[name="lagTog"]').addClass("w3-show");
    }
}

//Function to Populate Order Options in Reorder Form
function popOrder(){
    //sort lsql array alphabetically
    lsql.sort(function(a,b){
        if (a.detail < b.detail)
        {
            return -1;
        }
        else if (a.detail > b.detail)
        {
            return 1;
        }
        else
        {
            return 0;
        }
    });
    var prevItem = "";
    var itemopt= $('select[name="r_item"]');
    itemopt.append('<option value="-1" disabled selected>Select Item</option>');
    for (var i = 0; i < lsql.length; i++)
    {
        if (lsql[i].item != prevItem) //prevent duplicate entries - MATTERS FOR AUTOFILL ON CLICK
        {
            var opt = '<option value="' + lsql[i].item + '" onclick="addTable(' + lsql[i].item + ')">' + lsql[i].detail + '</option>';
            itemopt.append(opt);
        }
        prevItem = lsql[i].item;
    }
}

//Function to Populate Categories in New Item Forms
function popCat(divcount){
    $('div[name="' + divcount + '"] select[name="b_cat"]').empty();
    $('div[name="' + divcount + '"] select[name="b_cat"]').append('<option value="-1" disabled selected>Select Category</option>');
    var cat = alasql('SELECT descr, cls FROM kind');
    for (var i = 0; i < cat.length; i ++)
    {
        $('div[name="' + divcount + '"] select[name="b_cat"]').append('<option value="' +
        cat[i].descr + '" onclick="popItem_b(' + "'" + cat[i].cls + "'" + ')">' + 
        cat[i].descr + '</option>');
    }
}

//Function to Populate Location in Perishables Req. Form
function popLoc_p(val){
    var loc = alasql('SELECT loc, owner FROM stock WHERE item = ' + val);
    var locopt= $('select[name="p_loc"]');
    locopt.empty();
    locopt.append('<option value="-1" disabled selected>Select Location</option>');
    for (var i = 0; i < loc.length; i++)
    {
        var opt = '<option value="' + i + '" name="' + loc[i].owner + '">' + DB.locate(loc[i].loc) + '</option>'
        locopt.append(opt);
    }
    var ut = alasql('SELECT unit FROM item WHERE id = ' + val);
    var utstr = $('p[name="p_unit"]');
    utstr.empty()
    utstr.append(ut[0].unit);
}

//Function to Populate Location in Equipment Req. Form
function popLoc_e(val){
    var loc = alasql('SELECT loc, owner FROM equip WHERE item = ' + val);
    var locopt= $('select[name="e_loc"]');
    locopt.empty();
    locopt.append('<option value="-1" disabled selected>Select Location</option>');
    for (var i = 0; i < loc.length; i++)
    {
        var opt = '<option value="' + i + '" name="' + loc[i].owner + 
        '" onclick="depTog(' + val + ',' + "'" +
        loc[i].owner + "'" + ')">' + DB.locate(loc[i].loc) + '</option>'
        locopt.append(opt);
    }
}

// ----------- END OF POPULATING OPTIONS FUNCTIONS ----------- //