// Generate Tables
equipstat();
var access = alasql('SELECT code, acclvl FROM login WHERE emp = "' + emp + '"')[0];
var tags = ['Delivery','Approval']; //to define
var choice = "proc";
var q = $('input[name=q]').val();

//Parse Params
var parTab = $.url().param('tab');

search(tags, choice); // use search fx instead of sqlgenerator so search is remembered when page is reloaded

/// TABS AND TABLES FUNCTION ///
//Display Toggle Dropdown Function
function display(val)
{
    if (val == 1)
    {
        $('.perishables').removeClass('w3-hide');
        $('.equipment').removeClass('w3-hide');        
    }
    else if (val== 2)
    {
        $('.perishables').removeClass('w3-hide');
        $('.equipment').addClass('w3-hide');
    }
    else if (val == 3)
    {
        $('.perishables').addClass('w3-hide');
        $('.equipment').removeClass('w3-hide');
    }
}

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

// Remember Toggle Option - Re-Run Display Fx
$(function(){

    document.getElementsByName(parTab)[0].click(); //simulate click on tabs

    display($('.w3-select').val());    
})