'use strict';

var data = null;

var request = new XMLHttpRequest();

request.open('GET', 'stacks/' + trackpt + '.json', false);
request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; Charset=utf-8');

request.send(null);

if (request.readyState === 4  && request.status === 200) {
  data = JSON.parse(request.responseText);
} else {
  location.reload(true);
}

(function ($) {
  $(document).ready(function () {
    //
    // Serialize Data
    //

    var current = new Date()

    data.serialized = []

    Object.keys(data).map(function(el) { return data[el] }).forEach(function(hourly) {
      Object.keys(hourly).map(function(el) { return hourly[el] }).forEach(function(minutely) {
        if (typeof minutely == 'string' || minutely == '') return

        Object.keys(minutely).map(function(el) { return minutely[el] }).forEach(function(rd) {
          data.serialized.push(Number(rd) || 0)
        })
      })
    })

    data.serialized.recent = {}

    data.serialized.recent.all = data.serialized[data.serialized.length - 1]
    data.serialized.recent.one_hour = data.serialized.slice(Math.max(data.serialized.length - 60, 1))
    data.serialized.recent.thirty_minute = data.serialized.slice(Math.max(data.serialized.length - 30, 1))
    data.serialized.recent.ten_minute = data.serialized.slice(Math.max(data.serialized.length - 10, 1))

    $('h3.page-title').text(data.title)

    $('h6.stats-small__value.count.my-3.10m').text(Number(data.serialized.recent.all) - Number(data.serialized.recent.ten_minute[0]))
    $('h6.stats-small__value.count.my-3.30m').text(Number(data.serialized.recent.all) - Number(data.serialized.recent.thirty_minute[0]))
    $('h6.stats-small__value.count.my-3.1h').text(Number(data.serialized.recent.all) - Number(data.serialized.recent.one_hour[0]))
    $('h6.stats-small__value.count.my-3.all').text(Number(data.serialized.recent.all))

    //
    // Small Stats
    //

    // Datasets
    var boSmallStatsDatasets = [
      {
        backgroundColor: 'rgba(0, 184, 216, 0.1)',
        borderColor: 'rgb(0, 184, 216)',
        data: data.serialized.recent.ten_minute,
      },
      {
        backgroundColor: 'rgba(23,198,113,0.1)',
        borderColor: 'rgb(23,198,113)',
        data: data.serialized.recent.thirty_minute
      },
      {
        backgroundColor: 'rgba(255,180,0,0.1)',
        borderColor: 'rgb(255,180,0)',
        data: data.serialized.recent.one_hour
      },
      {
        backgroundColor: 'rgba(255,65,105,0.1)',
        borderColor: 'rgb(255,65,105)',
        data: []
      }
    ];

    // Options
    function boSmallStatsOptions(max) {
      return {
        maintainAspectRatio: true,
        responsive: true,
        // Uncomment the following line in order to disable the animations.
        // animation: false,
        legend: {
          display: false
        },
        tooltips: {
          enabled: false,
          custom: false
        },
        elements: {
          point: {
            radius: 0
          },
          line: {
            tension: 0.3
          }
        },
        scales: {
          xAxes: [{
            gridLines: false,
            scaleLabel: false,
            ticks: {
              display: false
            }
          }],
          yAxes: [{
            gridLines: false,
            scaleLabel: false,
            ticks: {
              display: false,
              // Avoid getting the graph line cut of at the top of the canvas.
              // Chart.js bug link: https://github.com/chartjs/Chart.js/issues/4790
              suggestedMax: max
            }
          }],
        },
      };
    }

    // Generate the small charts
    boSmallStatsDatasets.map(function (el, index) {
      var chartOptions = boSmallStatsOptions(Math.max.apply(Math, el.data) + 1);
      var ctx = document.getElementsByClassName('overview-stats-small-' + (index + 1));
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ["Label 1", "Label 2", "Label 3", "Label 4", "Label 5", "Label 6", "Label 7"],
          datasets: [{
            label: 'Today',
            fill: 'start',
            data: el.data,
            backgroundColor: el.backgroundColor,
            borderColor: el.borderColor,
            borderWidth: 1.5,
          }]
        },
        options: chartOptions
      });
    });

    var ouCtx = document.getElementsByClassName('overview-users')[0];

    var ouData = {
      labels: Array.from(new Array(30), function (_, i) {
        return i === 0 ? 1 : i;
      }),
      datasets: [{
        label: '청원 동의 (명)',
        fill: 'start',
        data: data.serialized.recent.thirty_minute,
        backgroundColor: 'rgba(0,123,255,0.1)',
        borderColor: 'rgba(0,123,255,1)',
        pointBackgroundColor: '#ffffff',
        pointHoverBackgroundColor: 'rgb(0,123,255)',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3
      }]
    };

    var ouOptions = {
      responsive: true,
      legend: {
        position: 'top'
      },
      elements: {
        line: {
          tension: 0.3
        },
        point: {
          radius: 0
        }
      },
      scales: {
        xAxes: [{
          gridLines: false,
          ticks: {
            callback: function (tick, index) {
              return index % 7 !== 0 ? '' : tick;
            }
          }
        }],
        yAxes: [{
          ticks: {
            suggestedMax: 45,
            callback: function (tick, index, ticks) {
              if (tick === 0) {
                return tick;
              }
              return tick > 999 ? (tick/ 1000).toFixed(1) + 'K' : tick;
            }
          }
        }]
      },
      hover: {
        mode: 'nearest',
        intersect: false
      },
      tooltips: {
        custom: false,
        mode: 'nearest',
        intersect: false
      }
    };

    window.overviewUsers = new Chart(ouCtx, {
      type: 'LineWithLine',
      data: ouData,
      options: ouOptions
    });

    var aocMeta = overviewUsers.getDatasetMeta(0);
    aocMeta.data[0]._model.radius = 0;
    aocMeta.data[ouData.datasets[0].data.length - 1]._model.radius = 0;

    window.overviewUsers.render();

  });
})(jQuery);
