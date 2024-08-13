var ctx = document.getElementById("myLineChart").getContext('2d');
let playersMS1;
let playersMS2;
let playersHC;
let playersTeams;
let players1vs1;
let players2vs2;
let currentData;
let gracze = {};
let allTimestamps;
let myLineChart;

    fetch('https://api.codetabs.com/v1/proxy?quest=https://bubbleam.pl/players')
        .then(response => response.json())
        .then(data => {
            //console.log('odp Api :', data);
            gracze = data;
           // console.log('gr: ', gracze);
            playersMS1 = data['443'].sort((a, b) => a[0] - b[0]);
            playersMS2 = data['2053'].sort((a, b) => a[0] - b[0]);
            playersHC = data['2083'].sort((a, b) => a[0] - b[0]);
            playersTeams = data['2096'].sort((a, b) => a[0] - b[0]);
            players1vs1 = data['8443'].sort((a, b) => a[0] - b[0]);
            players2vs2 = data['2087'].sort((a, b) => a[0] - b[0]);
            currentData = playersMS1;
            const colorOfDay = ['red', 'yellow', 'pink', 'orange', 'purple', 'green', 'blue', 'black'];

            myLineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: playersMS1.map(item => new Date(item[0]).toString().slice(0, 21)),     //Oś x MS1
                    datasets: [{
                        //label: 'MS1',
                        data: playersMS1.map(item => item[1]),    //Oś x MS1
                        borderWidth: 1,
                        pointRadius: 0,     // wielkość punktów wartości Y
                        fill: false,
                        spanGaps: true,  //pozwala na przerwy danych
                        cubicInterpolationMode: 'monotone',
                        segment: {                              // Segmentacja wykresu, zmiana koloru linii wykresu
                            borderColor: (ctx) => {
                                const index = ctx.p0.$context.dataIndex; // Uzyskanie indeksu punktu
                                const label = ctx.chart.data.labels[index]; // Uzyskanie etykiety z indeksu punktu
                                const date = new Date(label); // Tworzenie obiektu Date z etykiety
                                const dayOfWeek = date.getDay(); // Pobranie dnia tygodnia (0 = niedziela, 1 = poniedziałek, ..., 6 = sobota)
                                return colorOfDay[dayOfWeek];
                            },
                        }
                    },]
                },
                options: {
                    scales: {
                        x: {
                            ticks: {                    //etykiety
                                maxTicksLimit: 40,
                               color: (context) => colorOfDay[new Date(context.tick['label']).getDay()]
                            },
                        },
                        y: {
                            ticks: {                    //etykiety
                                beginAtZero: true,
                            },
                            title: {
                                display: true,
                                text: 'Number of Players'
                            }
                        }
                    },
                    interaction: {
                        mode: 'nearest',        //najbliższy punkt
                        axis: 'x',              //przesuwanie kursora po osi X
                        intersect: false        //Tooltipy pojawiają się nie tylko nad punktami danych
                    },
                    tooltips: {
                        enabled: true
                    },
                    plugins: {
                        
                        legend: {
                            display: false
                        },
                        zoom: { 
                            pan: {
                                enabled: true,
                                mode: 'x',
                                //scaleMode: 'y',
                                //onZoom: function ({ chart }) {
                               //     console.log('Zoomed:', chart);
                                //}
                            },
                            zoom: { 
                                wheel: { 
                                      enabled: true,
                                      mode: 'x',
                                    speed: 0.1,
                                   
                                      //sensitivity: 100,
                                    //  onZoom: function ({ chart }) {
                                   //   console.log('Zoomed:', chart);
                               // },
                                     // onPan: function ({ chart }) {
                                   //   console.log('Panned:', chart);
                                   //   }
                                },
                                pinch: {
                                    enabled: true
                                }
                             /*   pan: {
                                    enabled: true,
                                    mode: 'x'
                                },*/
                               // mode: 'xy',
                               
                                
                            }
                        }
                    }
                }
            });
        })
    .catch(error => console.error('Błąd pobierania danych:', error));

document.getElementById('MS1').classList.add('active');         //oznaczenie przycisku MS1 jako wciśniętego

let hourlyData = {};      //obiekt z godziną i średnią ilością grraczy w tej godzinie
let Labels2;
function averagePerHour(numberHourToAverage) {
    console.log('gracze: ', gracze);
    hourlyData = {};
    let currentHourKey = null;  // godzina dla której obliczamy średnią
    let currentHourPlayers = [];

    currentData.forEach(entry => {
        const hourKey = Math.floor(entry[0] / 3600000); // hourKey to całkowita liczba godzin z timestamps
        if (currentHourKey === null) currentHourKey = hourKey;
        if (hourKey - currentHourKey < numberHourToAverage) {
            currentHourPlayers.push(entry[1]); // Dodajemy liczba graczy do bieżącej godziny
        }
        else {
            if (currentHourKey !== null) {      // Jeśli zmienia się godzina, obliczamy średnią dla poprzedniej godziny
                const totalPlayers = currentHourPlayers.reduce((sum, num) => sum + num, 0);
                const averagePlayers = totalPlayers / currentHourPlayers.length;
                hourlyData[currentHourKey] = averagePlayers; // Przechowujemy średnią dla poprzedniej godziny
            }
            // Resetujemy dla nowej godziny
            currentHourKey = hourKey;
            currentHourPlayers = [];
            currentHourPlayers.push(entry[1]); // Dodajemy liczba graczy do bieżącej godziny
        }
    });

    if (currentHourPlayers.length > 0) {                        //liczenie średniej dla ostatniej godziny
        const totalPlayers = currentHourPlayers.reduce((sum, num) => sum + num, 0);
        const averagePlayers = totalPlayers / currentHourPlayers.length;
        hourlyData[currentHourKey] = averagePlayers;
    }

    Labels2 = Object.keys(hourlyData).map(hourkey => {        //tworzenie etykiety dla osi x
        const date = new Date(hourkey * 3600000)
        return date.toString().slice(0, 21);
    });
}

const topButtons = document.querySelectorAll('.top-buttons .btn');
const bottomButtons = document.querySelectorAll('.bottom-buttons .btn');

{
    document.getElementById('MS1').addEventListener('click', () => {
        topButtons.forEach(b => b.classList.remove('active'));
        bottomButtons.forEach(b => b.classList.remove('active'));
        document.getElementById('MS1').classList.add('active');
        myLineChart.data.labels = playersMS1.map(item => new Date(item[0]).toString().slice(0, 21));
        myLineChart.data.datasets[0].data = playersMS1.map(item => item[1]);
        myLineChart.update();
        currentData = playersMS1;
    });
    document.getElementById('MS2').addEventListener('click', () => {
        topButtons.forEach(b => b.classList.remove('active'));
        bottomButtons.forEach(b => b.classList.remove('active'));
        document.getElementById('MS2').classList.add('active');
        myLineChart.data.labels = playersMS2.map(item => new Date(item[0]).toString().slice(0, 21));
        myLineChart.data.datasets[0].data = playersMS2.map(item => item[1]);
        myLineChart.update();
        currentData = playersMS2;
    });
    document.getElementById('HC').addEventListener('click', () => {
        topButtons.forEach(b => b.classList.remove('active'));
        bottomButtons.forEach(b => b.classList.remove('active'));
        document.getElementById('HC').classList.add('active');
        myLineChart.data.labels = playersHC.map(item => new Date(item[0]).toString().slice(0, 21));
        myLineChart.data.datasets[0].data = playersHC.map(item => item[1]);
        myLineChart.update();
        currentData = playersHC;
    });
    document.getElementById('Teams').addEventListener('click', () => {
        topButtons.forEach(b => b.classList.remove('active'));
        bottomButtons.forEach(b => b.classList.remove('active'));
        document.getElementById('Teams').classList.add('active');
        myLineChart.data.labels = playersTeams.map(item => new Date(item[0]).toString().slice(0, 21));
        myLineChart.data.datasets[0].data = playersTeams.map(item => item[1]);
        myLineChart.update();
        currentData = playersTeams;
    });
    document.getElementById('1vs1').addEventListener('click', () => {
        topButtons.forEach(b => b.classList.remove('active'));
        bottomButtons.forEach(b => b.classList.remove('active'));
        document.getElementById('1vs1').classList.add('active');
        myLineChart.data.labels = players1vs1.map(item => new Date(item[0]).toString().slice(0, 21));
        myLineChart.data.datasets[0].data = players1vs1.map(item => item[1]);
        myLineChart.update();
        currentData = players1vs1;
    });
    document.getElementById('2vs2').addEventListener('click', () => {
        topButtons.forEach(b => b.classList.remove('active'));
        bottomButtons.forEach(b => b.classList.remove('active'));
        document.getElementById('2vs2').classList.add('active');
        myLineChart.data.labels = players2vs2.map(item => new Date(item[0]).toString().slice(0, 21));
        myLineChart.data.datasets[0].data = players2vs2.map(item => item[1]);
        myLineChart.update();
        currentData = players2vs2;
    });
}       //top-button

{       //bottom-button
    document.getElementById('av1').addEventListener('click', () => {
       bottomButtons.forEach(b => b.classList.remove('active'));
       document.getElementById('av1').classList.add('active');
       averagePerHour(1);
       myLineChart.data.datasets[0].data = Object.values(hourlyData);
       myLineChart.data.labels = Labels2;
       myLineChart.update();
});

    document.getElementById('av2').addEventListener('click', () => {
        bottomButtons.forEach(b => b.classList.remove('active'));
        document.getElementById('av2').classList.add('active');
        averagePerHour(2);
        myLineChart.data.datasets[0].data = Object.values(hourlyData);
        myLineChart.data.labels = Labels2;
        myLineChart.update();
});
    document.getElementById('av3').addEventListener('click', () => {
        bottomButtons.forEach(b => b.classList.remove('active'));
        document.getElementById('av3').classList.add('active');
        averagePerHour(3);
        myLineChart.data.datasets[0].data = Object.values(hourlyData);
        myLineChart.data.labels = Labels2;
        myLineChart.update();
    });
    document.getElementById('av4').addEventListener('click', () => {
        bottomButtons.forEach(b => b.classList.remove('active'));
        document.getElementById('av4').classList.add('active');
        averagePerHour(4);
        myLineChart.data.datasets[0].data = Object.values(hourlyData);
        myLineChart.data.labels = Labels2;
        myLineChart.update();
    });
    document.getElementById('av6').addEventListener('click', () => {
        bottomButtons.forEach(b => b.classList.remove('active'));
        document.getElementById('av6').classList.add('active');
        averagePerHour(6);
        myLineChart.data.datasets[0].data = Object.values(hourlyData);
        myLineChart.data.labels = Labels2;
        myLineChart.update();
    });
    document.getElementById('av12').addEventListener('click', () => {
        bottomButtons.forEach(b => b.classList.remove('active'));
        document.getElementById('av12').classList.add('active');
        averagePerHour(12);
        myLineChart.data.datasets[0].data = Object.values(hourlyData);
        myLineChart.data.labels = Labels2;
        myLineChart.update();
    });
    document.getElementById('av24').addEventListener('click', () => {
        bottomButtons.forEach(b => b.classList.remove('active'));
        document.getElementById('av24').classList.add('active');
        averagePerHour(24);
        myLineChart.data.datasets[0].data = Object.values(hourlyData);
        myLineChart.data.labels = Labels2;
        myLineChart.update();
    });
}     //bottom-button
