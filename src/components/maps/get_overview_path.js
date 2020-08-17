
import { CONSTS } from '../../consts/const_messages'


export const getOverviewPath = async (google, origin, stops, extraData) => {
    console.log('getOverviewPath!');

    /**
    * origin: { lng: double, lat: double }
    * stops: [ { location: {} }, { location:{} } ]
    * extraData: { startTime, userData } 
    **/

    if (!stops || !Array.isArray(stops) || !stops.length) {
        console.log("no_stops_or_destination", origin, stops);
        return [true];
    }
    const travelMode = google.maps && google.maps.TravelMode && google.maps.TravelMode.WALKING || 'WALKING'
    try {
        origin = { lng: Number(origin.lng), lat: Number(origin.lat) }
    }
    catch (e) { return }
    let waypoints;
    try {
        waypoints = stops.map(s => ({ location: new google.maps.LatLng(Number(s.lat) || Number(s.location.lat), Number(s.lng) || Number(s.location.lng)), stopover: true }))
    } catch (e) {
        waypoints = []
    }
    let destination;
    try {
        destination = waypoints.pop().location
    } catch (e) {
        destination = {}
    }

    // console.log('> origin: ', { ...origin });
    // console.log('> waypoints: ', [...waypoints]);
    // console.log('> destination: ', { ...destination });

    let directionsService = new google.maps.DirectionsService();

    if (!directionsService || !directionsService.route || typeof directionsService.route !== "function") {
        return ["אירעה שגיאה בטעינת המפה, עמכם הסליחה"]
    }
    return await new Promise((resolve, reject) => {
        directionsService.route({
            origin,
            travelMode,
            waypoints,
            destination: destination,
            optimizeWaypoints: false,
            language:"iw"
        }, (result, status) => {
            console.log('result: ', result);
            if (status !== google.maps.DirectionsStatus.OK) {
                resolve(["אירעה שגיאה בטעינת המפה, עמכם הסליחה"])
                return;
            }
            let res = {}
            if (extraData && extraData.getTimes) {
                res.startTimes = []
                let leg;
                let prevStartTimeVal
                let legDuration
                for (let i in stops) {
                    leg = result.routes[0].legs[i]
                    legDuration = Number(leg.duration.value) * 1000
                    if (!res.startTimes[i - 1]) {
                        if (!extraData.userData || !new Date(extraData.userData.startTime).getTime) continue;
                        prevStartTimeVal = new Date(extraData.userData.startTime).getTime()
                    } else {
                        prevStartTimeVal = res.startTimes[i - 1].startTime + CONSTS.SHOFAR_BLOWING_DURATION_MS
                    }
                    res.startTimes.push({ duration: leg.duration, distance: leg.distance, meetingId: stops[i].meetingId, isPublicMeeting: stops[i].isPublicMeeting, startTime: Number(prevStartTimeVal) + legDuration })
                }
            }
            res.overviewPath = result.routes[0].overview_path

            // console.log('Promise.resolve([null, res]): ', [null, res]);
            resolve([null, res])
        })
    })
}
