import React, { Component } from 'react';
import 'amcharts3/amcharts/amcharts';
import 'amcharts3/amcharts/serial';
import 'amcharts3/amcharts/themes/light';
import AmCharts from "@amcharts/amcharts3-react";
import 'ammap3/ammap/ammap.js';
import 'ammap3/ammap/maps/js/worldLow.js';
import codes from './codes.js';

var flights = ['LAX', 'IAD', 'YYZ', 'LHR'];

var targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";

var planeSVG = "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47";


// Component which contains the dynamic state for the chart
class Map extends Component {
    constructor(props) {
        super(props);

        this.state = {
            latitude: [],
            longitude: [],
            images: [
                {
                    "svgPath": planeSVG,
                    "positionOnLine": 0,
                    "color": "#000000",
                    "alpha": 0.1,
                    "animateAlongLine": true,
                    "lineId": "line2",
                    "flipDirection": false,
                    "loop": true,
                    "scale": 0.03,
                    "positionScale": 1.3
                }, {
                    "svgPath": planeSVG,
                    "positionOnLine": 0,
                    "color": "#232d4b",
                    "animateAlongLine": true,
                    "lineId": "line1",
                    "flipDirection": false,
                    "loop": true,
                    "scale": 0.03,
                    "positionScale": 1.8
                } ],
            config: {},
            zoom: []
        };
    }


    componentDidMount() {
        this.state.zoom = codes[flights[0]];
        console.log('zoom: ' + this.state.zoom)
        for (var airports of flights) {
            var coords = codes[airports];
            this.state.latitude.push(coords[1]);
            this.state.longitude.push(coords[0]);
            var city = {
                "svgPath" : targetSVG,
                "title" : airports,
                "latitude" : coords[1],
                "longitude" : coords[0],
            };
            this.state.images.push(city);
        }
        var config = {
            "type": "map",

            "dataProvider": {
                "map": "worldLow",
                "zoomLevel": 1.5,
                "zoomLongitude": 0,
                "zoomLatitude": 20,

                "lines": [ {
                    "id": "line1",
                    "arc": -0.85,
                    "alpha": 0.3,
                    "latitudes": this.state.latitude,
                    "longitudes": this.state.longitude
                }, {
                    "id": "line2",
                    "alpha": 0,
                    "color": "#000000",
                    "latitudes": this.state.latitude,
                    "longitudes": this.state.longitude
                } ],
                "images": this.state.images
            },

            "areasSettings": {
                "unlistedAreasColor": "#e57200"
            },

            "imagesSettings": {
                "color": "#232d4b",
                "rollOverColor": "#232d4b",
                "selectedColor": "#232d4b",
                "pauseDuration": 0.2,
                "animationDuration": 2.5,
                "adjustAnimationSpeed": false
            },

            "linesSettings": {
                "color": "#232d4b",
                "alpha": 0.4
            },

        }
        this.state.config = config
        console.log(this.state.config)
    }

    render() {
        return (
            <div className="Map">
                <AmCharts.React style={{ width: "100%", height: "500px" }} options={this.state.config} />
            </div>
        );
    }
}

export default Map;
