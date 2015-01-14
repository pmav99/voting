// Just some utility functions. They are pretty much self-explaining
var Utils = {
  max: function (arr) {
    return Math.max.apply(Math, arr);
  },

  sum: function (arr) {
    var total = 0;
    for (var i = 0; i < arr.length; i++) {
      total += arr[i];
    }
    return total;
  },

  sortNumberAsc: function (a,b) {
    return a - b;
  },

};


// Define Single Party Module
var SingleParty = {

  // html elements
  outside_rate: $('#rate_outside_parliament'),
  necessary_rate: $('#necessary_rate'),

  // Highcharts help functions
  format_percentages: function() {
    return Highcharts.numberFormat(this.y, 1) + '%';
  },

  // Define Single Party Chart
  chart: $('#one_party_chart').highcharts({
    title: {
      text: 'Απαιτούμενο ποσοστό για αυτοδυναμία',
      x: -20 //center
    },
    subtitle: {
      text: 'Συναρτήσει του ποσοστού των κομμάτων που μένουν εκτός βουλής',
      x: -20
    },
    xAxis: {
      title: {
        text: 'Ποσοστό κομμάτων εκτος βουλής (%)'
      },
      labels: {
        formatter: this.format_percentages,
      },
      maxPadding: 0.05,
      showLastLabel: true,
      min: 0,
      max: 20
    },
    yAxis: {
      title: {
        text: 'Ποσοστό αυτοδυναμίας (%)'
      },
      plotLines: [{
        value: 0,
        width: 1,
        color: '#808080'
      }],
      labels: {
        formatter: this.format_percentages,
      },
      min: 30,
      max: 42.5
    },
    tooltip: {
      valueSuffix: ' %',
      formatter: this.format_percentages,
    },
    series:
      [
        {
          data: [],
        },
        {
          data: [],
        },
      ],
  }),

  getCurve: function() {
    var factor = 101/250;
    var rates = [];
    for (var i = 0; i < 21; i++) {
      rates[i] = [i, factor * (100 - i)];
    }
    return rates;
  },

  updateChart: function (x, y) {
    var series = this.chart.series;
    var yMin = this.chart.yAxis[0].min;
    var values = {data: [[x, yMin], [x, y], [0, y]] };
    series[1].setData(values.data);
  },

  createChart: function () {
    this.chart = this.chart.highcharts();
    this.chart.series[0].setData(this.getCurve());
  },

  bindUIActions: function() {
    this.outside_rate.on("change", function(e) {
      var x = parseFloat(SingleParty.outside_rate.val()) || 0;
      var y = 101/250 * (100 - x);
      SingleParty.necessary_rate.val(y.toPrecision(3));
      SingleParty.updateChart(x, y);
    });
  },

  init: function() {
    this.createChart();
    this.bindUIActions();
    this.outside_rate.trigger("change");
  },

};


var Table = {

  parties: [
    "ΣΥΡΙΖΑ",
    "Νέα Δημοκρατία",
    "Το Ποτάμι",
    "ΚΚΕ",
    "ΠΑΣΟΚ – ΔΗΜΟΚΡΑΤΙΚΗ ΠΑΡΑΤΑΞΗ",
    "Χρυσή Αυγή",
    "Ανεξάρτητοι Έλληνες",
    "ΑΝΤΑΡΣΥΑ-ΜΑΡΣ",
    "ΛΑΟΣ",
    "Πράσινοι – ΔΗΜΑΡ",
    "Κίνημα Δημοκρατών Σοσιαλιστών",
    "Ένωση Κεντρώων",
    "ΚΚΕ (μ-λ) – Μ-Λ ΚΚΕ",
    "ΟΚΔΕ",
    "ΕΕΚ",
    "Τελεία",
    "Κίνημα Εθνικής Αντίστασης",
    "Κόμμα Φιλελευθέρων",
    "Ένωση Δημοκρατικής Εθνικής Μεταρρύθμισης",
    "Εθνική Ελπίδα",
    "ΕΛΚΣΙ - Ελληνικό Λευκό Κίνημα Σημερινής Ιδεολογίας",
    "«ΡΟΜΑ» - Ριζοσπαστικό Ορθόδοξο Μέτωπο Αλληλεγγύης",
    "Ελληνικό Κίνημα Άμεσης Δημοκρατίας",
    "ΕΛ.ΛΑ.ΔΑ - Ελληνική Λαϊκή Δημοκρατική Απελευθέρωση",
    "Ανεξάρτητη Ανανεωτική Αριστερά, Ανανεωτική Δεξιά, Ανανεωτικό ΠΑΣΟΚ, \
     Ανανεωτική Νέα Δημοκρατία, Όχι στον Πόλεμο, Κόμμα Επιχείρηση Χαρίζω Οικόπεδα \
     Χαρίζω Χρέη, Σώζω Ζωές, Παναγροτικό Εργατικό Κίνημα Ελλάδος (ΠΑ.Ε.Κ.Ε.)",
    "Αξιοπρέπεια",
  ],

  firstDistribution: function (percentages, outOfParliamentPercentage) {
    var bonus = 50;
    var measure = (300 - bonus) / (100 - outOfParliamentPercentage);

    var maxPercentage = Utils.max(percentages);
    var maxIndex = percentages.indexOf(maxPercentage);

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
      if (i === maxIndex) {
        seats[i] += bonus;
      }
    }
    return {seats: seats, remains: remains};
  },

  secondDistribution: function (seats, remains) {
    // if we have any undistributed seats we must distribute them to the parties
    // with the greatest remains.
    var undistributedSeats = 300 - Utils.sum(seats);
    if (undistributedSeats === 0) {
      return seats;
    }
    // There are undistributed seats.
    // Make a copy of the original remains array. We will use it to find the
    // parties with the largest remains.
    // The remains array may contain "undefined". This elements correspond
    // to parties that did not pass the 3% threshold. We need to remove these
    // values because they will mess up the sorting.
    var cleanRemains = [];
    for (var i = 0; i < remains.length; i++) {
      if (remains[i]) {
        cleanRemains.push(remains[i]);
      }
    }
    cleanRemains.sort(Utils.sortNumberAsc);
    // distribute the seats
    for (i = 0; i < undistributedSeats; i++) {
      var index = remains.indexOf(cleanRemains.pop());
      seats[index] += 1;
    }
    return seats;
  },

  getPartyPercentages: function () {
    var percentages = [];
    var inputs = $("#myTable > tbody").find('input');
    for (var i = 0; i < inputs.length; i++) {
      percentages.push(parseFloat(inputs[i].value) || 0);
    }
    return percentages;
  },

  calcDistribution: function () {
    // read input
    var percentages = Table.getPartyPercentages();
    // Check input sanity
    if (Utils.sum(percentages) > 100 ) {
      alert("Το συνολικό ποσοστό υπερβαίνει το 100%. Παρακαλώ ελέγξτε τα δεδομένα σας.");
      return false;
    }
    // calculate the total percentage of parties that have not passed the 3% threshold.
    var outOfParliamentPercentage = 100;
    for (var i = 0; i < percentages.length; i++) {
      var p = percentages[i];
      if (p >= 3) {
        outOfParliamentPercentage -= p;
      }
    }
    // Set the out of parliament percentage
    $('#outOfParliamentPercentage').val(outOfParliamentPercentage.toFixed(2));
    // Distribute the parliament seats.
    var result = Table.firstDistribution(percentages, outOfParliamentPercentage);
    var seats = Table.secondDistribution(result.seats, result.remains);
    Table.updateOutput(seats);
  },

  updateOutput: function (seats) {
    var outputs = $("#myTable > tbody").find('output');
    for (var i = 0; i < seats.length; i++) {
      $(outputs[i]).text(seats[i]);
    }
  },

  removeRow: function () {
    $(this).closest('tr').remove();
    Table.calcDistribution();
  },

  createRemoveButton: function () {
    var $button = $('<button>', {
      "class": 'form-control red glyphicon glyphicon-remove',
      "aria-hidden": "true",
    });
    // bind callback
    $button.on("click", Table.removeRow);
    return $button;
  },

  createPartySelect: function () {
    // create select element
    var $select = $('<select>', {
      "data-style": "btn-primary",
      "class": "form-control",
    });

    // Append options.
    $(Table.parties).each(function() {
        $select.append(
            $('<option>', {
                "value": this
            })
            .text(this));
    });

    return $select;
  },

  createPercentageInput: function () {
    var $input = $('<input>', {
      "type": "number",
      "min": "0",
      "max": "100" ,
      //"step": "0.1",
      "class": "form-control",
      "placeholder": "Ποσοστό (%)",
    });
    // bind callback
    $input.on('change', Table.calcDistribution);
    return $input;
  },

  createTotalOutput: function () {
    var $output = $('<output>', {
      'type': 'number',
      'class': 'form-control',
    }).val(0);
    return $output;
  },

  createRow: function () {
    var tds = [
      $('<td>').append(this.createRemoveButton),
      $('<td>').append(this.createPartySelect),
      $('<td>').append(this.createPercentageInput),
      $('<td>').append(this.createTotalOutput),
    ];
    var $row = $('<tr>');
    $row.append(tds);
    return $row;
  },

  addRow: function () {
    var $tbody = $("#myTable > tbody");
    var $row = this.createRow();
    $tbody.append($row);
    return $row;
  },

  createTable: function () {
    // define defaults;
    var defaults = [
      ["ΣΥΡΙΖΑ", 35],
      ["Νέα Δημοκρατία", 30],
      ["ΚΚΕ", 5],
      ["Το Ποτάμι", 5],
      ["Χρυσή Αυγή", 5],
      ["ΠΑΣΟΚ – ΔΗΜΟΚΡΑΤΙΚΗ ΠΑΡΑΤΑΞΗ", 5],
      ["Ανεξάρτητοι Έλληνες", 3],
    ];
    // create the rows and assign the defaults.
    var $tbody = $("#myTable > tbody");
    for (var i = 0; i < defaults.length; i++) {
      var row = this.createRow();
      row.find("select").val(defaults[i][0]);
      row.find("input").val(defaults[i][1]);
      $tbody.append(row);
    }
  },

  bindUIActions: function() {
    $("#add_row_button").click(function () {
      $("#myTable > tbody").append(Table.createRow());
    });
  },

  init: function () {
    this.createTable();
    this.bindUIActions();
    this.calcDistribution();
  },
};

// Execute when ready!
$(document).ready( function () {
  SingleParty.init();
  Table.init();
});
