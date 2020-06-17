//import  CancellationToken  from 'cancellationtoken';
document.addEventListener('DOMContentLoaded', function () {
    var samples = 12;//ok 2h
    var speed = 250;
    var values = [];
    var valuesmax = [];
    var valuesmin = [];
    var labels = [];
    var charts = [];
    var value = 0;
    var utils = Samples.utils;
    var dt = [];

    values.length = samples;
    valuesmin.length = samples;
    valuesmax.length = samples;
    labels.length = samples;
    dt.length = samples;
    dt.fill(0);
    //values.fill(0);
    //valuesmin.fill(-10);
    //valuesmax.fill(30);
    labels.fill(0);
    var time_Array = ["2018-12-07 15:45:17", "2018-12-07 15:30:17", "2018-12-07 15:15:16", "2018-12-07 15:00:17", "2018-12-07 14:45:16", "2018-12-07 14:30:17", "2018-12-07 14:15:17", "2018-12-07 14:00:17", "2018-12-07 13:45:17", "2018-12-07 13:30:16", "2018-12-07 13:15:17", "2018-12-07 16:00:17"];

    window.chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(231,233,237)'
    };
    var chart = new Chart(document.getElementById("chart"),
        {
            type: 'line',
            data: {
                labels: dt,
                datasets: [
                    {
                        data: values,
                        backgroundColor: window.chartColors.yellow,
                        borderColor: window.chartColors.yellow,
                        label: 'Aktualna temp.',
                        fill: false
                    },
                    {
                        data: valuesmax,
                        backgroundColor: utils.transparentize(window.chartColors.red),
                        borderColor: window.chartColors.red,


                        label: 'Max',
                        fill: false
                    },
                    {
                        data: valuesmin,
                        backgroundColor: utils.transparentize(window.chartColors.blue),
                        borderColor: window.chartColors.blue,
                        label: 'Min',
                        hidden: false,
                        fill: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{
                        display: false,

                    }
                    ],
                    yAxes: [
                        {
                            ticks: {
                                autoSkip: false,
                                maxRotation: 0
                            }
                        }
                    ]
                }
            }
        });

    var connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:44381/currencyHub").build();


    function encodeText(text) {
        if (text !== undefined && text !== null) {
            text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const encodedHtml = $("<div />").text(text).html();
            return encodedHtml;
        }
        return "";
    }
    //const { cancel, token } = CancellationToken.create()
    //console.log(token.isCancelled) // prints false
    //cancel()
    //console.log(token.isCancelled) // prints true
    $("#sendmessage2").click(function (event) {
        event.preventDefault();

        console.log("work");
        const cancellationToken = {
            //Content: $("#message").val(),
            IsCancellationRequested: new Boolean(true)
        };
        const message = {
            //Content: $("#message").val(),
            City: $("#city  option:selected").text()
        };
        connection.invoke("SendMessageToUser", message, cancellationToken);

    });

    connection.on("ReceiveMessage", function (message) {
        const li = $("<li>");
        li.html(encodeText(message.currentDataTime) + " - " + message.currentTemp + "°C " + '<br/>' +
            encodeText(message.city) + " ciśnienie: " + message.pressure);
        $("#discussion").append(li);

        document.getElementById("weathericon").src = "http://openweathermap.org/img/wn/" + encodeText(message.icon) + "@2x.png";

        values.push(message.currentTemp);
        values.shift();
        valuesmax.push(message.maxTemp)
        valuesmax.shift();
        valuesmin.push(message.minTemp)
        valuesmin.shift();
        dt.push(message.currentDataTime)
        dt.shift();
        chart.update();
    });

    connection.start();
});
