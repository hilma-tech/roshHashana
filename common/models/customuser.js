'use strict';

var logUser = require('debug')('model:user');
var path = require('path');

module.exports = function (CustomUser) {
	const rolesEnum = {
		NOROLE:0,
		ADMIN: 1,
		SUPERADMIN: 2,
	}
	const rolesEncodes = {
		NOROLE: "miremerijfgivn238svnsdfsdf",
		ADMIN: "gmrkipgm$2300femkFSFKeo375",
		SUPERADMIN: "spf%#kfpoFFAa2234adAA244asZZv",
	}
	/** This call adds custom behaviour to the standard Loopback login.
	 *
	 *  Since it uses the User.login function of the User model, let's also
	 *  keep the same parameter structure.
	 */

	var senderAddress = 'videoscarmel@gmail.com';


	//send verification email after registration 
	CustomUser.afterRemote('create', function (context, user, next) {
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
				CustomUser.deleteById(user.id);
				return next(err);
			}
			context.res.render('response', {
				title: 'Signed up successfully',
				content: 'Please check your email and click on the verification link ' +
					'before logging in.',
				redirectTo: '/',
				redirectToLinkText: 'Log in'
			});
			CustomUser.app.models.RoleMapping.upsert(
				{principalType:"USER",principalId:user.id,roleId:4},
				(err,content)=>{
					if (err) console.error("couldn'r write role")
					else console.log("user signed",content);
				}
			)
		});
	});

	CustomUser.afterRemote('prototype.verify', function(context, user, next) {
		context.res.render('response', {
		  title: 'A Link to reverify your identity has been sent '+
			'to your email successfully',
		  content: 'Please check your email and click on the verification link '+
			'before logging in',
		  redirectTo: 'localhost:3000/home',
		  redirectToLinkText: 'Log in'
		});
	  });

	CustomUser.getUsersList = function (callback) {
		
		return CustomUser.find({}, function (errorrr, data) {
			if (errorrr) {
				logUser("error in find")
				console.log("ERROR!");
				return callback(errorrr)
			}
			
			let payload = data.map((item, index) => {
				return { id: item.id, username: item.username }
			})
			return callback(null, payload)
		});
		return callback(null, { res: 'aa' })

	}

	CustomUser.extendedLogin = function (credentials, include, callback) {
		// Invoke the default login function\
		//let userModel = CustomUser.app.models.User;
		let rolemap = CustomUser.app.models.RoleMapping;
		//logUser("this: ", this);
		//logUser("login: ", CustomUser.login);

		CustomUser.login(credentials, include, function (loginErr, loginToken) {
			if (loginErr) {
				logUser("login error", loginErr);
				return callback(loginErr);
			}
			logUser("user logged!")
			loginToken = loginToken.toObject();
			rolemap.find({ where: { principalId: loginToken.userId } }, (err, userrole) => {
				if (err)
					return callback(err, null);
				
				if (!userrole || userrole.length==0){
					loginToken.role = rolesEnum.NOROLE;
				}else{
					loginToken.role = userrole[0].roleId;	
				}
				

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
	CustomUser.remoteMethod('getUsersList', {
		http: {
			verb: 'get'
		},
		returns: { arg: 'res', type: 'object' }
	});
	CustomUser.remoteMethod('extendedLogin', {
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