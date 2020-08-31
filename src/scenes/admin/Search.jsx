import React, { useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

let delayTime = null

/*  props: 
        placeholder,
        onSearch- function, gets the value of the search (called when the value of the input changes)
*/

const Search = (props) => {

    const [searchValue, setSearchValue] = useState('')
    const [didMount, setDidMount] = useState(true)

    useEffect(() => {
        if (didMount) {
            setDidMount(false)
            return
        }
        if (delayTime) clearTimeout(delayTime)
        if (searchValue === '') props.onSearch(searchValue)
        else delayTime = setTimeout(() => props.onSearch(searchValue), 300)
    }, [searchValue])


    return (
        <div className='inputContainer'>
            <input
                placeholder={props.placeholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
            />
            {!searchValue || searchValue.length === 0 ?
                <FontAwesomeIcon icon={['fas', 'search']} className='inputIcon' /> :
                <div className='pointer'>
                    <FontAwesomeIcon icon={['fas', 'times']} className='inputIcon' onClick={() => setSearchValue('')} />
                </div>
            }
        </div>
    );
}

export default Search