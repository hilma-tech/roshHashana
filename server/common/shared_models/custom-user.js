/*

DEPRECATED - duplicate of /common/models/customuser.js

'use strict';
var logUser = require('debug')('model:user');
var path = require('path');
module.exports = function (Customuser) {
	const rolesEnum = {
		ADMIN: 1,
		SUPERADMIN: 2,
		TEACHER: 3,
		STUDENT: 4

	}
	const rolesEncodes = {
		ADMIN: "gmrkipgm$2300femkFSFKeo375",
		SUPERADMIN: "spf%#kfpoFFAa2234adAA244asZZv",
		TEACHER: "fkoewpAQEK345FF2&&grkoBV[]&*437*",
		STUDENT: "ccNgfs45KMNddojip##zzmMMqlpa"

	}

	var senderAddress = 'videoscarmel@gmail.com';


	//send verification email after registration 
	Customuser.afterRemote('create', function (context, user, next) {
		var options = {
			type: 'email',
			to: user.email,
			from: senderAddress,
			subject: 'Thanks for registering.',
			template: path.resolve(__dirname, '../../server/views/verify.ejs'),
			redirect: '/verified',
			user: user
		};

		user.verify(options, function (err, response) {
			if (err) {
				Customuser.deleteById(user.id);
				return next(err);
			}
			context.res.render('response', {
				title: 'Signed up successfully',
				content: 'Please check your email and click on the verification link ' +
					'before logging in.',
				redirectTo: '/',
				redirectToLinkText: 'Log in'
			});
			Customuser.app.models.RoleMapping.upsert(
				{principalType:"USER",principalId:user.id,roleId:4},
				(err,content)=>{
					if (err) console.error("couldn'r write role")
					else console.log("user signed",content);
				}
			)
		});
	});

	Customuser.afterRemote('prototype.verify', function(context, user, next) {
		context.res.render('response', {
		  title: 'A Link to reverify your identity has been sent '+
			'to your email successfully',
		  content: 'Please check your email and click on the verification link '+
			'before logging in',
		  redirectTo: 'localhost:3000/home',
		  redirectToLinkText: 'Log in'
		});
	  });

	Customuser.getUsersList = function (callback) {
		let userModel = Customuser.app.models.User;
		return userModel.find({}, function (errorrr, data) {
			if (errorrr) {
				logUser("error in find")
				console.log("ERROR!");
				return callback(errorrr)
			}
			logUser("DATAAAA", data)
			let payload = data.map((item, index) => {
				return { id: item.id, username: item.username }
			})
			return callback(null, payload)
		});
		return callback(null, { res: 'aa' })

	}

	Customuser.extendedLogin = function (credentials, include, callback) {
		// Invoke the default login function\
		let userModel = Customuser.app.models.User;
		let rolemap = Customuser.app.models.RoleMapping;
		logUser("this: ", this);
		logUser("login: ", Customuser.login);

		Customuser.login(credentials, include, function (loginErr, loginToken) {
			if (loginErr) {
				logUser("login error", loginErr);
				return callback(loginErr);
			}
			logUser("user logged!")
			loginToken = loginToken.toObject();
			rolemap.find({ where: { principalId: loginToken.userId } }, (err, userrole) => {
				if (err)
					return callback(err, null);
				loginToken.role = userrole[0].roleId;
				switch (loginToken.role) {
					case rolesEnum.STUDENT:
						loginToken.compArr = rolesEncodes.STUDENT;
						break;
					case rolesEnum.TEACHER:
						loginToken.compArr = rolesEncodes.TEACHER;
						break;
					case rolesEnum.SUPERADMIN:
						loginToken.compArr = rolesEncodes.SUPERADMIN;
						break;
					case rolesEnum.ADMIN:
						loginToken.compArr = rolesEncodes.ADMIN;
						break;
					default:
						loginToken.compArr = [];

				}
				logUser("logim token:", loginToken);
				return callback(null, loginToken);
				//return component arr and save in session storage
			});
		});
	};
	Customuser.remoteMethod('getUsersList', {
		http: {
			verb: 'get'
		},
		returns: { arg: 'res', type: 'object' }
	});
	Customuser.remoteMethod('extendedLogin', {
		'http': {
			'path': '/elogin',
			'verb': 'post'
		},
		'accepts': [
			{
				'arg': 'credentials',
				'type': 'object',
				'description': 'Login credentials',
				'required': true,
				'http': {
					'source': 'body'
				}
			},
			{
				'arg': 'include',
				'type': 'string',
				'description': 'Related objects to include in the response. See the description of return value for more details.',
				'http': {
					'source': 'query'
				}
			}
		],
		'returns': [
			{
				'arg': 'token',
				'type': 'object',
				'root': true
			}
		]
	});
};

// CREATE TABLE `CustomUser` (
// 	`id` int(11) NOT NULL AUTO_INCREMENT,
// 	`realm` varchar(512) DEFAULT NULL,
// 	`username` varchar(512) DEFAULT NULL,
// 	`password` varchar(512) DEFAULT NULL,
// 	`credentials` text,
// 	`email` varchar(512) NOT NULL,
// 	`emailVerified` tinyint(1) DEFAULT NULL,
// 	`verificationToken` varchar(512) DEFAULT NULL,
// 	`mainImageId` int(11) DEFAULT NULL,
// 	PRIMARY KEY (`id`)
//   ) ENGINE=InnoDB DEFAULT CHARSET=utf8 


*/