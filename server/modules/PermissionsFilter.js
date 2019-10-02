const squel = require('squel');
const { exeQuery } = require('../../server/common/db/queries');

const rolesEnum = {
    0: 'NOROLE',
    1: 'ADMIN',
    2: 'SUPERADMIN',
    3: 'TEACHER',
    4: 'SCHOOL'
}

module.exports = class PermissionsFilter {

    constructor(req, app) {
        this.request = req;
        this.app = app;
        this.model = 'Files';
        this.pRecords = [];
    }

    findByKeys(args) {
        let isMatch = true;

        for (let pRecord of this.pRecords) {
            isMatch = true;
            Object.keys(args).forEach((argKey) => {
                let argValue = args[argKey];

                if (!pRecord[argKey] || Array.isArray(argValue) || argValue != pRecord[argKey])
                    isMatch = false;
            })

            if (isMatch) return pRecord;
        };

        return isMatch; //false
    }

    async filterByPermissions() {
        console.log("\nfilterByPermissions");

        const reqParams = this.request.params[0].split('/');
        const fileName = reqParams[reqParams.length - 1];

        //extract access token and find out user id
        let userId = this.request.accessToken && this.request.accessToken.userId;
        if (!userId) { console.log("no user id --> user is logged out"); return; }

        let fileId = fileName.split('.')[0]; //principalId

        const role = await this.app.models.RoleMapping.findOne({
            where: { principalId: userId },
            fields: { roleId: true }
        });
        if (!(role && role.roleId)) { console.log("no user role, aborting..."); return; }

        let userRole = rolesEnum[role.roleId]; //TEACHER, SCHOOL, ADMIN

        let query = squel
            .select({ separator: "\n" })
            .field("*")
            .from('records_permissions')
            .where("model=?", this.model)
            .where(
                squel.expr()
                    .and("principal_id=?", null)
                    .or("principal_id=?", userId)
                    .or("principal_id=?", userRole)
            )
            .where(
                squel.expr().and("record_id=?", null).or("record_id=?", fileId)
            );

        // console.log("query\n", query.toString());
        let [err, pRecords] = await exeQuery(query.toString(), this.app);
        if (err) { console.log("exeQuery err", err); return; }
        if (!pRecords) { console.log("no precords, aborting..."); return; }

        this.pRecords = pRecords;

        let allow = true;

        let record = this.findByKeys({ principal_type: "ROLE", principal_id: userRole })
        if (record && record.permission != 'ALLOW') allow = false;

        record = this.findByKeys({ principal_type: "USER", principal_id: userId })
        if ((record && record.permission == 'ALLOW') || (allow && !record)) allow = true;
        else allow = false;

        return allow;
    }
}
