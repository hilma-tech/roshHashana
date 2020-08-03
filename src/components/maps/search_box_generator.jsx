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



export const FormSearchBoxGenerator = ({ onAddressChange, second, uId, deafault }) => {
    console.log("deafault", deafault)
    const autoCompleteInput = useRef()

    useEffect(() => {
        //so we have window.google
        if (second) init()
        window.init = init
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

    const init = () => {
        const input = document.getElementById(uId);
        console.log('input: ', input);
        if (!input) return;
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
        <div className="form-search-input-container">
            <input
                deafault={deafault}
                ref={autoCompleteInput}
                autocomplete={'off'}
                id={uId}
                type="text"
                placeholder="מיקום"
                onChange={() => { onAddressChange("NOT_A_VALID_ADDRESS") }}
            />
        </div>
    );
}