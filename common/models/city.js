'use strict';

module.exports = function (City) {

    City.getAllCities = async () => {
        try {
            let res = await City.find({ fields: "name" });
            return res;
        } catch (error) {
            throw error;
        }
    }

    City.addNewCity = async (newCity, options) => {
        if (options.accessToken && options.accessToken.userId) {
            try {
                let res = await City.create({ name: newCity });
                return res.id
            } catch (error) {
                throw error;
            }
        }
    }

    City.remoteMethod('getAllCities', {
        http: { verb: 'get' },
        returns: { arg: 'res', type: 'object', root: true }
    });

    City.remoteMethod('addNewCity', {
        http: { verb: 'post' },
        accepts: [
            { arg: 'newCity', type: 'string' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' },
        ],
    });
}
