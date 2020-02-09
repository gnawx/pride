// ----------- START OF PROCUREMENT-NEW ITEM FUNCTIONS ----------- //

//Function to Add Lag
function addlag(){
    lagcounter = lagcounter + 1;
    var lagdiv = $('div[name="lagcontent"]');
    var lagcountdiv = $('<div class="w3-col" name="'+ lagcounter +'"></div>');
    var content = '	<div class="w3-col m10 s9 w3-padding"> \
                        <a href="javascript:void(0)" onclick="removelag('+ lagcounter +')"> \
                        <h5 class="w3-margin-bottom"><b> \
                        <span class="glyphicon glyphicon-asterisk"></span> LAG ITEM ' +
                        lagcounter +'</b></h5></a> \
                    </div> \
                    <div class="w3-col m10 s9 w3-padding"> \
						<p class="w3-padding"> \
							<label>Category:</label> \
							<select class="w3-select w3-round w3-light-grey" name="b_cat"> \
							</select> \
						</p> \
					</div> \
					<div class="w3-col m10 s9 w3-padding"> \
						<p class="w3-padding"> \
							<label>Item: </label> \
							<input class="w3-input w3-round w3-light-grey" name="b_opt" type="text"> \
						</p> \
					</div> \
					<div class="w3-col m10 s9"> \
						<div class="w3-col s4 w3-padding"> \
							<p class="w3-padding"> \
								<label class="w3-margin-bottom">Source:</label> \
								<input class="w3-input w3-round w3-light-grey" name="b_src" type="text"> \
							</p> \
						</div> \
						<div class="w3-col s4 w3-padding"> \
							<p class="w3-padding"> \
								<label class="w3-margin-bottom">Order Placement Date:</label> \
								<input class="w3-input w3-border w3-light-grey w3-round" name="b_ord_d" type="date"> \
							</p> \
						</div> \
						<div class="w3-col s4 w3-padding"> \
							<p class="w3-padding"> \
								<label class="w3-margin-bottom">Expected Delivery Date:</label> \
								<input class="w3-input w3-border w3-light-grey w3-round" name="b_del_d" type="date"> \
							</p> \
						</div> \
					</div> \
					<div class="w3-col m10 s9 w3-padding"> \
						<div class="w3-col w3-half"> \
							<p class="w3-padding w3-margin-right"> \
								<label class="w3-left">Contact Info:</label> \
								<input class="w3-input w3-round w3-light-grey" name="b_cont" type="text"> \
							</p> \
						</div> \
						<div class="w3-col w3-quarter"> \
							<div class="w3-half"> \
								<p class="w3-padding"> \
									<label class="w3-left">Quantity:</label> \
									<input class="w3-input w3-border w3-light-grey w3-round" name="b_qty" type="number" min="0" onchange="updateCostNew()"> \
								</p> \
							</div> \
							<div class="w3-half"> \
								<p class="w3-padding"> \
									<label class="w3-left">Unit:</label> \
									<input class="w3-input w3-round w3-light-grey" name="b_unit" type="text"> \
								</p> \
							</div> \
						</div> \
						<div class="w3-col w3-quarter"> \
							<div class="w3-quarter"> \
								<label>&nbsp;</label> \
								<p class="w3-padding w3-center w3-large">x</p> \
							</div> \
							<div class="w3-rest"> \
								<p class="w3-padding"> \
									<label class="w3-left">Price/Unit:</label> \
									<input class="w3-input w3-round w3-light-grey" name="b_price" onchange="updateCostNew()" type="text"> \
								</p> \
							</div> \
						</div> \
					</div> \
					<div class="w3-col m2 s3" style="margin-top:33px"> \
						<span class="w3-right w3-padding" name="total"></span> \
                    </div> \
                    <div class="w3-col m10 s9 w3-padding"> \
                        <p class="w3-padding"> \
                            <label>Memo:</label> \
                            <input class="w3-input w3-light-grey" placeholder="Write purpose here ..." name="b_memo" type="text"> \
                        </p> \
                    </div>'
    lagcountdiv.append(content);
    lagcountdiv.appendTo(lagdiv);
    $('a[name="lagTog"]').empty();
    $('a[name="lagTog"]').append('Do you want to add more dependencies?');

    popCat(lagcounter); //populate options
}

//Function to Remove Lag
function removelag(num){
    $('div[name="'+ num +'"]').remove();
    updateCostNew();
}

function updateCostNew(){
    var total = 0;
    //add lead cost
    var prc = numberWithoutCommas($('div[name="0"] input[name="b_price"]').val());
    var qty = $('div[name="0"] input[name="b_qty"]').val();
    $('div[name="0"] span[name="total"]').text(numberWithCommas((-1*prc*qty).toFixed(2)));
    total = total + prc*qty;
    //add lag costs
    var content = $('div[name="lagcontent"]').children();
    for (var i = 0; i < content.length; i++)
    {
        var id = content.eq(i).attr('name');
        var prc = numberWithoutCommas($('div[name="' + id + '"] input[name="b_price"]').val());
        var qty = $('div[name="' + id + '"] input[name="b_qty"]').val();
        $('div[name="' + id + '"] span[name="total"]').text(numberWithCommas((-1*prc*qty).toFixed(2)));
        total = total + prc*qty;
	}
	remainder = initial - total;
    $('span[name="remainder_new"]').text(numberWithCommas((initial-total).toFixed(2)));
}

// ----------- END OF PROCUREMENT-NEW ITEM FUNCTIONS ----------- //