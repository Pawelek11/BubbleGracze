var ctx = document.getElementById("myLineChart").getContext('2d');
let playersMS1;
let playersMS2;
let playersHC;
let playersTeams;
let players1vs1;
let players2vs2;
let currentData;
let myLineChart;

    fetch('https://api.codetabs.com/v1/proxy?quest=https://bubbleam.pl/players')
        .then(response => response.json())
        .then(data => {
            playersMS1 = data['443'].sort((a, b) => a[0] - b[0]);
            while (playersMS1[0] === 0) playersMS1.shift();

            const startTimestamp = 1724095608000;           // GMT: Monday, 19 August 2024 19:26:48, moment zmiany formatu danych,
                                                            // zapisywanie co minutę i tylko wartości różnych od zera
            
            function fillMissingMinutes(data, startTimestamp) {         // Funkcja do uzupełniania brakujących minut
                const filledData = [];

                let index = 0;
                while (data[index][0] < startTimestamp) {     //omijamy dane z przed 19.08.2024
                    filledData[index] = data[index];
                    index++;
                }
                let prevTimestamp = data[index][0];                 //ust. poprzedni timestamp
                index++;
                for (; index < data.length; index++) {
                    let timestamp = data[index][0];             //ust. timestamp
                    for (let ts = prevTimestamp + 110000; ts < timestamp; ts += 60000) {    //jeśli różnica prawie dwóch minut
                        filledData.push([ts, 0]);                                           // to dodajemy minutę z zerem
                    }
                    filledData.push(data[index]);                           //jeśli nie to przepisujemy dane
                    prevTimestamp = timestamp;
                }
                return filledData;
            }
            // Przekształcanie danych
            playersMS1 = fillMissingMinutes(playersMS1, startTimestamp);

            const colorOfDay = ['red', 'yellow', 'pink', 'orange', 'purple', 'green', 'blue'];
            
            myLineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: playersMS1.map(item => new Date(item[0])),     //Oś x MS1
                    datasets: [{
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
                                maxTicksLimit: 30,
                                color: (context) => colorOfDay[new Date(context.tick['label']).getDay()]
                            },
                            font: {
                                size: 12
                            },
                        type: 'time',
                        time: {
                                tooltipFormat: 'dd MMM yyyy HH:mm',         // format wyświetlania w podpowiedzi
                                displayFormats: {                           // // format wyświetlania etykiet, dobierany automatycznie przez wykres
                                    day: 'dd MMM yyyy ',
                                    hour: 'dd MMM yyyy',          // format wyświetlania godzin
                                    minute: 'dd MMM HH:mm',
                                },
                            },
                        },
                        y: {
                            ticks: {                    //etykiety
                                beginAtZero: true,
                            },
                            title: {
                                display: true,
                                text: 'Number of Players'
                            },
                            min: 0
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
                            limits: {
                                x: {
                                    min: 'original', max: 'original', minRange:  6 * 60 * 60 * 1000 // Zakres powiększania, min 6*60*60*1000ms = 6h
                                }
                            },
                            pan: {
                                enabled: true,
                                mode: 'x',
                            },
                            zoom: { 
                                
                                wheel: { 
                                      enabled: true,
                                      mode: 'x',
                                    speed: 0.5,
                                    sensitivity: 1,
                                },
                                pinch: {
                                    enabled: true
                                },
                                mode: 'x',
                            }
                        }
                    }
                }
            });
            {
            playersMS2 = data['2053'].sort((a, b) => a[0] - b[0]);
            while (playersMS2[0] === 0) playersMS2.shift();
            playersMS2 = fillMissingMinutes(playersMS2, startTimestamp);

            playersHC = data['2083'].sort((a, b) => a[0] - b[0]);
            while (playersHC[0] === 0) playersHC.shift();
            playersHC = fillMissingMinutes(playersHC, startTimestamp);

            playersTeams = data['2096'].sort((a, b) => a[0] - b[0]);
            while (playersTeams[0] < 5) playersTeams.shift();
            playersTeams = fillMissingMinutes(playersTeams, startTimestamp);

            players1vs1 = data['8443'].sort((a, b) => a[0] - b[0]);
            while (players1vs1[0] === 0) players1vs1.shift();
            players1vs1 = fillMissingMinutes(players1vs1, startTimestamp);

            players2vs2 = data['2087'].sort((a, b) => a[0] - b[0]);
            while (players2vs2[0] === 0) players2vs2.shift();
            players2vs2 = fillMissingMinutes(players2vs2, startTimestamp);
            currentData = playersMS1;
            }  
            currentData = playersMS1;
        })
    .catch(error => console.error('Błąd pobierania danych:', error));

document.getElementById('MS1').classList.add('active');         //oznaczenie przycisku MS1 jako wciśniętego

let hourlyData = {};      //obiekt z godziną i średnią ilością grraczy 
let Labels2;
function averagePerHour(numberHourToAverage) {
    hourlyData = {};
    let currentHourKey = null;  // godzina dla której obliczamy średnią
    let currentHourPlayers = [];

    currentData.forEach(entry => {
        const hourKey = Math.floor(entry[0] / 3600000);             // hourKey to całkowita liczba godzin z timestamps
        if (currentHourKey === null) currentHourKey = hourKey;
        if (hourKey - currentHourKey < numberHourToAverage) {
            currentHourPlayers.push(entry[1]);             // Dodajemy liczba graczy do bieżącej godziny
        }
        else {
            if (currentHourKey !== null) {          // Jeśli zmienia się godzina, obliczamy średnią dla poprzedniej godziny
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
        return new Date(hourkey * 3600000);
    });
};

const topButtons = document.querySelectorAll('.top-buttons .btn');
const bottomButtons = document.querySelectorAll('.bottom-buttons .btn');

function topBtnAction(players, activeBtn) {
    myLineChart.data.labels = players.map(item => new Date(item[0]));
    myLineChart.data.datasets[0].data = players.map(item => item[1]);
    topButtons.forEach(b => b.classList.remove('active'));
    bottomButtons.forEach(b => b.classList.remove('active'));
    myLineChart.resetZoom();
    myLineChart.update();
    currentData = players;
    document.getElementById(activeBtn).classList.add('active');
};

function bottomBtnAction(numAvgHour, activeBtn) {
    bottomButtons.forEach(b => b.classList.remove('active'));
    document.getElementById(activeBtn).classList.add('active');
    myLineChart.resetZoom();
    averagePerHour(numAvgHour);
    myLineChart.data.datasets[0].data = Object.values(hourlyData);
    myLineChart.data.labels = Labels2;
    myLineChart.update();
};

{
    document.getElementById('MS1').addEventListener('click', () => {
        topBtnAction(playersMS1, 'MS1');
    });

    document.getElementById('MS2').addEventListener('click', () => {
        topBtnAction(playersMS2, 'MS2');
    });

    document.getElementById('HC').addEventListener('click', () => {
        topBtnAction(playersHC, 'HC');
    });

    document.getElementById('Teams').addEventListener('click', () => {
        topBtnAction(playersTeams, 'Teams');
    });

    document.getElementById('1vs1').addEventListener('click', () => {
        topBtnAction(players1vs1, '1vs1');
    });

    document.getElementById('2vs2').addEventListener('click', () => {
        topBtnAction(players2vs2, '2vs2');
    });
}       //top-button

{       //bottom-button
    document.getElementById('av1').addEventListener('click', () => {
        bottomBtnAction(1, 'av1');
    });

    document.getElementById('av2').addEventListener('click', () => {
        bottomBtnAction(2, 'av2');
    });
    document.getElementById('av3').addEventListener('click', () => {
        bottomBtnAction(3, 'av3');
    });

    document.getElementById('av4').addEventListener('click', () => {
        bottomBtnAction(4, 'av4');
    });

    document.getElementById('av6').addEventListener('click', () => {
        bottomBtnAction(6, 'av6');
    });

    document.getElementById('av12').addEventListener('click', () => {
        bottomBtnAction(12, 'av12');
    });
    
    document.getElementById('avD').addEventListener('click', () => {
        bottomBtnAction(24, 'avD');
    });

    document.getElementById('avW').addEventListener('click', () => {
        bottomBtnAction(168, 'avW');
    });

    document.getElementById('avM').addEventListener('click', () => {
        bottomBtnAction(732, 'avM');
    });

    document.getElementById('avY').addEventListener('click', () => {
        bottomBtnAction(8760, 'avY');
    });
}     //bottom-button
