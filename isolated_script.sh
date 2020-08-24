#!/bin/bash
NC='\033[0m'
GRE='\033[0;32m'
YEL='\033[0;33m'
RED='\e[31m'
TAB_CHAR=$'\t'
isolated_row_cnt=0
echo -e "\\n${YEL}This script finds all the meeting info for each isolated and sends sms to all of them with that information\\n${NC}"
echo -e -n "${RED}Are you sure you want to run this script? [y/n]\\n${NC}"

read confirm
if [ "$confirm" != "Y" ] && [ "$confirm" != "y" ]; then
    echo "canceled"
else
    #select all isolated's meeting info
    mysql -hlocalhost -uroot -pz10mz10m roshHashana -se 'SELECT
        true AS "isPublicMeeting", CustomUser.name, CustomUser.username AS "phoneNumber" , shofar_blower_pub.address AS "meetingAddress" ,shofar_blower_pub.start_time AS "meetingStartTime", blowerUser.name AS "blowerName"
        FROM isolated
        LEFT JOIN shofar_blower_pub ON isolated.blowerMeetingId=shofar_blower_pub.id
        LEFT JOIN CustomUser ON isolated.userIsolatedId= CustomUser.id
        LEFT JOIN CustomUser blowerUser ON blowerUser.id= shofar_blower_pub.blowerId
        LEFT JOIN shofar_blower ON shofar_blower.id=isolated.blowerMeetingId
        WHERE isolated.public_meeting=1
        UNION SELECT
        false AS "isPublicMeeting", CustomUser.name, CustomUser.username AS "phoneNumber", CustomUser.address AS "meetingAddress",isolated.meeting_time AS "meetingStartTime" ,blowerUser.name AS "blowerName"
        FROM isolated
        LEFT JOIN CustomUser ON CustomUser.id= isolated.userIsolatedId
        LEFT JOIN CustomUser blowerUser ON blowerUser.id=blowerMeetingId
        LEFT JOIN shofar_blower ON shofar_blower.id=isolated.blowerMeetingId
        WHERE isolated.public_meeting=0' | while IFS= read -r isolated_row; do
        # Set tab as the delimiter
        IFS=$'\t'
        read -a isolated_row_arr <<<"$isolated_row"
        #Read the split words into an array based on space delimiter
        for val in "${isolated_row_arr[@]}"; do
            echo "$isolated_row_cnt val $val"
            ((isolated_row_cnt++))
        done
        isolated_row_cnt=0
    done
fi
