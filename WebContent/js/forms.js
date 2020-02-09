equipstat();

var depitem = []; //KEEP THIS OUTSIDE SO EQUIP FORM INPUT CHECKING CAN FUNCTION

// var price = 0; //global variable for procurement price
var remainder = 0; //global variable for budget remainder in procurement
var initial = 0; //global variable for initial budget in procurement

var p_data = []; //global variable for p_data
var e_data = []; //global variable for e_data
var r_data = []; //global variable for r_data
var b_data = []; //global variable for b_data

var lagcounter = 0; //global variable to count number of lags

//Parse Request Params
var parItem = $.url().param('item');
var parLoc = $.url().param('loc');
var parTab = $.url().param('tab');

//Main Function
$(function () {
    //add budget to Procurement Form
    var budget_lab = alasql('SELECT emp, budget FROM (SELECT * FROM login \
                        LEFT JOIN lab ON login.code = lab.code) \
                        WHERE emp = "' + emp +'"');
    var budget_proj = alasql('SELECT emp, budget FROM (SELECT * FROM login \
                        LEFT JOIN proj ON login.code = proj.code) \
                        WHERE emp = "' + emp +'"');
    if (budget_lab[0].budget != undefined)
    {
        initial = budget_lab[0].budget;
        $('span[name="budget"]').append(numberWithCommas(initial.toFixed(2)));
    }
    else if (budget_proj[0].budget != undefined)
    {
        initial = budget_proj[0].budget;
        $('span[name="budget"]').append(numberWithCommas(initial.toFixed(2)));
    }

    popItem_p('p_opt');popItem_e('e_opt');popOrder();popCat(lagcounter); //run populating item function
    
    if (parItem != undefined & parLoc != undefined & parTab != undefined)
    {
        document.getElementsByName(parTab)[0].click(); //simulate click on tabs
        
        if (parTab == "f_Per")
        {
            $('select[name="p_opt"]').val(parseInt(parItem));
            $('select[name="p_opt"] option[value="' + parItem + '"]').click();
            popLoc_p(parseInt(parItem));
            // create locval to map location id to option value
            var locval = $('select[name="p_loc"] option[name="' + parLoc + '"]').val();
            $('select[name="p_loc"]').val(locval);
            $('select[name="p_loc"] option[value="' + parItem + '"]').click();   
        }
        else if (parTab == "f_Eqp")
        {
            $('select[name="e_opt"]').val(parseInt(parItem));
            $('select[name="e_opt"] option[value="' + parItem + '"]').click();
            popLoc_e(parseInt(parItem));
            var locval = $('select[name="e_loc"] option[name="' + parLoc + '"]').val();
            $('select[name="e_loc"]').val(locval);
            $('select[name="e_loc"] option[name="' + parLoc + '"]').click();
            depTog(parseInt(parItem),parLoc);
        }
        else if (parTab == "f_Reorder")
        {
            $('select[name="r_item"]').val(parseInt(parItem));
            $('select[name="r_item"] option[value="' + parItem + '"]').click();
        }
    }
});

//Function to Toggle Dispay with Tabs
function toggleInv(evt, Inv) {
    var i, x, tablinks;
    x = document.getElementsByClassName("scale");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" w3-blue", "");
    }
    document.getElementById(Inv).style.display = "block";
    evt.currentTarget.className += " w3-blue";
}

//Function to Toggle Dependencies in Equipment Form
function depTog(eqp,loc_cd)
{
    var dep = alasql('SELECT lag FROM dep WHERE lead = ?',[eqp]);
    var depopt = $('div[name="depopt"]');
    var depcontent = $('div[name="depcontent"]');
    depcontent.empty();
    depitem = [];
    if (dep.length != 0)
    {
        for (var i = 0; i < dep.length; i++)
        {
            var depdetail = alasql('SELECT detail, unit FROM item WHERE id = ?', [dep[i].lag]);
            var depcontdiv = $('<div class="w3-col s4 w3-padding"></div>');
            depcontdiv.append('<p><label>' + depdetail[0].detail + '</label>');
            depcontdiv.append('<div class="w3-half">' +
                            '<input class="w3-input w3-border w3-light-grey w3-round"\
                            name="p_qty_' + dep[i].lag + '" type="number" min="0"></div>');
            depcontdiv.append('<div class="w3-half">' +
                            '<p class="w3-padding">' + depdetail[0].unit + '</p>'
                            + '</div></p>');
            depcontdiv.appendTo(depcontent);
            depitem = depitem.concat(dep[i].lag);
        }
        depopt.addClass("w3-show");
    }
    else
    {
        depopt.removeClass("w3-show");
    }
}