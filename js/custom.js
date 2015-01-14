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


var Baseline = {
  year: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
  interest: [4.40, 4.60, 2.70, 2.50, 2.70, 3.00, 3.20, 3.20, 3.20, 3.20, 3.50, 3.60, 3.60],
  inflation: [1.10, 1.00, -0.70, -1.10, -0.40, 0.40, 1.10, 1.30, 1.40, 1.70, 1.70, 1.90, 2.00],
  realGrowth: [-4.90, -7.10, -6.40, -4.20, 0.60, 2.90, 3.70, 3.50, 3.30, 3.00, 2.60, 2.00, 1.90],
  SFA: [2.60, 2.70, -32.70, 6.00, -4.50, -2.30, -1.60, -2.80, -2.20, -2.10, -2.60, -1.30, -0.30],
  balance: [-4.90, -2.40, -1.30, 0.00, 1.50, 3.00, 4.50, 4.50, 4.20, 4.20, 4.20, 4.00, 4.00],
  nominalGrowth: [-3.80, -6.10, -7.10, -5.30, 0.20, 3.30, 4.80, 4.80, 4.70, 4.70, 4.30, 3.90, 3.90],
  debt: [ 148.3, 170.2989350372737, 156.86373119836395, 175.78386956528306, 174.16969465423722, 168.36387753520265, 159.69343665680262, 149.95536892158424, 141.40701120064466, 133.08112278802798, 125.26036633327801, 119.59869058833111, 114.95336231906741 ]
};


var Debt = {

  calculate: function () {
    var inflation = Debt.getColumn(2);
    var realGrowth = Debt.getColumn(3);
    var interest = Debt.getColumn(4);
    var balance = Debt.getColumn(5);
    var SFA = Debt.getColumn(6);
    var nominalGrowth = Debt.getColumn(7);
    var debt = Debt.getColumn(8);

    for (var i = 1; i < inflation.length; i++) {
      nominalGrowth[i] = inflation[i] + realGrowth[i];
      debt[i] = debt[i-1] + debt[i-1] * (interest[i] - nominalGrowth[i]) / (100 + nominalGrowth[i]) - balance[i] + SFA[i];
    }
    return {nominalGrowth: nominalGrowth, debt:debt};
  },

  updateTable: function () {
    var result = Debt.calculate();
    Debt.setColumn(7, result.nominalGrowth, 2);
    Debt.setColumn(8, result.debt, 4);
  },

  getColumn: function (index) {
    var selector = "#debtTable tbody tr td:nth-child({index})".replace('{index}', index);
    var tds = $(selector);
    var values = [];
    for (var i = 0; i < tds.length; i++) {
      var element = tds[i].children[0];
      values[i] = parseFloat(element.value);
    }
    return values;
  },

  setColumn: function (index, values, precision) {
    var selector = "#debtTable tbody tr td:nth-child({index}) output".replace('{index}', index);
    var inputs = $(selector);
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].value = values[i].toPrecision(precision);
    }
  },

  createLabel: function () {
    var $output = $('<output>', {
      //"class": "form-control",
    });
    return $output;
  },

  createOutput: function () {
    var $output = $('<output>', {
      "class": "form-control",
    });
    return $output;
  },

  createInput: function () {
    var $input = $('<input>', {
      "type": "number",
      "step": 0.1,
      "class": "form-control",
    });
    $input.on('change', Debt.updateTable);
    return $input;
  },

  createRow: function (index) {
    var $row = $('<tr>');
    $row.append([
      $('<td>').append(this.createLabel().val(Baseline.year[index])),
      $('<td>').append(this.createInput().val(Baseline.inflation[index])),
      $('<td>').append(this.createInput().val(Baseline.realGrowth[index])),
      $('<td>').append(this.createInput().val(Baseline.interest[index])),
      $('<td>').append(this.createInput().val(Baseline.balance[index])),
      $('<td>').append(this.createInput().val(Baseline.SFA[index])),
      $('<td>').append(this.createOutput().val(Baseline.nominalGrowth[index])),
      $('<td>').append(this.createOutput().val(Baseline.debt[index].toPrecision(4))),
    ]);
    return $row;
  },

  createTable: function () {
    for (var i = 0; i < Baseline.debt.length; i++) {
      $('#debtTable tbody').append(this.createRow(i));
    }
  },

  init: function () {
    this.createTable();
  },

};

// Execute when ready!
$(document).ready( function () {
  SingleParty.init();
  Table.init();
  Debt.init();

  // Resize the chart;
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      var chart = $('#one_party_chart').highcharts();
      chart.reflow();
  });
});

