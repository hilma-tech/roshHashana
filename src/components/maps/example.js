
import React, { Component } from 'react';
import { SocketFactory } from './modules/stf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './css/start.css'
let google;
let directionsRenderer;
let directionsService;
let geocoder;
let watch;
let target = {
    latitude: 0,
    longitude: 0,
}

class MapRoni extends Component {
    constructor(props) {
        console.log("num 1");
        super(props)
        this.state = {
            init: false,
            currentLocation: this.props.currentLocation,
            children: this.props.ride.children,
            markersArr: []
        }
        this.numStops = null; // number of stations
        // this.currentStationNumber = this.props.ride.currentStation;
        this.stationsTiming = [];
        this.addressesForMarkers = [];
        this.watchPositionLat = 31.774466;// must have an initial position
        this.watchPositionLng = 35.177369;
        this.inWatch = false;
        this.lastlat = null;
        this.initialInterval = 30000;
        this.closeToStationInterval = 10000;
        this.interval = setInterval(this.updateMap, this.initialInterval);
        this.closeToStation = false;
        this.listOfAllFoundChildren = [];
        this.map = null;
        this.controlUI = null;
        this.centerControlDiv = null;
        this.markers = [];
        this.labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.Socket = SocketFactory.getInstance();
        console.log("num 1.5");
    }

    centerMarker = () => {
        this.map.setCenter(this.state.currentLocation);
        // this.map.panTo(this.state.currentLocation);
        this.map.setZoom(16);
    }

    render() {
        let ghgh = this.state.currentLocation;
        if (this.props.currentLocation !== this.state.currentLocation && this.controlUI !== null && this.map !== null) {
            let self = this;
            this.centerControlDiv.addEventListener('click', function () {
                self.map.setCenter(ghgh);
                self.map.setZoom(16);
            });
        }
        return <div>
            <div id="map" style={{ width: "100vw", height: "80vh" }} />
            {/* {this.state.map && this.state.currentLocation &&
                <div id="goCenterUI" ref={el => this.state.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(el)} title="click to recenter the map" className="controllerUI" onClick={this.centerMarker} index={1} >
                    <FontAwesomeIcon className="setCenterText" icon={["fas", "bullseye"]} size="3x" color="#17a2b8" />
                </div>
            } */}
            {this.state.map && this.props.ride.direction === "forth" && this.props.allChildrenMarked &&
                <div className="row">
                    <div className="col-4"></div>
                    <div ref={el => this.state.map.controls[google.maps.ControlPosition.TOP_CENTER].push(el)} className="finishRide col-4" onClick={() => { this.props.finish(); clearInterval(this.interval); }}  >
                        הגענו לסניף
                    </div>
                    <div className="col-4"></div>
                </div>

            }
        </div>
    }

    componentDidMount() {
        if (this.props.ride.children[this.props.ride.children.length - 1].hasLeft !== null) {// Only for back direction ride -> .hasLeft
            console.log("change i roni madee");
            this.props.finish();
            clearInterval(this.interval);
        }
        let dirForth = this.props.ride.direction === "forth" ? true : false;
        if (!this.props.currentLocation) {
            if (!('geolocation' in navigator)) { alert("GPS (geolocation) was not found in your device."); return; }
            let options = { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 };
            navigator.geolocation.getCurrentPosition(
                (pos) => { console.log("posi", pos); this.setState({ currentLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude } }) },
                (err => { alert(`ERROR(${err.code}) WITH YOUR LOCATION: ${err.message}`) }), options);
        }
        console.log("num 3");
        this.mapScript();
        console.log("num 3.5");
        this.Socket.actionsAfterData(this.props.ride.id, (data) => {
            if (data.model === "REQUEST") {
                let nextAddress = null;
                let forthOrBack = this.props.ride.direction === "forth" ? ["Forth", "hasJoined"] : ["Back", "hasLeft"];
                let nextChild = this.props.ride.children.find(child => child[forthOrBack[1]] === null);
                let destination = dirForth ? this.props.ride.destination : this.props.ride.destination[0]
                if (!nextChild) nextAddress = destination.split(",")[0];
                else nextAddress = nextChild["address" + forthOrBack[0]].split(",")[0];
                console.log("wow i have request!!")
                this.Socket.sendData(this.props.ride.id, {
                    model: "RESPONSE",
                    data: {
                        location: this.state.currentLocation,
                        nextAddress,
                        stationTimes: this.stationsTiming[this.stationsTiming.length - 1]
                    }
                })
            }
        })
    }

    componentDidUpdate = (prevProps) => {
        if (JSON.stringify(prevProps.greenMarker) !== JSON.stringify(this.props.greenMarker)) {
            if (!this.props.greenMarker) return;
            let colorByCondition = (this.props.greenMarker[this.props.ride.direction === "forth" ? "hasJoined" : "hasLeft"] === null) ? "EA4335" : "38c93e"; // red : green
            let marker = this.markers.find((marker) => marker.id === this.labels[this.props.greenMarker.stationNumber]);
            let find = this.props.ride.children.find((child) => child.id !== this.props.greenMarker.id && child.stationNumber === this.props.greenMarker.stationNumber && child[this.props.ride.direction === "forth" ? "hasJoined" : "hasLeft"] === null)
            console.log("is there another child in station?", find)
            if (!marker) return;
            if (!find) {
                marker.setIcon(`data:image/svg+xml,%3Csvg%20version%3D%221.1%22%20width%3D%2227px%22%20height%3D%2243px%22%20viewBox%3D%220%200%2027%2043%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0A%3Cdefs%3E%0A%3Cpath%20id%3D%22a%22%20d%3D%22m12.5%200c-6.9039%200-12.5%205.5961-12.5%2012.5%200%201.8859%200.54297%203.7461%201.4414%205.4617%203.425%206.6156%2010.216%2013.566%2010.216%2022.195%200%200.46562%200.37734%200.84297%200.84297%200.84297s0.84297-0.37734%200.84297-0.84297c0-8.6289%206.7906-15.58%2010.216-22.195%200.89844-1.7156%201.4414-3.5758%201.4414-5.4617%200-6.9039-5.5961-12.5-12.5-12.5z%22%2F%3E%0A%3C%2Fdefs%3E%0A%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%0A%3Cg%20transform%3D%22translate(1%201)%22%3E%0A%3Cuse%20fill%3D%22%23${colorByCondition}%22%20fill-rule%3D%22evenodd%22%20xlink%3Ahref%3D%22%23a%22%2F%3E%0A%3Cpath%20d%3D%22m12.5-0.5c7.18%200%2013%205.82%2013%2013%200%201.8995-0.52398%203.8328-1.4974%205.6916-0.91575%201.7688-1.0177%201.9307-4.169%206.7789-4.2579%206.5508-5.9907%2010.447-5.9907%2015.187%200%200.74177-0.6012%201.343-1.343%201.343s-1.343-0.6012-1.343-1.343c0-4.7396-1.7327-8.6358-5.9907-15.187-3.1512-4.8482-3.2532-5.01-4.1679-6.7768-0.97449-1.8608-1.4985-3.7942-1.4985-5.6937%200-7.18%205.82-13%2013-13z%22%20stroke%3D%22%23fff%22%2F%3E%0A%3C%2Fg%3E%0A%3Ctext%20text-anchor%3D%22middle%22%20dy%3D%220.3em%22%20x%3D%2214%22%20y%3D%2215%22%20font-family%3D%22Roboto%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2216px%22%20fill%3D%22%23FFF%22%3E${marker.id}%3C%2Ftext%3E%0A%3C%2Fg%3E%0A%3C%2Fsvg%3E%0A`)
                marker.setZIndex(1000 - this.addressesForMarkers.length)
            }
            this.props.updateParentState({ greenMarker: null });
            this.setRoute();// To update times when child boarded
        }
        if (prevProps.ride.currentStation !== this.props.ride.currentStation) this.props.ride.currentStation++;
    }

    mapScript = () => {
        console.log("num 4");
        // Initilize the map with google.
        window.init = this.init.bind(this);
        const script = document.createElement('script')
        script.async = true;
        script.defer = true;
        script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyACBxZf8e9SJ_7hEPngOSPb1cFOv0sO8dk&callback=init";
        document.head.appendChild(script);
        console.log("4.5");
    }

    init = async () => {
        console.log("num 5 init", this.props);
        google = window.google;
        directionsRenderer = new google.maps.DirectionsRenderer();//used to be called directionsDisplay
        directionsService = new google.maps.DirectionsService();
        geocoder = new google.maps.Geocoder();
        let chicago = this.state.currentLocation;
        const map = new google.maps.Map(document.getElementById('map'), {
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.TOP_LEFT
            }
        });
        this.map = map;
        this.setState({ map })
        const marker = new google.maps.Marker({ map, icon: require('./images/bus-mark.png') });
        directionsRenderer.setMap(map); // connect the direction to the map
        this.trackLocation(map, marker); //track youself
        this.setRoute(true);
        this.GeolocationForMarkers();
        google.maps.event.addDomListener(window, 'load', this);

        let centerControlDiv = document.createElement('div');
        // Set CSS for the control border.
        let controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '2px solid #fff';
        controlUI.style.borderRadius = '50%';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.margin = '17px';
        controlUI.style.padding = '10px'
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to recenter the map';
        centerControlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        // let controlText = document.createElement('div');
        // controlText.style.color = 'rgb(25,25,25)';
        // controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        // controlText.style.fontSize = '16px';
        // controlText.style.lineHeight = '38px';
        // controlText.style.paddingLeft = '5px';
        // controlText.style.paddingRight = '5px';
        // controlText.innerHTML = 'Center Map';      
        // controlUI.appendChild(controlText);
        let img = document.createElement("IMG");
        img.setAttribute("src", require('./images/center.svg'));
        img.setAttribute("width", "35");
        img.setAttribute("height", "35");
        img.setAttribute("alt", "center map");
        controlUI.appendChild(img);

        this.controlUI = controlUI;
        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function () {
            map.setCenter(chicago);
            map.setZoom(16);
        });
        centerControlDiv.index = 1;
        this.centerControlDiv = centerControlDiv;
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);

        // const fontAwesomeIcon = document.createElement("FontAwesomeIcon");//=> <FontAwesomeIcon/>
        // fontAwesomeIcon.className = "setCenterText";
        // centerMap.appendChild(fontAwesomeIcon, <FontAwesomeIcon className="setCenterText" icon={["fas", "bullseye"]} size="3x" color="#17a2b8" />);
        // console.log("what r u?", document.createElement("FontAwesomeIcon"))
        // let x = document.forms[0]
        // .appendChild(document.createElement("FontAwesomeIcon"))
        // .className = "setCenterText"
        // .setAttribute("icon",`${["fas", "bullseye"]}`)
        // .setAttribute("size","3x")
        // .setAttribute("color","#17a2b8");
        ;

        // document.getElementById('goCenterUI').innerHTML = x;
        console.log("5.5");
    }

    centerControl = (controlDiv, map, chicago) => {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '2px solid #fff';
        controlUI.style.borderRadius = '3px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to recenter the map';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = 'Center Map';
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function () {
            map.setCenter(chicago);
            map.setZoom(16);
        });

    }

    trackLocation = (map, marker) => {
        console.log("num 6");

        if (!('geolocation' in navigator)) { alert("GPS (geolocation) was not found in your device."); return; }

        watch = navigator.geolocation.watchPosition(
            ({ coords: { latitude: lat, longitude: lng } }) => {
                console.log(`WATCH! Lat: ${lat}  Lng: ${lng}`);
                marker.setPosition({ lat, lng });
                this.Socket.sendData(this.props.ride.id, { model: "LOCATION", data: { lat, lng } });
                this.setState({ currentLocation: { lat, lng } });
                this.watchPositionLat = lat;
                this.watchPositionLng = lng;

                if (this.lastlat !== lat) {
                    this.inWatch = true;
                    this.lastlat = lat;
                }

                console.log("6.5");
                let crd = { latitude: lat, longitude: lng };

                if (target.latitude === crd.latitude && target.longitude === crd.longitude) {
                    console.log('Congratulation, you reached the target');
                    navigator.geolocation.clearWatch(watch);
                }
            },
            (err) => alert(`Error: ${err}`), {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        },
        );
    }


    setRoute = (firstTime = null) => {
        let dirForth = this.props.ride.direction === "forth" ? true : false;
        console.log("setRoute ddresses", this.props.listOfAddresses, this.props.ride.destination);
        let arrangedList = [];
        this.props.listOfAddresses.forEach((address) => { if (!address[1]) arrangedList.push({ location: address[0] }) })
        console.log("setRoute arrangedList ", arrangedList)
        // let stopOverVal = false;
        directionsService.route({
            origin: this.state.currentLocation, //our real origin
            destination: dirForth ? this.props.ride.destination : this.props.ride.destination[0],
            waypoints: arrangedList,
            provideRouteAlternatives: false,
            travelMode: 'DRIVING'
        }, (response, status) => {
            if (status === 'OK') {
                console.log("setRoute response ronit", response)
                let displayRes = JSON.parse(JSON.stringify(response));
                delete displayRes.routes[0].legs;
                firstTime && directionsRenderer.setDirections(displayRes); //draw route
                this.calculateStationsTime(response.routes[0].legs);
                this.inStation(response);
                this.alertChildren();
            } else console.log('Directions request failed due to ' + status);
        });
    }

    updateMap = () => {
        console.log("interval closeToStation?", this.closeToStation);
        let currentDate = new Date();
        console.log("time of repeatition: ", currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds());
        if (this.inWatch || this.closeToStation) {
            this.setRoute();
            this.inWatch = false;
            console.log("inWatchPos");
        }
        // let dirForth = this.props.ride.direction === "forth" ? true : false; //IMPORTANT roni check
        // let nextChild = this.props.ride.children.find(child => dirForth ? child.hasJoined === null : child.hasLeft === null);
        // let nextAddress = this.props.listOfAddresses.find( address => address[1] === false );
        // if (dirforth ? nextChild.addressForth : nextChild.addressBack !== nextAddress) {
        //     this.setRoute();
        //     console.lof("next child address is not like the address google got");
        // }
        console.log("reset timer");
        clearInterval(this.interval);
        let duration = this.initialInterval;
        if (this.closeToStation) duration = this.closeToStationInterval;
        this.interval = setInterval(this.updateMap, duration);
        console.log("children up to date", this.props.ride.children);
        console.log("this.props.stateFinish", this.props.stateFinish);
        console.log("change i roni madee", this.props.stateFinish);
        // if (this.props.stateFinish) {
        //     this.props.finish();
        //     clearInterval(this.interval);
        // }
    }

    GeolocationForMarkers = () => {
        let dirForth = this.props.ride.direction === "forth" ? true : false;
        let address = `address${this.props.ride.direction.replace(/^\w/, c => c.toUpperCase())}`; //AddressForth or AddressBack
        Promise.all(this.props.ride.children.map((child, index) => new Promise((resolve, reject) => {
            if (index !== 0 && this.props.ride.children[index - 1][address] === child[address]) return resolve();
            console.log("childn,index", child[address], index)
            this.geocodeAddressToCoords(child[address], (geolocation) => {
                console.log("+!", child.stationNumber, index, geolocation);
                this.addressesForMarkers[child.stationNumber] = [geolocation, child[address]];
                // this.props.listOfAddresses[index][2] = geolocation;
                resolve();
            });
        }))).then(() => {
            let gettingBranchGeolocation = new Promise((resolve, reject) => {
                dirForth ? this.geocodeAddressToCoords(this.props.ride.destination, (geolocation) => {
                    this.addressesForMarkers = this.addressesForMarkers.filter((el) => el !== null);
                    this.addressesForMarkers.push([geolocation, this.props.ride.destination]);
                    console.log("geocodede", this.props.ride.destination[0])
                    resolve();
                }) :
                    resolve();
            });
            gettingBranchGeolocation.then(() => this.addressesMarkers())
        });
        console.log("marker addresses geocode", this.addressesForMarkers);
    };

    addressesMarkers = () => {
        console.log("addresses for marker func", this.addressesForMarkers);
        this.addressesForMarkers.forEach(([geolocation, address], i) => {
            console.log("address marker nani", address, (this.props.listOfAddresses[i] && this.props.listOfAddresses[i]));
            let marker = new google.maps.Marker({
                id: this.labels[i],
                position: geolocation,
                zIndex: 1000 + ((this.props.listOfAddresses[i] && this.props.listOfAddresses[i][1]) ? -this.addressesForMarkers.length : -i),
                icon: i === (this.addressesForMarkers.length - 1) && (this.props.ride.direction === "forth") ? `data:image/svg+xml,%3Csvg%20version%3D%221.1%22%20width%3D%2227px%22%20height%3D%2243px%22%20viewBox%3D%220%200%2027%2043%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0A%3Cdefs%3E%0A%3Cpath%20id%3D%22a%22%20d%3D%22m12.5%200c-6.9039%200-12.5%205.5961-12.5%2012.5%200%201.8859%200.54297%203.7461%201.4414%205.4617%203.425%206.6156%2010.216%2013.566%2010.216%2022.195%200%200.46562%200.37734%200.84297%200.84297%200.84297s0.84297-0.37734%200.84297-0.84297c0-8.6289%206.7906-15.58%2010.216-22.195%200.89844-1.7156%201.4414-3.5758%201.4414-5.4617%200-6.9039-5.5961-12.5-12.5-12.5z%22%2F%3E%0A%3C%2Fdefs%3E%0A%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%0A%3Cg%20transform%3D%22translate(1%201)%22%3E%0A%3Cuse%20fill%3D%22%23${"EA4335"}%22%20fill-rule%3D%22evenodd%22%20xlink%3Ahref%3D%22%23a%22%2F%3E%0A%3Cpath%20d%3D%22m12.5-0.5c7.18%200%2013%205.82%2013%2013%200%201.8995-0.52398%203.8328-1.4974%205.6916-0.91575%201.7688-1.0177%201.9307-4.169%206.7789-4.2579%206.5508-5.9907%2010.447-5.9907%2015.187%200%200.74177-0.6012%201.343-1.343%201.343s-1.343-0.6012-1.343-1.343c0-4.7396-1.7327-8.6358-5.9907-15.187-3.1512-4.8482-3.2532-5.01-4.1679-6.7768-0.97449-1.8608-1.4985-3.7942-1.4985-5.6937%200-7.18%205.82-13%2013-13z%22%20stroke%3D%22%23fff%22%2F%3E%0A%3C%2Fg%3E%0A%3Ctext%20text-anchor%3D%22middle%22%20dy%3D%220.3em%22%20x%3D%2214%22%20y%3D%2215%22%20font-family%3D%22Roboto%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2216px%22%20fill%3D%22%23FFF%22%3E${"🙂️"}%3C%2Ftext%3E%0A%3C%2Fg%3E%0A%3C%2Fsvg%3E%0A` :
                    `data:image/svg+xml,%3Csvg%20version%3D%221.1%22%20width%3D%2227px%22%20height%3D%2243px%22%20viewBox%3D%220%200%2027%2043%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0A%3Cdefs%3E%0A%3Cpath%20id%3D%22a%22%20d%3D%22m12.5%200c-6.9039%200-12.5%205.5961-12.5%2012.5%200%201.8859%200.54297%203.7461%201.4414%205.4617%203.425%206.6156%2010.216%2013.566%2010.216%2022.195%200%200.46562%200.37734%200.84297%200.84297%200.84297s0.84297-0.37734%200.84297-0.84297c0-8.6289%206.7906-15.58%2010.216-22.195%200.89844-1.7156%201.4414-3.5758%201.4414-5.4617%200-6.9039-5.5961-12.5-12.5-12.5z%22%2F%3E%0A%3C%2Fdefs%3E%0A%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%0A%3Cg%20transform%3D%22translate(1%201)%22%3E%0A%3Cuse%20fill%3D%22%23${(this.props.listOfAddresses[i] && this.props.listOfAddresses[i][1]) ? "38c93e" : "EA4335"}%22%20fill-rule%3D%22evenodd%22%20xlink%3Ahref%3D%22%23a%22%2F%3E%0A%3Cpath%20d%3D%22m12.5-0.5c7.18%200%2013%205.82%2013%2013%200%201.8995-0.52398%203.8328-1.4974%205.6916-0.91575%201.7688-1.0177%201.9307-4.169%206.7789-4.2579%206.5508-5.9907%2010.447-5.9907%2015.187%200%200.74177-0.6012%201.343-1.343%201.343s-1.343-0.6012-1.343-1.343c0-4.7396-1.7327-8.6358-5.9907-15.187-3.1512-4.8482-3.2532-5.01-4.1679-6.7768-0.97449-1.8608-1.4985-3.7942-1.4985-5.6937%200-7.18%205.82-13%2013-13z%22%20stroke%3D%22%23fff%22%2F%3E%0A%3C%2Fg%3E%0A%3Ctext%20text-anchor%3D%22middle%22%20dy%3D%220.3em%22%20x%3D%2214%22%20y%3D%2215%22%20font-family%3D%22Roboto%2C%20Arial%2C%20sans-serif%22%20font-size%3D%2216px%22%20fill%3D%22%23FFF%22%3E${this.labels[i]}%3C%2Ftext%3E%0A%3C%2Fg%3E%0A%3C%2Fsvg%3E%0A`,
                map: this.map,
            });
            let infowindow = new google.maps.InfoWindow({ content: `${(i === this.addressesForMarkers.length - 1 ? "סניף: " : "") + address}` });
            marker.addListener('click', () => infowindow.open(this.map, marker));
            this.map.addListener('click', () => infowindow.close(this.map, marker));
            // this.state.markersArr.push(marker)
            this.markers.push(marker);
            marker.setMap(this.map)
            console.log("address marker nani nnn", marker)
        })
    }

    inStation = (response) => {
        let JoinedOrLeft = this.props.ride.direction === "forth" ? "hasJoined" : "hasLeft";
        let dirForth = this.props.ride.direction === "forth" ? true : false;
        // Changed from - 40 to 0 to check if this is the time area that tells you that you are in the station.
        // Instation Range
        console.log("in station.... response & ride", response, this.props.ride);
        this.closeToStation = false;
        if (response.routes[0].legs[0].duration.value < 181) this.closeToStation = true;
        console.log("in station close to station?!", this.closeToStation)
        //IMPORTANT! - First station = 0
        if ((response.routes[0].legs[0].duration.value <= 40)) {
            let foundChildren = [];
            console.log("inStation curr stat", this.props.ride.currentStation)
            this.props.ride.children.forEach((child) => {
                if (child.stationNumber === this.props.ride.currentStation && child[JoinedOrLeft] === null) {
                    foundChildren.push(child);
                }
            })
            console.log("foundChildren in station", foundChildren.length, foundChildren, this.props.ride.children);
            if (foundChildren.length > 0) {
                console.log("wow, found children!!!!!!!!!")
                this.props.updateParentState({ childrenInCurrentStation: foundChildren, boardingModalOpen: true });//, shiftOutPlace: this.shiftOutPlace
                this.stationsTiming.shift();
                // this.closeToStation = false;
            }
            if ((this.props.ride.direction === "forth" && response.routes[0].legs.length === 1) || (this.props.stateFinish)) { //! Future Roni pls check this -> (this.props.ride.direction === "back" && response.routes[0].legs.length === 1) 
                console.log("change i roni madee");
                this.props.finish();
                clearInterval(this.interval);
            }

        }
        this.props.updateParentState({ finalTime: Math.round(this.stationsTiming[this.stationsTiming.length - 1]) }); //final time
    }

    alertChildren = () => {//can/should be on start roni??
        console.log("Alert children: ", this.props.ride.children);
        console.log("Alert: station times", this.stationsTiming);
        console.log("Alert: curr stat", this.props.ride.currentStation);
        let childrenToAlert = [];
        this.props.ride.children.forEach((child, i) => {
            console.log("Alert: child", child.firstName, "child station", child.stationNumber);
            if (child.stationNumber === this.props.ride.currentStation) {
                let alertTime = child["alertTime" + this.props.ride.direction.replace(/^\w/, c => c.toUpperCase())]
                console.log("Alert: child alert time", alertTime);
                console.log("Alert in if: ", child.alerted !== 1, alertTime >= this.stationsTiming[0])
                if (child.alerted !== 1 && (alertTime >= this.stationsTiming[0])) {
                    childrenToAlert.push(child);
                }
            }
        });
        console.log("Alert: array", childrenToAlert);
        if (childrenToAlert.length > 0) this.props.updateParentState({ childrenToAlert, alertModalOpen: true });
    }

    calculateEstimatedWithWheelChairTime = (branchArrivalTime) => {
        this.props.ride.children.forEach((child) => {
            if (child.waitingTime) {
                console.log("here estimated wheelchair");
                branchArrivalTime += 3;// adding three (3) minutes to every child with wheelchair
            }
        });
        return branchArrivalTime;
    }

    calculateStationsTime = async (response) => {
        let countTime = 0;
        let stationsTimes = [];
        console.log("wwww response calc time", response);
        response.forEach((station) => {
            countTime += Math.round(station.duration.value / 60);
            stationsTimes.push(countTime);
            //IMPORTANT! time between each station is without abording time => waiting time. only for the branch station
        });
        // let nextFalseIndex = this.props.listOfAddresses.findIndex((address) => !address[1])
        // let stationsTimesLeft = stationsTimes.slice(nextFalseIndex);

        // let obj = response.reduce((o, cur) => ({ ...o, [response.indexOf(cur)]: Math.round(cur.duration.value / 60) }), {})// {stationNumber: time to station}
        // if (this.props.ride.direction === "forth") {//IMPORTANT!! why only for forth??
        stationsTimes[stationsTimes.length - 1] = this.calculateEstimatedWithWheelChairTime(stationsTimes[stationsTimes.length - 1]);
        // }
        console.log("station times calc", stationsTimes);
        /* IMPORTANT! IMPORTANT! IMPORTANT! IMPORTANT!
        ** TOM - don't change back to your smart writing until i will finish with the map 
        ** because it ruined it last time and i dont have the power to relize it again
        */
        // Do not erase
        let address = `address${this.props.ride.direction.replace(/^\w/, c => c.toUpperCase())}`; //AddressForth or AddressBack
        let saveAddress = null;
        let saveStationIndex = -1; //IMPORTANT! station nums begin from 0
        let dirForth = this.props.ride.direction === "forth" ? true : false;
        this.props.ride.children.forEach((child, i) => {
            if (child[address] !== saveAddress && (dirForth ? child.hasJoined === null : child.hasLeft === null)) { // New Address 
                saveStationIndex++;
                child.time = stationsTimes[saveStationIndex];
                saveAddress = child[address];
            } else child.time = stationsTimes[saveStationIndex];// Same address
        });
        this.stationsTiming = [...stationsTimes];
        this.Socket.sendData(this.props.ride.id, { model: "STATION_TIMES", data: this.stationsTiming[this.stationsTiming.length - 1] })
        console.log("times children in calc", this.props.ride.children);
        this.props.updateParentState({ ride: this.props.ride, stationsTimes }) // CHECK!
    }


    geocodeAddressToCoords = (address, cb) => { // used to name geocodeLatLng = (pos) => { //code }
        geocoder.geocode({ address }, (results, status) => {
            if (status === 'OK') {
                if (results[0]) {
                    return cb({ lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() });
                } else { window.alert('No results found for your location'); return cb(null); }
            } else { window.alert('Geocoder failed due to: ' + status); return cb(null); }
        });
    }
}


export default MapRoni;

