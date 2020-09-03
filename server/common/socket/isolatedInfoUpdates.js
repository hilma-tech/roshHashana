
//newData(data)-> address, comments, username, public_phone, lat, lng, name, public_meeting -> brings changes
//currData(isolatedInfo)-> address, comments, username, public_phone, lat, lng, name, public_meeting, blowerMeetingId
//newMeetingId=null-> if created new meeting
//אם אין lat וlng אז צריך לקבל אותם בשרת לפי הכתובת כי אם אין אותם אין צורך בsocket
//הקוד להלך יוצא מנקודת הנחה שיש lng וlat, לכן לפני קריאה אליו בפרויקט יש לוודא שיש lng וlat
module.exports = class IsolatorInfoUpdateSocket {
    constructor(Model) {
        this.Model = Model;
        this.newData = null
        this.currData = null
        this.newMeetingId = null
        this.hasGeneralUsersConnected = this.hasGeneralUsersConnected.bind(this)
        this.publicHasBlower = this.publicHasBlower.bind(this)
        this.setCurrIsolatedInfo = this.setCurrIsolatedInfo.bind(this)
        this.setNewData = this.setNewData.bind(this)
        this.setNewMeetingId = this.setNewMeetingId.bind(this)
        this.handleIsolatorUpdateInfo = this.handleIsolatorUpdateInfo.bind(this)
        this.addNewReqForAllShofarBlowers = this.addNewReqForAllShofarBlowers.bind(this)
        this.updateReqForAllShofarBlowers = this.updateReqForAllShofarBlowers.bind(this)
    }
    setCurrIsolatedInfo(currData) {
        this.currData = currData
    }
    setNewData(newData) {
        this.newData = newData
    }
    setNewMeetingId(newMeetingId) {
        this.newMeetingId = newMeetingId
    }
    async handleIsolatorUpdateInfo(newData) {
        if (newData) this.newData = newData
        if (this.newData.address || this.newData.comments || this.newData.name || this.newData.username || this.newData.public_phone || this.newData.public_meeting !== undefined || this.newData.public_meeting !== null) { //change in: address|comments|name|username|public_phone
            if ((this.newData.public_meeting == 0 || this.newData.public_meeting == false || !this.newData.public_meeting) && (this.currData.public_meeting == 0 || this.currData.public_meeting === false)) { //is private meeting (public_meeting hasn't changed)
                let isPubMeeting = this.newData.public_meeting === null || this.newData.public_meeting === undefined ? this.currData.public_meeting : this.newData.public_meeting;
                let objToSocketEvent = {
                    "meetingId": this.currData.id, // when meeting id did not change! (no change of private to private and vice versa)
                    "startTime": this.currData.meeting_time,
                    "address": this.newData.address || this.currData.UserToIsolated().address,
                    "lng": this.newData.lng || this.currData.UserToIsolated().lng,
                    "lat": this.newData.lat || this.currData.UserToIsolated().lat,
                    "comments": (this.newData.comments && this.newData.comments.length < 255) ? this.newData.comments : this.currData.UserToIsolated().comments,
                    "isPublicMeeting": isPubMeeting,
                    "name": this.newData.name || this.currData.UserToIsolated().name,
                    "phone": this.newData.username || this.currData.UserToIsolated().username
                }
                if (!this.currData.blowerMeetingId) {//public_meeting=0, blowerMeetingId=null ,אין בעל תוקע לפגישה הפרטית
                    console.log('1111')
                    this.Model.app.io.to('isolated-events').emit('modifyIsolatorInfo', objToSocketEvent)
                    return
                }
                else {//has blower-> update my meetings 
                    console.log('aaaa')
                    this.Model.app.io.to('isolated-events').emit(`modifyIsolator_${isPubMeeting}_${this.currData.id}`, objToSocketEvent)
                    return;
                }
            }
            else if ((this.currData.public_meeting == 1 || this.currData.public_meeting === true) && (this.newData.public_meeting === false || this.newData.public_meeting == 0)) { //change from public meeting to private meeting
                let hasBlower = await this.publicHasBlower(this.currData.blowerMeetingId);
                if (hasBlower) { //has blower
                    if (await this.hasGeneralUsersConnected(this.currData.blowerMeetingId)) {//מחוברים אליו אנשים 		
                        this.addNewReqForAllShofarBlowers()
                        return;
                    }
                    else { //no blower -> update my meetings and update general map
                        console.log('else 6')
                        let objToSocketEvent = {
                            "oldMeetingId": this.currData.blowerMeetingId, //shofar_blower.id (public meeting id)
                            "meetingId": this.currData.id, //new meetind id, will be isolated.id (private)
                            "startTime": this.currData.start_time,
                            "address": this.currData.UserToIsolated().address,
                            "lng": this.currData.UserToIsolated().lng,
                            "lat": this.currData.UserToIsolated().lat,
                            "comments": (this.newData.comments && this.newData.comments.length < 255) ? this.newData.comments : this.currData.UserToIsolated().comments,
                            "isPublicMeeting": this.newData.public_meeting === null || this.newData.public_meeting === undefined ? this.currData.public_meeting : this.newData.public_meeting,
                            "oldIsPublicMeeting": true,
                            "name": this.newData.name ? this.newData.name : this.currData.UserToIsolated().name,
                            "phone": this.newData.username ? this.newData.username : this.currData.UserToIsolated().username
                        }
                        this.Model.app.io.to('isolated-events').emit(`modifyIsolator_${true}_${this.currData.blowerMeetingId}`, objToSocketEvent)
                    }
                }
            }
        }
        if (this.newData.comments || this.newData.name || this.newData.username || this.newData.public_phone) { //אלה השתנו
            if ((this.currData.public_meeting == 1 || this.currData.public_meeting === true) && (this.newData.public_meeting === false || this.newData.public_meeting == 0)) { //change from public meeting to private meeting
                if (!this.currData.blowerMeetingId) { //no s_blower
                    let objToSocketEvent = {
                        "oldMeetingId": this.currData.blowerMeetingId, //shofar_blower.id (public meeting id)
                        "meetingId": this.currData.id, //new meetind id, will be isolated.id (private)
                        "startTime": this.currData.start_time,
                        "address": this.currData.UserToIsolated().address,
                        "lng": this.currData.UserToIsolated().lng,
                        "lat": this.currData.UserToIsolated().lat,
                        "comments": (this.newData.comments && this.newData.comments.length < 255) ? this.newData.comments : this.currData.UserToIsolated().comments,
                        "isPublicMeeting": this.newData.public_meeting === null || this.newData.public_meeting === undefined ? this.currData.public_meeting : this.newData.public_meeting,
                        "name": this.newData.name ? this.newData.name : this.currData.UserToIsolated().name,
                        "phone": this.newData.username ? this.newData.username : this.currData.UserToIsolated().username
                    }
                    console.log('2222')
                    this.Model.app.io.to('isolated-events').emit('modifyIsolatorInfo', objToSocketEvent)
                    return;
                }
            }
            else if ((this.currData.public_meeting == 0 || this.currData.public_meeting === false) && (this.newData.public_meeting == 1 || this.newData.public_meeting === true)) {//change from private to public
                let objToSocketEvent = {
                    "oldMeetingId": this.currData.id, //private
                    "meetingId": this.newMeetingId, //public
                    "startTime": this.currData.start_time,
                    "address": this.currData.UserToIsolated().address,
                    "lng": this.currData.UserToIsolated().lng,
                    "lat": this.currData.UserToIsolated().lat,
                    "comments": (this.newData.comments && this.newData.comments.length < 255) ? this.newData.comments : this.currData.UserToIsolated().comments,
                    "isPublicMeeting": 1,
                    "oldIsPublicMeeting": 0,
                    "name": this.newData.name ? this.newData.name : this.currData.UserToIsolated().name,
                    "phone": this.newData.username ? this.newData.username : this.currData.UserToIsolated().username
                }
                console.log('1212')

                this.Model.app.io.to('isolated-events').emit('modifyIsolatorInfo', objToSocketEvent)
                return;

            }
            else console.log('else 5')
        }
        if (this.newData.address) {
            if ((this.currData.public_meeting === true || this.currData.public_meeting == 1) && (this.newData.public_meeting === true || this.newData.public_meeting == 1)) { // public
                if (!await this.publicHasBlower(this.currData.blowerMeetingId)) {//אין לו בעל תוקע
                    this.updateReqForAllShofarBlowers();
                    return
                } else { // יש בעל תוקע
                    if (await this.hasGeneralUsersConnected(this.currData.blowerMeetingId)) { // אנשים מחוברים אליו
                        let objToSocketEvent = {
                            "meetingId": this.newMeetingId, //new meetind id, will be shofar_blower_pub.id (public)
                            "startTime": this.currData.start_time,
                            "address": this.currData.UserToIsolated.address,
                            "lng": this.currData.UserToIsolated.lng,
                            "lat": this.currData.UserToIsolated.lat,
                            "comments": (this.newData.comments && this.newData.comments.length < 255) ? this.newData.comments : this.currData.UserToIsolated.comments,
                            "isPublicMeeting": true,
                            "name": this.newData.name ? this.newData.name : this.currData.UserToIsolated.name,
                            "phone": this.newData.username ? this.newData.username : this.currData.UserToIsolated.username
                        }
                        console.log('4444')
                        this.Model.app.io.to('isolated-events').emit('modifyIsolatorInfo', objToSocketEvent)
                        return;
                    }
                    else {
                        console.log('else 10') //TODO לעדכן ב mymeeting ובמפה הכללית 

                    }
                }
            } else if ((this.currData.public_meeting == 0 || this.currData.public_meeting === false) && (this.newData.public_meeting == 1 || this.newData.public_meeting === true)) { //change from private to public //?
                let objToSocketEvent = {
                    "oldMeetingId": this.currData.id, //isolated.id (private)
                    "meetingId": this.newMeetingId, //new meetind id, will be shofar_blower_pub.id (public)
                    "startTime": this.currData.meeting_time || null,
                    "address": this.newData.address || this.currData.UserToIsolated().address,
                    "lng": this.newData.lng || this.currData.UserToIsolated().lng,
                    "lat": this.newData.lat || this.currData.UserToIsolated().lat,
                    "comments": (this.newData.comments && this.newData.comments.length < 255) ? this.newData.comments : this.currData.UserToIsolated().comments,
                    "isPublicMeeting": 1,
                    "oldIsPublicMeeting": 0,
                    "name": this.newData.name ? this.newData.name : this.currData.UserToIsolated().name,
                    "phone": this.newData.username ? this.newData.username : this.currData.UserToIsolated().username
                }
                if (!this.currData.blowerMeetingId) { //אין בעל תוקע isolated.id (checking private)
                    //update private req to public (need to change meetingId, oldMeetingId will be checked on client)
                    console.log('555')
                    this.Model.app.io.to('isolated-events').emit('modifyIsolatorInfo', objToSocketEvent)
                    return;
                }
                else { //has blower -> update my-meetings and general map
                    console.log('else 11')//TODO לעדכן במפה הכללית ובmymeetings 
                    this.Model.app.io.to('isolated-events').emit(`modifyIsolator_${false}_${this.currData.id}`, objToSocketEvent)
                }

            }
            else if ((this.currData.public_meeting == 1 || this.currData.public_meeting === true) && (this.newData.public_meeting == 0 || this.newData.public_meeting === false)) { //public to private //?
                if (!await this.publicHasBlower(this.currData.blowerMeetingId)) { //no s_blower
                    //update public req to private (no s_blower)
                    let objToSocketEvent = {
                        "oldMeetingId": this.currData.blowerMeetingId, //will be shofar_blower.id -- which is isolated.blowerMeetingId (was public meeting)
                        "meetingId": this.currData.id, //will be id of isolated (now private)
                        "startTime": this.currData.meeting_time,
                        "address": this.newData.address || this.currData.UserToIsolated().address,
                        "lng": this.newData.lng || this.currData.UserToIsolated().lng,
                        "lat": this.newData.lat || this.currData.UserToIsolated().lat,
                        "comments": (this.newData.comments && this.newData.comments.length < 255) ? this.newData.comments : this.currData.UserToIsolated().comments,
                        "isPublicMeeting": 0,
                        "oldIsPublicMeeting": 1,
                        "name": this.newData.name ? this.newData.name : this.currData.UserToIsolated().name,
                        "phone": this.newData.username ? this.newData.username : this.currData.UserToIsolated().username
                    }
                    console.log('666')

                    this.Model.app.io.to('isolated-events').emit('modifyIsolatorInfo', objToSocketEvent)
                }
                else console.log('else 12') //TODO עדכון לבעל התוקע ובמפה הכללית
            }
            // if changed address and is private
        }
    }

    updateReqForAllShofarBlowers() {
        //update req for all shofar blowers 
        console.log('newData: ', this.newData);
        console.log('currData: ', this.currData);
        let objToSocketEvent = {
            "meetingId": this.currData.blowerMeetingId, // when meeting id did not change! (no change of private to private and vice versa)
            "startTime": this.currData.meeting_time,
            "address": this.newData.address || this.currData.UserToIsolated().address,
            "lng": this.newData.lng || this.currData.UserToIsolated().lng,
            "lat": this.newData.lat || this.currData.UserToIsolated().lat,
            "comments": (this.newData.comments && this.newData.comments.length < 255) ? this.newData.comments : this.currData.UserToIsolated().comments,
            "isPublicMeeting": this.newData.public_meeting === null || this.newData.public_meeting === undefined ? this.currData.public_meeting : this.newData.public_meeting,
            "name": this.newData.name || this.currData.UserToIsolated().name,
            "phone": this.newData.username || this.currData.UserToIsolated().username
        }
        console.log("emit modifyIsolatorInfo in room isolated-events ", objToSocketEvent);
        this.Model.app.io.to('isolated-events').emit('modifyIsolatorInfo', objToSocketEvent)
    }


    addNewReqForAllShofarBlowers() {
        let objToSocketEvent = {
            "meetingId": this.currData.blowerMeetingId,
            "startTime": this.currData.start_time,
            "address": this.currData.UserToIsolated().address,
            "lng": this.currData.UserToIsolated().lng,
            "lat": this.currData.UserToIsolated().lat,
            "comments": (this.newData.comments && this.newData.comments.length < 255) ? this.newData.comments : this.currData.UserToIsolated().comments,
            "isPublicMeeting": this.newData.public_meeting === null || this.newData.public_meeting === undefined ? this.currData.public_meeting : this.newData.public_meeting,
            "name": this.newData.name ? this.newData.name : this.currData.UserToIsolated().name,
            "phone": this.newData.username ? this.newData.username : this.currData.UserToIsolated().username
        }
        console.log('888')

        this.Model.app.io.to('isolated-events').emit('newIsolator', objToSocketEvent);
        return;
    }


    hasGeneralUsersConnected(publicMeetingId) {
        let numOfRegistered = await this.Model.app.models.Isolated.find({ where: { and: [{ public_meeting: 1 }, { blowerMeetingId: publicMeetingId }] } });
        return Array.isArray(numOfRegistered) ? numOfRegistered.length : false
    }

    publicHasBlower(publicMeetingId) { //todo לבדוק מה זה מחזיר 
        console.log('dsm', publicMeetingId)
        console.log(this.publicMeetBlowerId, 'this.publicMeetBlowerId')
        if (this.publicMeetBlowerId) return true;
        else if (this.publicMeetBlowerId == false) return false;
        else {
            let res = await this.Model.app.models.shofarBlowerPub.findOne({ where: { and: [{ id: publicMeetingId }, { blowerId: null }] } });
            console.log(res, 'res')
            return res ? false : true;
        }
    }
} //end IsolatorInfoUpdateSocket class




