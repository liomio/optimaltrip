import React, { Component } from 'react';
import 'amcharts3/amcharts/amcharts';
import 'amcharts3/amcharts/serial';
import 'amcharts3/amcharts/themes/light';
import AmCharts from "@amcharts/amcharts3-react";
import 'ammap3/ammap/ammap.js'
import 'ammap3/ammap/maps/js/worldLow.js'


// Component which contains the dynamic state for the chart
class Map extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        var config = {
            /**
             * this tells amCharts it's a map
             */
            "type": "map",

            /**
             * create data provider object
             * map property is usually the same as the name of the map file.
             * getAreasFromMap indicates that amMap should read all the areas available
             * in the map data and treat them as they are included in your data provider.
             * in case you don't set it to true, all the areas except listed in data
             * provider will be treated as unlisted.
             */
            "dataProvider": {
                "map": "worldLow",
                "getAreasFromMap": true
            },

            /**
             * create areas settings
             * autoZoom set to true means that the map will zoom-in when clicked on the area
             * selectedColor indicates color of the clicked area.
             */
            "areasSettings": {
                "autoZoom": true,
                "selectedColor": "#CC0000"
            },

            /**
             * let's say we want a small map to be displayed, so let's create it
             */
            "smallMap": {}
        }
        return (
            <div className="Map">
                <AmCharts.React style={{ width: "100%", height: "500px" }} options={config} />
            </div>
        );
    }
}

export default Map;
