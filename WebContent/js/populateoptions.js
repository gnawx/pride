/*Populates Options for BOTH autocomplete.js and index.js (fuse fuzzy search)*/
/*Put BEFORE BOTH of them!*/
var sql_build_p, sql_build_e, lsql;
sql_build_p = 'SELECT stock.item, item.detail, kind.descr, stock.owner \
FROM stock \
JOIN item ON stock.item = item.id \
JOIN kind ON item.kind = kind.id'

sql_build_e = 'SELECT equip.item, item.detail, kind.descr, equip.owner \
FROM equip \
JOIN item ON equip.item = item.id \
JOIN kind ON item.kind = kind.id'

lsql_p = alasql(sql_build_p);
lsql_e = alasql(sql_build_e);
lsql = lsql_p.concat(alasql(sql_build_e));

var avail_entry = [];

for (var i = 0; i < lsql.length; i++)
{
    // split multiple word keywords
    var fulldetail = lsql[i].detail.split(" ");
    var fulldescr = lsql[i].descr.split(" ");
    var owner = DB.own(lsql[i].owner);
    var fullowner = owner.split(" ");

    /* Categorise avail_entry for possible categorisation of autocomplete */
    avail_entry.push({label: lsql[i].detail, category: "Name"});
    for (var j = 0; j < fulldetail.length; j++)
    {
        avail_entry.push({label: fulldetail[j], category: "Name"});        
    }
    avail_entry.push({label: lsql[i].descr, category: "Description"});
    for (var j = 0; j < fulldescr.length; j++)
    {
        avail_entry.push({label: fulldescr[j], category: "Description"});        
    }
    avail_entry.push({label: owner, category: "Location/Owner"});
    for (var j = 0; j < fullowner.length; j++)
    {
        avail_entry.push({label: fullowner[j], category: "Location/Owner"});        
    }
}

/* AVAIL_ENTRY FINETUNING */
//sort avail_entry array alphabetically
avail_entry.sort(function(a,b){
    if (a.label < b.label)
    {
        return -1;
    }
    else if (a.label > b.label)
    {
        return 1;
    }
    else
    {
        return 0;
    }
});

//remove duplicates by comparing adjacent entries of sorted array
for (var i = (avail_entry.length - 2); i > -1; i--)
{ 
    if (avail_entry[i].label == avail_entry[i+1].label)
    {
        avail_entry.splice(i, 1);
    }
}

//sort avail_entry array categorically for autocomplete
avail_entry.sort(function(a,b){
    if (a.category < b.category)
    {
        return -1;
    }
    else if (a.category > b.category)
    {
        return 1;
    }
    else
    {
        return 0;
    }
});

/* lsql_p & lsql_e FINETUNING */
//sort array alphabetically
lsql_p.sort(function(a,b){
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

//remove duplicates by comparing adjacent entries of sorted array
for (var i = (lsql_p.length - 2); i > -1; i--)
{ 
    if (lsql_p[i].detail == lsql_p[i+1].detail)
    {
        lsql_p.splice(i, 1);
    }
}

//sort array alphabetically
lsql_e.sort(function(a,b){
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

//remove duplicates by comparing adjacent entries of sorted array
for (var i = (lsql_e.length - 2); i > -1; i--)
{ 
    if (lsql_e[i].detail == lsql_e[i+1].detail)
    {
        lsql_e.splice(i, 1);
    }
}