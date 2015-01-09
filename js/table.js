// Just some utility functions. They are pretty much self-explaining
function max(arr) {
    return Math.max.apply(Math, arr);
}

function sum(arr) {
    var total = 0;
    for (var i = 0; i < arr.length; i++) {
        total += arr[i];
    }
    return total;
}

function sort_number_asc(a,b) {
    return a - b;
}

// Initialize table for seat distribution.
function initialize_table() {
    // Having a separate function for the tagble initialization helps in testing.
    // I.e. changing a JS array is much easier than writing HTML :)
    // An additional benefit is that we don't have to manually bind the "click"
    // event of the "remove buttons", since this is done automatically.

    // Define the defaults
    var DEFAULTS = [
        ["ΣΥΡΙΖΑ", 35],
        ["Νέα Δημοκρατία", 30],
        ["ΚΚΕ", 5],
        ["Ποτάμι", 5],
        ["Χρυσή Αυγή", 5],
        ["ΠΑΣΟΚ", 5],
        ["ΑΝΕΛ", 3],
    ];
    //var DEFAULTS = [
        //["ΣΥΡΙΖΑ", 27.002],
        //["Νέα Δημοκρατία", 27.001],
        //["ΚΚΕ", 6.251],
        //["Ποτάμι", 6.152],
        //["Χρυσή Αυγή", 4.8],
        //["ΑΝΕΛ", 8.51],
        //["ΚΙΔΗΣΟ", 5],
    //];

    // parse the DEFAULTS table and assign its values to the table rows.
    for (var i = 0; i < DEFAULTS.length; i++) {
        var party = DEFAULTS[i][0];
        var percentage = DEFAULTS[i][1];

        row = add_row();
        row.find("select").val(party);
        row.find("input").val(percentage);
    }
}

// The callback that removes the target's row from the table.
function remove_row_cb (e) {
    // It must be binded to an element that belongs to a table.
    e.preventDefault();
    $(this).closest('tr').remove();
    calculate_out_of_parliament_percentage();
}

// Create an icon that when clicked removes the current row from the table
function create_remove_button() {
  // It actually returns this:
  //
  //     <a class="nolink" href="#0">
  //        <span class="red glyphicon glyphicon-remove" aria-hidden="true"></span>
  //     </a>
  //
    var button = $('<a>', {"href": "#0"}).append(
        $('<button>', {
            "class": 'form-control red glyphicon glyphicon-remove',
            //"class": "form-control",
            "aria-hidden": "true",
        })
    );
    // Add callback
    $(button).click(remove_row_cb);
    return button;
}

// The available parties
var PARTIES = [
    "ΣΥΡΙΖΑ",
    "Νέα Δημοκρατία",
    "ΚΚΕ",
    "Ποτάμι",
    "Χρυσή Αυγή",
    "ΑΝΕΛ",
    "ΠΑΣΟΚ",
    "ΚΙΔΗΣΟ.",
    "ΑΝΤΑΡΣΥΑ",
    "Oικολόγοι Πράσινοι",
    "Εξωκοινοβούλιο",
    "Φιλελέδες",
];

// Create a SELECT element with the available party formations as defined in PARTIES
function create_party_selection() {
    // create select element
    var select = $('<select>', {
        "data-style": "btn-primary",
        "class": "form-control",
    });

    // Append options.
    $(PARTIES).each(function() {
        select.append(
            $('<option>', {
                "value": this
            })
            .text(this));
    });

    return select;
}

// Create INPUT element
function create_percentage_input() {
    var input = $('<input>', {
        "type": "text",
        "min": "0",
        "max": "100" ,
        //"step": "0.1",
        "class": "form-control",
        //
        "placeholder": "Ποσοστό (%)",
    });

    // bind callback
    $(input).on('input', calculate_out_of_parliament_percentage);

    return input;
}

// Create OUTPUT element
function create_total_output() {
    var output = $('<output>', {
        'type': 'number',
        'class': 'form-control',
    }).val(0);
    return output;
}

// Create a table row, append it to the tbody and return it
function add_row() {
    var tbody = $("#myTable").find('tbody');
    tds = [
        $('<td>').append(create_remove_button),
        $('<td>').append(create_party_selection),
        $('<td>').append(create_percentage_input),
        $('<td>').append(create_total_output),
    ];
    var row = $('<tr>');
    row.append(tds);
    tbody.append(row);
    return row;
}


function first_distribution(percentages, out_of_parliament_percentage) {
    var bonus = 50;
    var measure = (300 - bonus) / (100 - out_of_parliament_percentage);

    var max_percentage = max(percentages);
    var max_index = percentages.indexOf(max_percentage);

    var seats = [];
    var remains = [];
    for (var i = 0; i < percentages.length; i++) {
        var p = percentages[i];
        // Parties that did not pass the 3% threshold, do not gain any seats.
        if (p < 3) {
            seats.push(0);
            remains.push(undefined);
        // The party has passed the 3% threshold, so it gains seats.
        } else {
            var distribution = p * measure;
            seats.push(Math.floor(distribution));
            remains.push(distribution % 1);
        }

        // The party with the largest percentage gains the bonus
        if (i === max_index) {
            seats[i] += bonus;
        }

    }
    return {seats: seats, remains: remains};
}


function second_distribution(seats, remains) {
    // if we have any undistributed seats we must distribute them to the parties
    // with the greatest remains.
    var undistributed_seats = 300 - sum(seats);
    if (undistributed_seats === 0) {
        return seats;
    }

    // There are undistributed seats.
    // Make a copy of the original remains array. We will use it to find the
    // parties with the largest remains.
    // The remains array may contain "undefined". This elements correspond
    // to parties that did not pass the 3% threshold. We need to remove these
    // values because they will mess up the sorting.
    var clean_remains = [];
    for (i = 0; i < remains.length; i++) {
        if (remains[i]) {
            clean_remains.push(remains[i]);
        }
    }
    clean_remains.sort(sort_number_asc);

    // distribute the seats
    for (i = 0; i < undistributed_seats; i++) {
        var index = remains.indexOf(clean_remains.pop());
        seats[index] += 1;
    }

    return seats;
}


function calculate_out_of_parliament_percentage() {
    var total = 0;
    var percentages = [];
    var inputs = $("#myTable > tbody").find('input');
    for (var i = 0; i < inputs.length; i++) {
        var p = parseFloat(inputs[i].value) || 0;
        percentages.push(p);
        if (p > 3) {
            total += p;
        }
    }
    var out_of_parliament_percentage = 100 - total;

    // Set the out of parliament percentage
    $('#outOfParliamentPercentage').val(out_of_parliament_percentage.toFixed(2));

    if (total > 100 ) {
        alert("Το συνολικό ποσοστό υπερβαίνει το 100%. Παρακαλώ ελέγξτε τα δεδομένα σας.");
        return False;
    } else {
        result = first_distribution(percentages, out_of_parliament_percentage);
        var seats = result.seats;
        var remains = result.remains;
        seats = second_distribution(seats, remains);
        update_table(seats);
    }
}


function update_table(seats) {
    var outputs = $("#myTable > tbody").find('output');
    for (var i = 0; i < seats.length; i++) {
        $(outputs[i]).text(seats[i]);
    }
}


// From: http://getbootstrap.com/getting-started/#support-android-stock-browser
function fix_android_default_browser () {
    var nua = navigator.userAgent;
    var isAndroid = (nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1 && nua.indexOf('Chrome') === -1);
    if (isAndroid) {
        $('select.form-control').removeClass('form-control').css('width', '100%');
    }
}


$(document).ready( function () {
    initialize_table();
    calculate_out_of_parliament_percentage();

    // bind events to html elements declared in the html file
    $("#add_row_button").click(add_row);

    // Fixes
    fix_android_default_browser();
});
