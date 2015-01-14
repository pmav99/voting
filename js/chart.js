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
    this.outside_rate.bind("change", function(e) {
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




// Execute when ready!
$(document).ready( function () {
  SingleParty.init();
});
