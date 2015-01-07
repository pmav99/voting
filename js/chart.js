
function create_chart() {

    function get_necessary_rates_curve() {
        var factor = 101/250;
        var rates = [];
        for (var i = 0; i < 21; i++) {
            rates[i] = [i, factor * (100 - i)];
        }
        return rates;
    }

    function format_percentages() {
        return Highcharts.numberFormat(this.value, 1) + '%';
    }

    $('#rate_chart').highcharts({
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
                formatter: format_percentages
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
                formatter: format_percentages
            },
            min: 30,
            max: 42.5
        },
        tooltip: {
            valueSuffix: ' %',
            formatter: function () {
                return Highcharts.numberFormat(this.y, 1) + " %";
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [
            {
                name: "Καμπύλη",
                data: get_necessary_rates_curve()
            },
            {
                name: "Custom",
                data: [[]]
            }
        ]
    });
}

function add_or_update_chart_series(chart, data, index) {
    var chart_series = chart.series;
    if (chart_series.length > index) {
        chart_series[index].setData(data);
    } else {
        chart_series.push({
            name: "Custom",
            data: data
        });
    }
}

function get_necessary_rate(num) {
    return 101/250 * (100 - num);
}

function update_chart(x, y) {
    var chart = $('#rate_chart').highcharts();
    var min_y = 0;//chart.yAxis.min;
    var data = [[x, min_y], [x, y], [0, y]];
    add_or_update_chart_series(chart, data, 1);
}

function update_output_element(y) {
    $('#necessary_rate').val(y.toPrecision(3));
}

$(document).ready( function () {

    // Bind the "input" event of the input elements to update the chart!
    $('#rate_outside_parliament').bind("input", function (evnt) {
        // calculate the values!
        var x = parseFloat($('#rate_outside_parliament').val()) || 0;
        var y = get_necessary_rate(x);
        // Time to update!
        update_chart(x, y);
        update_output_element(y);
    });

    // Create and Update chart!
    create_chart();
    $('#rate_outside_parliament').trigger("input");

});



