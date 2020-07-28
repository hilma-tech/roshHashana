import React, { useRef } from 'react';
import { SearchBox } from "react-google-maps/lib/components/places/SearchBox";

import _ from "lodash";

const SearchBoxGenerator = (props) => {
    const searchBoxRef = useRef()

    const handlePlacesChange = () => {
        let places = searchBoxRef.current.getPlaces();
        // console.log('places: ', places);
        const bounds = new window.google.maps.LatLngBounds();
        // console.log(bounds, '1');
        places.forEach(place => {
            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport)
            } else {
                bounds.extend(place.geometry.location)
            }
        });
        // console.log(bounds, '2');


        const nextMarkers = places.map(place => ({
            position: place.geometry.location,
        }));
        const nextCenter = _.get(nextMarkers, '0.position', props.center);
        props.changeCenter(nextCenter);
        // this.SearchBoxRef.current.map.fitBounds(bounds);
    }



    return (
        <SearchBox
            strictBounds={true}
            ref={searchBoxRef}
            controlPosition={window.google.maps.ControlPosition.TOP_CENTER}
            onPlacesChanged={handlePlacesChange}
        >
            <div id="search-input-container">
                <input
                    id="search-input"
                    type="text"
                    placeholder="חיפוש"
                />
                <img id="search-icon" src="/icons/search.svg" />
            </div>
        </SearchBox>
    );
}

export default SearchBoxGenerator;