import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';

import './main.html';

var MAP_ZOOM = 15;

Meteor.startup(function () {
    GoogleMaps.load({
        libraries: 'visualization'
    });
});

Template.waterprint.onCreated(function () {
    var self = this;

    GoogleMaps.ready('map', function (map) {
        var marker;
        var heatmap;

        // Create and move the marker when latLng changes.
        self.autorun(function () {
            var latLng = Geolocation.latLng();
            if (!latLng)
                return;

            // If the marker doesn't yet exist, create it.
            if (!marker) {
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(latLng.lat, latLng.lng),
                    map: map.instance
                });
            }
            // The marker already exists, so we'll just change its position.
            else {
                marker.setPosition(latLng);
            }
            heatmap = new google.maps.visualization.HeatmapLayer({
                data: getPoints(latLng),
                radius: 20
            });
            heatmap.setMap(map.instance);

            // Center and zoom the map view onto the current position.
            map.instance.setCenter(marker.getPosition());
            map.instance.setZoom(MAP_ZOOM);

            function getPoints(latLng) {
                return [
                    {
                        location: new google.maps.LatLng(latLng.lat, latLng.lng),
                        weight: 10
                    }
                ]
            }
        });
    });
});

Template.waterprint.onRendered(function () {
    GoogleMaps.load();
});

Template.waterprint.helpers({
    counter() {
        return Template.instance().counter.get();
    },
    geolocationError: function () {
        var error = Geolocation.error();
        return error && error.message;
    },
    mapOptions: function () {
        var latLng = Geolocation.latLng();
        // Initialize the map once we have the latLng.
        if (GoogleMaps.loaded() && latLng) {
            return {
                center: new google.maps.LatLng(latLng.lat, latLng.lng),
                zoom: MAP_ZOOM
            };
        }
    }
});

Template.waterprint.events({
    'click button'(event, instance) {
        // increment the counter when button is clicked
        instance.counter.set(instance.counter.get() + 1);
    }
});

Template.graph.onRendered(function () {
    var $slider = $('#slider');
    var $chevron = $slider.find('.fa');
    var $body = $('body');
    var $graphContainer = $('.graph-container');
    $slider.swipe({
        swipe: function(event, direction, distance, duration, fingerCount, fingerData) {
            if (direction === 'up') {
                $body.addClass('full-view');
                $chevron.removeClass('fa-chevron-up');
                $chevron.addClass('fa-chevron-down');
            } else if (direction === 'down') {
                $body.removeClass('full-view');
                $chevron.addClass('fa-chevron-up');
                $chevron.removeClass('fa-chevron-down');
            }
        },
        //Default is 75px, set to 0 for demo so any distance triggers swipe
        threshold:0
    });


    var waterHpChart = {
        target: 'water-health',
        type: 'BarChart',
        columns: [
            ['string', ''],
            ['number', '']
        ],
        rows: [
            ['', 0.8]
        ],
        options: {
            title: '',
            width: window.innerWidth,
            height: window.innerHeight * 0.1 - 20,
            legend: { position: 'none' },
            titlePosition: 'none',
            backgroundColor: 'transparent',
            hAxis: {
                minValue: 0,
                maxValue: 1,
                baselineColor: 'white',
                gridLines: {
                    color: 'white',
                    count: 2
                }
            },
            vAxis: {
                textStyle: {
                    color: '#FFF'
                }
            }
        }
    };

    drawChart(waterHpChart);
});

Template.graph.events({
});
