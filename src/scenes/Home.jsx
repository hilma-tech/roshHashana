import React, { useState } from 'react';
import { isBrowser } from "react-device-detect";
import Map from '../components/maps/map';
import './Home.scss'

const Home = (props) => {
    const [openMap, setOpenMap] = useState(false);
    //detects the number of the images that were loaded
    const [imgLoadedNum, setImgLoadedNum] = useState(0);

    const onClickRegister = (e) => {
        console.log(e)
        props.history.push("/register", { type: e });
    }

    const updateNumImgLoaded = () => {
        let num = imgLoadedNum;
        num++;
        setImgLoadedNum(num);
    }

    return (
        <>
            <div className={`HomePage d-flex justify-content-center align-items-center ${openMap ? 'slide-out-top' : 'slide-in-top'}`} style={{ display: imgLoadedNum < 2 ? 'none' : 'block' }}>
                <div className="content-container" >

                    <img style={{ width: isBrowser ? '26vw' : '50vw' }} src="/images/header.svg" onLoad={updateNumImgLoaded} />
                    <div className="d-lg-none d-md-none text-light " style={{ fontSize: "150%", fontWeight: "bold" }} >
                        <div >תקועים בבית? <br></br> אנחנו נדאג לכם לתקיעת שופר</div>
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
                        <div className="clickAble" onClick={() => setOpenMap(true)}><img style={{ width: '5vw', marginTop: "6%" }} src="/images/map.svg" onLoad={updateNumImgLoaded} /></div>
                        <div className="text-light clickAble" id="text1" onClick={() => setOpenMap(true)}>מפת תקיעות ארצית</div>
                    </>
                        : <>
                            <div onClick={() => setOpenMap(true)} className="text-light" style={{ fontSize: "3vh", fontWeight: 'bold', marginTop: "12%" }}>לכל מפגשי <br></br>תקיעות שופר בארץ</div>
                            <div onClick={() => setOpenMap(true)} className="img-container"><img style={{ width: '12vw' }} src="/images/map.svg" onLoad={updateNumImgLoaded} /></div></>
                    }
                </div>
            </div>
            {openMap && <Map publicMap closeMap={() => setOpenMap(false)} history={props.history} />}
        </>
    );
}

export default Home;