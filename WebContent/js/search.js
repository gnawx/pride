/// SEARCH FUNCTION ///
function search(tags, choice)
{
    var q = $('input[name=q]').val();

    //Syntax Correction
	var isValid = q.indexOf(',');
	if (isValid != -1)
	{
		$('input[name="q"]').val(q);
		var kw = q.split(","); //splits keywords using ","
	}
	else
	{
		if (q != "")
		{
			var kw = q.split(" "); //splits keywords using " "			
		}
		else
		{
			var kw = [];
		}
		q = ""; //reset q
		//then correct q
		for (var i = 0; i < kw.length; i++)
		{
			q = q.concat(kw[i]);
			if (i < kw.length)
			{
				for (var j = 0; j < avail_entry.length; j++)
				{
					var endCheck = 0;
					var tocompare = avail_entry[j]["label"].split(" ");
					var toclength = tocompare.length;
					if (kw[i].toLowerCase() == tocompare[toclength-1].toLowerCase())
					{
						endCheck = 1;
						break;
					}
				}
				if (endCheck == 1)
				{
					q = q.concat(", ");
				}
				else if (endCheck == 0 && q != "") //add space ONLY if a word is added to q
				{
					q = q.concat(" ");	
				}
			}
		}
		$('input[name="q"]').val(q);
    }

	sqlgenerator(tags[0],q, choice);
	sqlgenerator(tags[1],q, choice);
}