let data = Highcharts.geojson(Highcharts.maps['cn/china']);

let provinces = {};
Highcharts.each(data, function (d) {
    provinces[d.name] = d;
    d.drilldown = d.name;
    d.value = 0;
    d.cities = {};
    d.people = [];
});

for (let s of students) {
    provinces[s.province].value++;
    provinces[s.province].people.push(s)
}

for (let p of Object.values(provinces)) {
    let filename = p.properties.filename;
    if (!Highcharts.maps[`cn/${filename}`]) {
        continue;
    }
    let subData = p.subData = Highcharts.geojson(Highcharts.maps[`cn/${filename}`]);
    Highcharts.each(subData, function (city) {
        p.cities[city.name] = city;
        city.value = 0;
        city.people = [];
    });
    for (let s of students) {
        if (p.cities[s.city] !== undefined) {
            p.cities[s.city].value++;
            p.cities[s.city].people.push(s);
        }
    }
}
// 初始化图表
let map = new Highcharts.Map('map', {
chart: {
    events: {
        drilldown: function (e) {
            let name = e.point.name;
            this.setTitle(null, {text: name});
        },
        drillup: function () {
            data = Highcharts.maps['cn/china'];
            this.setTitle(null, {
                text: '中国'
            });
        }
    }
},

title: {
    text: '海口实验中学2024届七班蹭饭地图',
    style: {"color": "#333333", "fontSize": "24px"}
},

subtitle: {
    text: '中华人民共和国',
    floating: true,
    y: 50,
    style: {
        fontSize: '16px'
    }
},

tooltip: {
    useHTML: true,
    backgroundColor: '#3399FF',
    borderRadius: 5,
    padding: 12,
    style: {
        'color': '#dddddd',
        'cursor': 'default',
        'fontSize': '15px',
        'pointerEvents': 'none',
        'whiteSpace': 'nowrap'
    },
    formatter: formatter
},

colorAxis: {
    min: 0,
    max: 15,
    type: 'linear',
    minColor: 'rgba(0, 108, 238, 0)',
    maxColor: 'rgba(0, 108, 238, 1)',
    stops: [
        [0, 'rgba(0, 108, 238, 0)'],
        [0.02, 'rgba(0, 108, 238, 0.02)'],
        [0.04, 'rgba(0, 108, 238, 0.04)'],
        [0.1, 'rgba(0, 108, 238, 0.1)'],
        [0.5, 'rgba(0, 108, 238, 0.5)'],
        [1, 'rgba(0, 108, 238, 1)']
    ]
},

series: [{
    data: data,
    name: '各省人数',
    joinBy: 'name',
    tooltip: {
        pointFormat: `{point.name}: {point.value}`
    }
}],

drilldown:
    {
        activeDataLabelStyle: {
            color: '#FFFFFF',
            textDecoration:
                'none',
            textShadow:
                '0 0 3px #000000'
        }
        ,
        drillUpButton: {
            relativeTo: 'spacingBox',
            position:
                {
                    x: 0,
                    y: 60
                }
        },
        series: makeSeries()
    },

mapNavigation: {
    enabled: true,
    buttonOptions:
        {
            verticalAlign: 'bottom'
        }
}
});

function makeSeries() {
    let series = [];
    for (let p of Object.values(provinces)) {
        if (p.subData) {
            series.push({
                id: p.name,
                name: p.name,
                data: p.subData,
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                }
            })
        }
    }
    return series;
}

function formatter() {
    let template = `
    <div class="tooltip">
        <div class="series">{{series}}</div>
        <div class="profile">
            <div class="name">{{name}}:</div>
            <div class="value">{{value}}人</div>
        </div>
        <div class="list">
            {% for p in people %}
            <div class="pinfo">
                <div class="pname">{{p.name}}</div>
                <div class="city">{{p.city}}</div>
                <div class="school">{{p.school}}</div>
            </div>
            {% endfor %}
        </div>
    </div>
    `;

    return nunjucks.renderString(template, {
        name: this.point.name,
        series: this.series.name,
        value: this.point.value,
        people: this.point.people
    })
}
