import React, { useEffect, useRef } from 'react';

export const SBSearchBoxGenerator = (props) => {

    useEffect(() => {
        const input = document.getElementById('sb-search-input');
        let autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.setComponentRestrictions({ "country": "il" });
        autocomplete.addListener("place_changed", () => {
            let place = autocomplete.getPlace();
            if (place.geometry) props.changeCenter(place.geometry.location);
            else if (!place.geometry && place.name) {
                //find the lat and lng of the place
                props.findLocationCoords(place.name);
            }
            else return;
        })
    }, []);

    return (
        <div className="sb-search-input-container">
            <input
                onBlur={(e) => { try { e.target.value = "" } catch (e) { console.log("er", e); } }}
                id="sb-search-input"
                type="text"
                placeholder="חיפוש"
            />
            <img id="sb-search-icon" alt="" src="/icons/search.svg" />
        </div>
    );
}



export const FormSearchBoxGenerator = ({ onAddressChange, uId, defaultValue, className }) => {
    const autoCompleteInput = useRef()
    useEffect(() => {
        if (window.google && window.google.maps) { init(); return; }
        //so we have window.google
        window.init = init
        const script = document.createElement('script')
        script.async = true;
        script.defer = true;
        script.id = "mapScript";
        script.src = `https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY_SECOND}&callback=init`
        document.head.appendChild(script);

        return () => {
            let script = document.getElementById('mapScript')
            document.head.removeChild(script);
        }
    }, []);

    const init = () => {
        const israelCoords = [
            { lat: 32.863532, lng: 35.889902 },
            { lat: 33.458826, lng: 35.881345 },
            { lat: 33.107715, lng: 35.144508 },
            { lat: 31.296718, lng: 34.180102 },
            { lat: 29.486869, lng: 34.881321 },
            { lat: 29.551662, lng: 34.984779 },
        ];

        const israelPolygon = new window.google.maps.Polygon({
            paths: israelCoords,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35
        });

        var bounds = new window.google.maps.LatLngBounds();
        if (!israelPolygon || typeof israelPolygon.getPaths !== "function" || !israelPolygon.getPaths() || typeof israelPolygon.getPaths().getLength !== "function")
            return null
        for (var i = 0; i < israelPolygon.getPaths().getLength(); i++) {
            for (var j = 0; j < israelPolygon.getPaths().getAt(i).getLength(); j++) {
                bounds.extend(israelPolygon.getPaths().getAt(i).getAt(j));
            }
        }
        const options = {
            bounds: bounds,
            strictBounds: true,
        }
        const input = document.getElementById(uId);
        if (!input) return;
        let autocomplete = new window.google.maps.places.Autocomplete(input, options);
        // autocomplete.setComponentRestrictions({ "country": "il" });
        autocomplete.addListener("place_changed", () => { handlePlaceChange(autocomplete) })
    }

    const handlePlaceChange = (autocomplete) => {
        let placeInfo = autocomplete.getPlace();
        let place = placeInfo.geometry && placeInfo.geometry.location && typeof placeInfo.geometry.location.lng === "function" && typeof placeInfo.geometry.location.lat === "function" && placeInfo.formatted_address ? [placeInfo.formatted_address, { lng: placeInfo.geometry.location.lng(), lat: placeInfo.geometry.location.lat() }] : ["NOT_A_VALID_ADDRESS", null]
        onAddressChange(place)
    }

    return (
        <div className="form-search-input-container">
            <input
                deafault={defaultValue}
                ref={autoCompleteInput}
                defaultValue={defaultValue}
                autoComplete={'off'}
                id={uId}
                className={className}
                type="text"
                placeholder="מיקום"
                onChange={() => { onAddressChange(["NOT_A_VALID_ADDRESS", null]) }}
            />
        </div>
    );
}