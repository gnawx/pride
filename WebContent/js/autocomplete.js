/* Autocomplete Script */

$( function(){
    function split( val ) {
        return val.split( /,\s*/ );
    }
    function extractLast( term ) {
        return split( term ).pop();
    }
    
    //custom function that updates avail_entry based on term
    function chosen( entry, term ){
        var chosenwords = split(term);

        //Keep only the typed keywords
        chosenwords.pop();

        // Deep Copy avail_entry
        var chosen_entry = [];
        for (var i = 0; i < entry.length; i++)
        {
          chosen_entry.push(entry[i]);
        }

        // Splice Unnecessary Terms ONLY
        for (var j = 0; j < chosenwords.length; j++)
        {
          for (var i = chosen_entry.length - 1; i > -1; i--)
          {
            if (chosen_entry[i].label.toLowerCase() == chosenwords[j].toLowerCase())
            {
              chosen_entry.splice(i, 1);
            }
          }
        }
        return chosen_entry;
    }

    $.widget( "custom.catcomplete", $.ui.autocomplete, {
      _create: function() {
        this._super();
        this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
      },
      _renderMenu: function( ul, items ) {
        var that = this,
          currentCategory = "";
        $.each( items, function( index, item ) {
          var li;
          if ( item.category != currentCategory ) {
            ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
            currentCategory = item.category;
          }
          li = that._renderItemData( ul, item );
          if ( item.category ) {
            li.attr( "aria-label", item.category + " : " + item.label );
          }
        });
      }
    });

    $( "#searchbar" )
    // don't navigate away from the field on tab when selecting an item
    .on( "keydown", function( event ) {
      if ( event.keyCode === $.ui.keyCode.TAB &&
          $( this ).catcomplete( "instance" ).menu.active ) {
        event.preventDefault();
      }
    })
    .catcomplete({
      minLength: 0,
      source: function( request, response ) {
        // delegate back to autocomplete, but extract the last term
        response( $.ui.autocomplete.filter(
          chosen(avail_entry, request.term), extractLast( request.term ) ) );
      },
      focus: function() {
        // prevent value inserted on focus
        return false;
      },
      select: function( event, ui ) {
        var terms = split( this.value );
        // remove the current input
        terms.pop();
        // add the selected item
        terms.push( ui.item.value );
        // add placeholder to get the comma-and-space at the end
        terms.push( "" );
        this.value = terms.join( ", " );
        // manipulates options based on what's selected
        return false;
      }
    });
});