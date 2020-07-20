import React, { Component } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, OverlayView, InfoWindow } from "react-google-maps";
import { SearchBox } from "react-google-maps/lib/components/places/SearchBox";
import Geocode from "react-geocode";
import _ from "lodash";
import './map.scss';
import db from '../db.json';

const mapOptions = {
    fullscreenControl: false,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    minZoom: 7
    // componentRestrictions: { LatLngBounds: {
    //     north: 35.773500,
    //     south: 34.902743,
    //     west: 31.323394,
    //     east: 32.946525
    // }, strictBounds: true
    //  }
};

const SHOFAR_BLOWER = 'shofar blower';
const SHOFAR_BLOWING_PUBLIC = 'shofar blowing public';
const ISOLATED = 'isolated';

export default class MyTestComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isMarkerShown: false,
            activeMarker: false,
            center: {},
            allLocations: []
        }
        this.mapRef = React.createRef();
    }

    componentDidMount() {
        (async () => {
            this.mapRef.current && this.mapRef.current.panToBounds()

            //     NW: { lat: 33.348105, lan: 34.066793 },
            //     SW: { lat: 29.513980, lan: 33.696013 },
            //     SE: { lat: 29.517320, lan: 35.619917 },
            //     NE: { lat: 33.350947, lan: 35.872503 }
            // })
            Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
            Geocode.setLanguage("he");

            if (this.props.publicMap) await this.setPublicMapContent();
            Geocode.fromAddress("ירושלים").then(
                response => {
                    console.log(response, 'res')
                    const { lat, lng } = response.results[0].geometry.location;
                    this.setState({ center: { lat, lng } });
                },
                error => {
                    console.log(error);
                }
            );
        })();
    }

    setPublicMapContent = async () => {
        db.isolateds.forEach((isolated) => {
            Geocode.fromAddress(isolated.address).then(
                response => {
                    const { lat, lng } = response.results[0].geometry.location;
                    let allLocations = this.state.allLocations;
                    const shofarBlowerName = db.shofarlowers.find((shofarBlower) => shofarBlower.id === isolated.shofarBlowerId).name;
                    allLocations.push({
                        type: ISOLATED, location: { lat, lng }, info:
                            <div id="info-window-container"><div className="info-window-header">תקיעה פרטית</div>
                                <div id="pub-shofar-blower-name-container"><img src={'/icons/shofar.svg'} /><div>{shofarBlowerName}</div></div>
                                <div>לא ניתן להצטרף לתקיעה זו</div></div>
                    });
                    this.setState({ allLocations: allLocations });
                },
                error => {
                    console.log(error);
                }
            );
        });

        db.pubSHofarBlowing.forEach((pub) => {
            Geocode.fromAddress(pub.address).then(
                response => {
                    const { lat, lng } = response.results[0].geometry.location;
                    let allLocations = this.state.allLocations;
                    let shofarBlowerInfo = db.shofarlowers.find((shofarBlower) => shofarBlower.id === pub.shofarBlowerId);
                    allLocations.push({
                        type: SHOFAR_BLOWING_PUBLIC, location: { lat, lng }, info:
                            <div id="info-window-container">
                                <div className="info-window-header">תקיעה ציבורית</div>
                                <div id="pub-shofar-blower-name-container"><img src={'/icons/shofar.svg'} /><div>{shofarBlowerInfo.name}</div></div>
                                <div id="pub-address-container"><img src={'/icons/address.svg'} /><div>{pub.address}</div></div>
                                <div id="pub-start-time-container"><img src={'/icons/clock.svg'} /><div>{pub.startTime}</div></div>
                                <div className="notes">ייתכנו שינויי בזמני התקיעות</div>
                                <div className="notes">יש להצטרף לתקיעה על מנת להתעדכן</div>
                                <div id="join-button">הצטרף לתקיעה</div>
                            </div>
                    });
                    this.setState({ allLocations: allLocations });
                },
                error => {
                    console.log(error);
                }
            );
        })
    }

    changeCenter = (newCenter) => {
        this.setState({ center: newCenter });
    }

    getCenter = () => {
        return this.state.center;
    }
    // setRoute = (startPoint, points) => {
    //     let google = window.google;
    //     this.directionsRenderer = new google.maps.DirectionsRenderer();//used to be called directionsDisplay
    //     this.directionsService = new google.maps.DirectionsService();
    //     let otherPoints = [];
    //     let lastStop = {};
    //     if (points.length > 1) {
    //         for (let i = 0; i < points.length; i++) {
    //             if (i !== points.length - 1) otherPoints.push(points[i]);
    //             else lastStop = points[i];
    //         }

    //     }

    //     this.directionsService.route({
    //         origin: startPoint, //our real origin
    //         destination: dirForth ? this.props.ride.destination : this.props.ride.destination[0],
    //         waypoints: arrangedList,
    //         provideRouteAlternatives: false,
    //         travelMode: 'DRIVING'
    //     }, (response, status) => {
    //         if (status === 'OK') {
    //             console.log("setRoute response ronit", response)
    //             let displayRes = JSON.parse(JSON.stringify(response));
    //             delete displayRes.routes[0].legs;
    //             firstTime && directionsRenderer.setDirections(displayRes); //draw route
    //             this.calculateStationsTime(response.routes[0].legs);
    //             this.inStation(response);
    //             this.alertChildren();
    //         } else console.log('Directions request failed due to ' + status);
    //     });
    // }

    render() {
        console.log(this.mapRef.current && this.mapRef.current.state)
        return (
            <div id="map-contaoner">
                <MyMapComponent
                    mapRef={this.mapRef}
                    getCenter={this.getCenter}
                    changeCenter={this.changeCenter}
                    allLocations={this.state.allLocations}
                    center={Object.keys(this.state.center).length ? this.state.center : { lat: 31.7767257, lng: 35.2346218 }}
                    isMarkerShown={this.state.isMarkerShown}
                    googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY}`}
                    loadingElement={<img src='/icons/loader.svg' />}
                    containerElement={<div style={{ height: `100vh` }} />}
                    mapElement={<div style={{ height: `100%` }} />}
                />
            </div>
        );
    }
}


const MyMapComponent = withScriptjs(withGoogleMap((props) =>
    <GoogleMap
        ref={props.mapRef}
        defaultZoom={20}
        defaultOptions={mapOptions}
        bounds={{

            NW: { lat: 33.348105, lan: 34.066793 },
            SW: { lat: 29.513980, lan: 33.696013 },
            SE: { lat: 29.517320, lan: 35.619917 },
            NE: { lat: 33.350947, lan: 35.872503 }
        }}

        center={props.center}>
        <SearchBoxCreator changeCenter={props.changeCenter} getCenter={props.getCenter} />
        {props.isMarkerShown && <Marker position={props.center} />}
        {props.allLocations && props.allLocations.map((locationInfo, index) => {
            return <MarkerCreator key={index} locationInfo={locationInfo} />
        })}
    </GoogleMap>
));

class MarkerCreator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isInfoWindowOpen: false
        }
    }

    closeOrOpenInfoWindow = () => {
        this.setState({ isInfoWindowOpen: !this.state.isInfoWindowOpen });
    }

    render() {
        const { info, location, type } = this.props.locationInfo;
        const icon = {
            url: type === ISOLATED ? '/icons/single-blue.svg' : '/icons/group-orange.svg',
            scaledSize: type === ISOLATED ? new window.google.maps.Size(50, 50) : new window.google.maps.Size(85, 85), // scaled size
            origin: new window.google.maps.Point(0, 0), // origin
            anchor: new window.google.maps.Point(0, 0)
        }
        return (<Marker
            icon={icon}
            onClick={this.closeOrOpenInfoWindow}
            position={{ lat: location.lat, lng: location.lng }}

        >
            {this.state.isInfoWindowOpen && <InfoWindow onCloseClick={this.closeOrOpenInfoWindow}>{info}</InfoWindow>}
        </Marker>);
    }
}

class SearchBoxCreator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bounds: {}
        }
        this.SearchBoxRef = React.createRef();
    }

    componentDidMount() {
        var bounds = new window.google.maps.LatLngBounds();
        Geocode.fromAddress('ישראל').then(
            response => {
                const { lat, lng } = response.results[0].geometry.location;
                this.setState({ bounds: { lat, lng } }, () => console.log(this.state.bounds)
                );
            },
            error => {
                console.log(error);
            }
        );
    }

    onPlacesChanged = () => {
        let places = this.SearchBoxRef.current.getPlaces();
        const bounds = new window.google.maps.LatLngBounds();
        console.log(bounds, '1');
        places.forEach(place => {
            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport)
            } else {
                bounds.extend(place.geometry.location)
            }
        });
        console.log(bounds, '2');


        const nextMarkers = places.map(place => ({
            position: place.geometry.location,
        }));
        const nextCenter = _.get(nextMarkers, '0.position', this.props.getCenter());
        this.props.changeCenter(nextCenter);
        // this.SearchBoxRef.current.map.fitBounds(bounds);
    }

    render() {

        return (<SearchBox
            strictBounds={true}
            ref={this.SearchBoxRef}
            controlPosition={window.google.maps.ControlPosition.TOP_CENTER}
            onPlacesChanged={this.onPlacesChanged}
        >
            <div id="search-input-container">
                <input
                    id="search-input"
                    type="text"
                    placeholder="חיפוש"
                />
                <img id="search-icon" src="/icons/search.svg" />
            </div>
        </SearchBox>);
    }
}