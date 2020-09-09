import React, { useState } from 'react';
import { isBrowser, isIOS } from "react-device-detect";
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
            <div className={`HomePage ${openMap ? 'slide-out-top' : 'slide-in-top'}`} style={{ display: imgLoadedNum < 2 ? 'none' : 'flex', paddingBottom: '5%' }} >
                <div className="coap-imgs-container" style={{ padding: isBrowser ? '2.5%' : '0', justifyContent: isBrowser ? 'center' : 'space-evenly' }}  >
                    <a href="https://www.hilma.tech/"> <img style={{ height: isBrowser ? '2.5rem' : '1.5rem' }} src="/images/hilma.png" /></a>
                    <img style={{ height: isBrowser ? '2.8rem' : '1.8rem' }} src="/images/AMITlogo.png" />
                    <img style={{ height: isBrowser ? '2.5rem' : '1.5rem' }} src="/images/unisyn.svg" />
                    <img style={{ height: isBrowser ? '2.5rem' : '1.5rem' }} src="/images/srugim.svg" />
                </div>
                <div className="content-container" style={{ marginTop: isBrowser ? '0%' : '15%', height: isBrowser ? '80vh' : 'unset' }} >

                    <img alt="" style={{ width: isBrowser ? '21vw' : '55vw' }} src="/images/header.svg" onLoad={updateNumImgLoaded} />
                    <div className="  text-light " style={{ fontSize: "150%", fontWeight: "bold" }} >
                        <div className="stuckHouse">{stuckHouse}</div>
                    </div>
                    <div className="buttonAll ">
                        <div className={`${isBrowser ? "browserButtonForRegister" : "mobileButtonForRegister"} `} style={{ marginTop: isBrowser && "3%", margin: !isBrowser && "0% auto", }}>
                            <button style={{ marginBottom: !isBrowser && '5%' }} className={`${isBrowser ? "browserRegisterIsolator" : "mobileRegisterIsolator"}`} value="isolator" onClick={(e) => onClickRegister(e.target.value)}>
                                אני רוצה לשמוע תקיעת שופר  </button>
                            <button className={`${isBrowser ? "browserRegisterBlower" : "mobileRegisterBlower"}`} value="blower" onClick={(e) => onClickRegister(e.target.value)}>
                                אני רוצה לתקוע בשופר </button>
                        </div>
                    </div>
                    {isBrowser ? <>
                        <div className="clickAble" onClick={() => setOpenMap(true)}><img alt="" style={{ width: '3.5vw', marginTop: isBrowser ? '20%' : "6%" }} src="/images/map.svg" onLoad={updateNumImgLoaded} /></div>
                        <div className="text-light clickAble" id="text1" onClick={() => setOpenMap(true)}>{allMeeting}</div>
                    </>
                        : <>
                            <div onClick={() => setOpenMap(true)} className="text-light" style={{ fontSize: "3vh", marginTop: "5%", whiteSpace: "pre-line", lineHeight: "1.2" }}>{allMeeting}</div>
                            <div onClick={() => setOpenMap(true)} className="img-container"><img alt="" style={{ width: '12vw' }} src="/images/map.svg" onLoad={updateNumImgLoaded} /></div></>
                    }
                    <button onClick={() => { props.history.push("/a") }} style={{ position: "absolute", top: 0, right: 0, backgroundColor: "yellow", color: "black", borderRadius: "40%" }} >וואו כפתור נסתר לוקלית</button>

                    <div className="contactUs" style={{ whiteSpace: "nowrap", marginTop: isBrowser ? "0" : "2vh" }} >
                        <img style={{ width: "12%", marginLeft: "3%" }} src="/icons/envelope.svg" />
                        <a style={{ fontSize: "2.5vh" }} className="regularLink" href="mailto:shofar2all@gmail.com "> לפניות ובקשות </a>
                    </div>
                    <div className="bottomLine" style={{ fontSize: isBrowser ? "2.3vh" : "1.3vh", padding: isBrowser ? "0 0 0 0" : "1.5% 0 1.5% 0", justifyContent: isBrowser ? "center" : "space-evenly" }}>

                        <div style={{ width: "fit-content" }}>
                            האתר פותח כתרומה לחברה ע"י  <a className="underlineLink" href="https://www.hilma.tech/" target="_blank"> הילמה</a> |
                       התמונה באדיבות: <a className="underlineLink" href="https://www.thekotel.org//" target="_blank" >הקרן למורשת הכותל המערבי </a> |
                         תוכן שיווקי:  <a className="underlineLink" href="http://www.my-idea.co.il/" target="_blank"> אפרת שפירא</a>
                        </div>
                    </div>
                </div>
            </div>
            {openMap && <Map publicMap closeMap={() => setOpenMap(false)} history={props.history} />}
        </>
    );
}

export default Home;