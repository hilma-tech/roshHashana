import React, { useState } from 'react';
import { isBrowser } from "react-device-detect";
import Map from '../components/maps/map';
import './Home.scss'

const Home = (props) => {
    const allMeeting = "לכל מפגשי \n תקיעות שופר בארץ"
    const stuckHouse = "תקועים בבית? \n אנחנו נדאג לכם לתקיעת שופר"
    const [openMap, setOpenMap] = useState(false);
    //detects the number of the images that were loaded
    const [imgLoadedNum, setImgLoadedNum] = useState(0);

    const onClickRegister = (e) => {
        props.history.push("/register", { type: e });
    }

    const updateNumImgLoaded = () => {
        let num = imgLoadedNum;
        num++;
        setImgLoadedNum(num);
    }

    return (
        <>
            <div className={`HomePage ${openMap ? 'slide-out-top' : 'slide-in-top'}`} style={{ display: imgLoadedNum < 2 ? 'none' : 'flex', paddingBottom: isBrowser ? '8%' : '5%' }} >
                <div className="coap-imgs-container" style={{ width: isBrowser ? '35%' : '65%' }}>
                    <img style={{ height: isBrowser ? '2.5rem' : '1.5rem' }} src="/images/hilma.svg" />
                    <img style={{ height: isBrowser ? '2.8rem' : '1.8rem' }} src="/images/AMITlogo.png" />
                    <img style={{ height: isBrowser ? '2.5rem' : '1.5rem' }} src="/images/SynagogueOrg.png" />
                </div>
                <div className="content-container" >

                    <img alt="" style={{ width: isBrowser ? '21vw' : '67vw' }} src="/images/header.svg" onLoad={updateNumImgLoaded} />
                    <div className="d-lg-none d-md-none text-light " style={{ fontSize: "150%", fontWeight: "bold" }} >
                        <div className="stuckHouse">{stuckHouse}</div>
                    </div>
                    <div className="buttonAll justify-content-center align-items-center">
                        <div className={`${isBrowser ? "browserButtonForRegister" : "mobileButtonForRegister"} ` + ' row justify-content-center '} style={{ width: isBrowser && '56vw', marginTop: isBrowser && "3%", margin: !isBrowser && "10% auto 0% auto", }}>
                            <button style={{ marginBottom: !isBrowser && '5%' }} className={`${isBrowser ? "browserRegisterIsolator" : "mobileRegisterIsolator"}`} value="isolator" onClick={(e) => onClickRegister(e.target.value)}>
                                אני רוצה לשמוע תקיעת שופר  </button>
                            <button className={`${isBrowser ? "browserRegisterBlower" : "mobileRegisterBlower"}`} value="blower" onClick={(e) => onClickRegister(e.target.value)}>
                                אני רוצה לתקוע בשופר </button>
                        </div>
                    </div>
                    {isBrowser ? <>
                        <div className="clickAble" onClick={() => setOpenMap(true)}><img alt="" style={{ width: '5vw', marginTop: "6%" }} src="/images/map.svg" onLoad={updateNumImgLoaded} /></div>
                        <div className="text-light clickAble" id="text1" onClick={() => setOpenMap(true)}>מפת תקיעות ארצית</div>
                    </>
                        : <>
                            <div onClick={() => setOpenMap(true)} className="text-light" style={{ fontSize: "3vh", marginTop: "12%", whiteSpace: "pre-line", lineHeight: "1.2" }}>{allMeeting}</div>
                            <div onClick={() => setOpenMap(true)} className="img-container"><img alt="" style={{ width: '12vw' }} src="/images/map.svg" onLoad={updateNumImgLoaded} /></div></>
                    }
                </div>
            </div>
            {openMap && <Map publicMap closeMap={() => setOpenMap(false)} history={props.history} />}
        </>
    );
}

export default Home;