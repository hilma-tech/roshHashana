#!/bin/bash
COLOR='\e[96m'
NC='\033[0m'

exitIfErr(){

        if [ "$1" -ne 0 ];then
                echo "Some error occured, aborting installation...."
                exit
        fi

}


if [ -z "$1" ];then
        echo
        echo "Please specify a project name to run installation, e.g ./install-pumba.sh myproject"
        echo
        exit
fi

echo
echo -e "${COLOR}Make sure you have permissions to clone this repsitory: /carmel-6000/pumba.git${NC}"
git clone https://github.com/carmel-6000/pumba.git $1
exitIfErr $?
echo

cd $1/

mkdir server/storage/container -p

echo -e "${COLOR}Make sure you have permissions to clone this repsitory: /carmel-6000/carmel-react-auth.git${NC}"
mkdir src/modules
git clone https://github.com/carmel-6000/carmel-react-auth.git src/modules/auth
exitIfErr $?
echo

echo -e "${COLOR}Make sure you have permissions to clone this repsitory: /carmel-6000/carmel-tools.git${NC}"
git clone https://github.com/carmel-6000/carmel-tools.git src/modules/tools
exitIfErr $?
echo

echo -e "${COLOR}Make sure you have permissions to clone this repsitory: /carmel-6000/newdashboard.git${NC}"
git clone https://github.com/carmel-6000/newdashboard.git src/modules/admin
exitIfErr $?
echo

echo -n -e "${COLOR}If you want to create a new database for the project, type its name (to skip this step, press enter)? ${NC}"
read dbname

if [[ -z $dbname ]];then
        echo 
        echo -e "${COLOR}Skipping this step${NC}"
else
        mysql -hlocalhost -uroot -pz10mz10m -Bse "CREATE DATABASE $dbname CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
fi


echo -n -e "${COLOR}Type 'yes' to override database ($1) with boilerplate's default tables or any other key to skip this process: ${NC}"
read anykey

if [ "$anykey" == "yes" ];then
        #scp carmeldev:/home/carmel/dumps/carmelboilerplate.dump.sql /tmp
        mysql -hlocalhost $dbname -uroot -pz10mz10m < dumps/carmelboilerplate.dump.sql
        echo
        echo -e "${COLOR}Database successfully overrided with defaults${NC}"
fi

echo
echo -n -e "${COLOR}run npm install now (yes/any other to skip)? ${NC}"
read anykey

if [ "$anykey" == "yes" ];then
        npm install
fi

echo -e "${COLOR}don't forget to modify server/datasources.json with the relevant details${NC}"

