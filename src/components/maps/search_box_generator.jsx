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
        script.src = `https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY}&callback=init`
        document.head.appendChild(script);

        return () => {
            let script = document.getElementById('mapScript')
            document.head.removeChild(script);
        }
    }, []);

    const init = () => {
        const input = document.getElementById(uId);
        if (!input) return;
        let autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.setComponentRestrictions({ "country": "il" });
        autocomplete.addListener("place_changed", () => { handlePlaceChange(autocomplete) })
    }

    const handlePlaceChange = (autocomplete) => {
        let placeInfo = autocomplete.getPlace();
        let place = placeInfo.geometry && placeInfo.geometry.location && placeInfo.formatted_address ? [placeInfo.formatted_address, { lng: placeInfo.geometry.location.lng(), lat: placeInfo.geometry.location.lat() }] : ["NOT_A_VALID_ADDRESS", null]
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