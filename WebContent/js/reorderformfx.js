// ----------- START OF PROCUREMENT-REORDER TABLE AND COST UPDATING ----------- //

//Function to Add Entries to Reordering Table
function addTable(val){
    var ownership = alasql('SELECT code FROM login WHERE emp = "' + emp + '"')[0].code;

    var content = [];
    var p_cont = alasql('SELECT owner, balance FROM stock WHERE item = ?',[ val ]);
    var e_cont = alasql('SELECT owner, balance FROM equip WHERE item = ?',[ val ]);
    var src = alasql('SELECT contacts FROM src WHERE item = ?',[ val ]);
    var detunit = alasql('SELECT detail, unit FROM item WHERE id = ?',[ val ])[0];

    var ownstock = 0;
    var otherstock = 0;

    //decide equip or perishables
    if (p_cont.length == 0)
    {
        cont = e_cont;
    }
    else
    {
        cont = p_cont;
    }

    for (var i = 0; i < cont.length; i++)
    {
        if (cont[i].owner == ownership)
        {
            ownstock += cont[i].balance;
        }
        else
        {
            otherstock += cont[i].balance;
        }
    }

    var tbody = $('#tbody-reorder');
    var tr = $('<tr id="' + val + '"></tr>');
    tr.append('<td class="w3-center"> \
    <span onclick="removeTable(' + val + ')" \
        class="w3-button w3-large w3-hover-none w3-hover-text-red"> \
            &times; \
        </span> \
    </td>')
    tr.append('<td name="name">' + detunit.detail + '</td>');
    tr.append('<td name="owner">' + numberWithCommas(ownstock) + '</td>')
    tr.append('<td name="other">' + numberWithCommas(otherstock) + '</td>')
    tr.append('<td><select class="w3-select w3-round w3-light-grey" name="src' + val +
                '"></select></td>');
    tr.append('<td><input class="w3-select w3-round w3-light-grey" name="prc' + val +
                '" onchange="updateCost()"></td>');
    tr.append('<td>x</td>');
    tr.append('<td><input class="w3-select w3-round w3-light-grey" name="qty' + val +
                '" onchange="updateCost()"></td>');
    tr.append('<td><input class="w3-select w3-round w3-light-grey" name="unit' + val +
                '"></td>');
    tr.append('<td><input type="date" class="w3-select w3-round w3-light-grey" name="date' +
                val + '"></td>');
    tr.append('<td style="text-align: center;" name="subtotal' + val + '"></td>');
    tr.appendTo(tbody);

    //update dynamic elements
    $('input[name="unit' + val + '"]').val(detunit.unit);
    
    var slc = $('select[name="src' + val + '"]');
    slc.append('<option value="-1" disabled selected>Select Source</option>');
    
    for (var i = 0; i < src.length; i++)
    {
        slc.append('<option value="' + val + '" onclick="updPrice(' + val + ", '" + src[i].contacts + "'" + ')">' +
                    src[i].contacts + '</option>')
    }    
}

//Function to Remove Table Entries
function removeTable(val){
    $('#' + val).remove();
    updateCost(); //update Cost calculation
}

//Function to Update Individual Price
function updPrice(val, contacts){

    var src = alasql('SELECT price, qty FROM src WHERE item = ? AND contacts = ?',[ val, contacts ])[0];
    var prc = (src.price/src.qty).toFixed(2);
    $('input[name="prc' + val + '"]').val(numberWithCommas(prc));

    updateCost();
}

//Function to Update Total Cost
function updateCost(){
    var total = 0;
    var content = $('#tbody-reorder').children();
    for (var i = 0; i < content.length; i++)
    {
        var id = content.eq(i).attr('id');
        var prc = numberWithoutCommas($('input[name="prc' + id + '"]').val());
        var qty = $('input[name="qty' + id + '"]').val();
        $('td[name="subtotal' + id + '"]').text(numberWithCommas((-1*prc*qty).toFixed(2)));
        total = total + prc*qty;
    }
    $('span[name="total"]').text(numberWithCommas((-1*total).toFixed(2)));
    remainder = initial - total;
    $('span[name="remainder"]').text(numberWithCommas((initial-total).toFixed(2)));
}

// ----------- END OF PROCUREMENT-REORDER TABLE AND COST UPDATING ----------- //