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
            <img id="sb-search-icon" src="/icons/search.svg" />
        </div>
    );
}



export const FormSearchBoxGenerator = ({ onAddressChange }) => {
    const autoCompleteInput = useRef()

    useEffect(() => {
        //so we have window.google
        window.init = initHandler
        const script = document.createElement('script')
        script.async = true;
        script.defer = true;
        script.id = "mapScript";
        script.src = `https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY}&callback=init`
        document.head.appendChild(script);
        return () => {
            let script = document.getElementById('mapScript')
            document.head.removeChild(script);
        }
        //end of: so we have window.google
    }, []);

    const initHandler = () => {
        const input = document.getElementById('form-search-input');
        // if (!input) return;
        let autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.setComponentRestrictions({ "country": "il" });
        autocomplete.addListener("place_changed", () => { handlePlaceChange(autocomplete) })
    }

    const handlePlaceChange = (autocomplete) => {
        let placeInfo = autocomplete.getPlace();
        let place = placeInfo.geometry && placeInfo.formatted_address ? placeInfo.formatted_address : true
        onAddressChange(place)
    }

    return (
        <div className="sb-search-input-container">
            <input
                ref={autoCompleteInput}
                id="form-search-input"
                type="text"
                placeholder="מיקום"
            />
        </div>
    );
}