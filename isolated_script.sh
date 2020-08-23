#!/bin/bash
NC='\033[0m'
GRE='\033[0;32m'
YEL='\033[0;33m'
RED='\e[31m'

# QUERY=

account_sid="AC283aebc6a8ab4d0f1cd4532520b3f83b"
auth_token="9957ad90195d2c722ecc2884319d1c6a"
phone_number="+972546969090"

echo -e "\\n${YEL}This script finds all the meeting info for each isolated and sends sms to all of them with that information\\n${NC}"
echo -e -n "${RED}Are you sure you want to run this script? [y/n]\\n${NC}"

read confirm
if [ "$confirm" == "Y" ] || [ "$confirm" == "y" ]; then

    #select all isolated's meeting info
    mysql -hlocalhost -uroot -pz10mz10m roshHashana -se 'SELECT 
	true AS "isPublicMeeting", CustomUser.name, CustomUser.username AS "phoneNumber" , shofar_blower_pub.address AS "meetingAddress" ,shofar_blower_pub.start_time AS "meetingStartTime",  blowerUser.name AS "blowerName" 
        FROM isolated 
	        LEFT JOIN shofar_blower_pub ON isolated.blowerMeetingId=shofar_blower_pub.id 
	        LEFT JOIN CustomUser ON isolated.userIsolatedId= CustomUser.id 
	        LEFT JOIN CustomUser blowerUser ON blowerUser.id= shofar_blower_pub.blowerId 
	        LEFT JOIN shofar_blower ON shofar_blower.id=isolated.blowerMeetingId
        WHERE isolated.public_meeting=1
        UNION SELECT
 	        false AS "isPublicMeeting", CustomUser.name, CustomUser.username AS "phoneNumber", CustomUser.address AS "meetingAddress",isolated.meeting_time AS "meetingStartTime"  ,blowerUser.name AS "blowerName" 
        FROM isolated 
	        LEFT JOIN CustomUser ON CustomUser.id= isolated.userIsolatedId 
	        LEFT JOIN CustomUser blowerUser ON blowerUser.id=blowerMeetingId 
            LEFT JOIN shofar_blower ON shofar_blower.id=isolated.blowerMeetingId
        WHERE isolated.public_meeting=0' | while IFS= read -r loop; do
        # check if the isolated has meeting or not

        # msg= has meeting
        
        # msg= doesn't have meeting
        echo "loop $loop"
    done

    available_number=$(curl -X GET \
        "https://api.twilio.com/2010-04-01/Accounts/${account_sid}/AvailablePhoneNumbers/US/Local" \
        -u "${account_sid}:${auth_token}" |
        sed -n "/PhoneNumber/{s/.*<PhoneNumber>//;s/<\/PhoneNumber.*//;p;}") &&
        echo "a " $available_number

    curl -X POST -d "Body=שלום שלום שלום." \
        -d "From=${available_number}" -d "To=${phone_number}" \
        "https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages" \
        -u "${account_sid}:${auth_token}"
    # available_number=`curl -X GET \
    # "https://api.twilio.com/2010-04-01/Accounts/${account_sid}/AvailablePhoneNumbers/US/Local"  \
    # -u "${account_sid}:${auth_token}" | \
    # sed -n "/PhoneNumber/{s/.*<PhoneNumber>//;s/<\/PhoneNumber.*//;p;}"` \
    # && echo $available_number
fi
