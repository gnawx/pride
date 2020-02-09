function equipstat()
{
    var pending = alasql('SELECT id, equip, date, time, stat, memo FROM hist WHERE time != 0');
    for (var i = 0; i < pending.length; i++)
    {
        var now = Date.parse(new Date());
        var starttime = Date.parse(pending[i].date);
        var dur = pending[i].time * 1000;
        if (pending[i].stat == 1) //if still available, check if start time has passed
        {
            //if passed BUT WITHIN runtime, update hist to running
            if ((now - starttime) > 0 && (now - dur - starttime) < 0)
            {
                alasql('UPDATE hist SET stat = 3 WHERE id = ' + pending[i].id);
                alasql('UPDATE equip SET stat = 3 WHERE id = ' + pending[i].equip);
            }
        }
        else if (pending[i].stat == 3) //if already running, check if end time is reached
        {
            if ((now - dur - starttime) > 0)
            {
                alasql('UPDATE hist SET stat = 1 WHERE id = ' + pending[i].id);
                alasql('UPDATE equip SET stat = 1 WHERE id = ' + pending[i].equip);
            }
        }
    }
}