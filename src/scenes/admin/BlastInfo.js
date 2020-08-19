import React from 'react';
import './style/BlastInfo.scss'

const BlastInfo = (props) => {
    return (
        <div className="BlastInfo">

            <div className="flexContainer leftdives">
                <div className="bold fonttkia">תקיעה ציבורית</div>
                <div>10 משתתפים</div>
            </div>

            <div className="flexContainer infoBox">
                <div className="flexRow">
                    <div className="width25">
                        <img className="icon" src="/icons/blueShofar.svg" />
                    </div>
                    <div className="width75">
                        <div className="info">מוטי לוי</div>
                        <div className="info">052-4773888</div>
                    </div>
                </div>
                <div className="flexRow">
                    <div className="width25">
                        <img className="icon" style={{ width: "2vh" }} src="/icons/blueClock.svg" />
                    </div>
                    <div className="width75">
                        <div className="info">12:30</div>
                    </div>
                </div>
                <div className="flexRow">
                    <div className="width25">
                        <img className="icon" src="/icons/peopleBlue.svg" />
                    </div>
                    <div className="width75">
                        <div className="info">מוטי לוי</div>
                        <div className="info">052-4773888</div>
                    </div>
                </div>
                <div className="flexRow">
                    <div className="width25">
                        <img className="icon" style={{ width: "2.4vh" }} src="/icons/location.svg" />
                    </div>
                    <div className="width75">
                        <div className="info">רמבן 8</div>
                        <div className="info">קומה שלישית מול הסופרפארם</div>
                    </div>
                </div>
                <div className="flexRow">
                    <div className="width25">
                    </div>
                    <div className="width75" >
                        <div className="bottomToList">רשימת המשתתפים</div>
                    </div>
                </div>
                <div className="flexRow delete">
                    <div className="width25">
                        <img className="icon" style={{ width: "1vh" }} src="/icons/blueClock.svg" />
                    </div>
                    <div className="width75">
                        <div className="info ">מחק מפגש תקיעה בשופר</div>
                    </div>
                </div>
            </div>


        </div>
    );
}
export default BlastInfo;