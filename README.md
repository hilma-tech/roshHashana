1. $ git clone  https://github.com/hilma-tech/roshHashana.git

2.   $ git submodule update --init --recursive
  (you need auth,samples,scripts,supermodel,tools)
  set in src/mobule/auth/server/models/user.json 
      "password": {
      "type": "string",
      "required": false
    },
    "email": {
      "type": "string",
      "required": false
    },

3. In MYPROJECT run
      $ ./src/modules/scripts/help.sh
      $ npm run generate-config 

4. Open new file - 
    Name - .env
    Write inside - REACT_APP_DOMAIN = "REACT_APP_DOMAIN"
                   REACT_APP_GOOGLE_KEY= "REACT_APP_GOOGLE_KEY"
                   REACT_APP_IS_PRODUCTION="true/ false" (true- if you are in production, false if you work in localhost)

5. Arrange the datasources

6. Create database roshHashana

7. in mysql create new user and update the user's permissions only to roshHashana database:
    CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
    GRANT ALL Privileges ON roshHashana.* TO 'newuser'@'localhost' WITH GRANT OPTION;



while working on the project, NOTICE: to identify a specific meeting, you will need meetingId _and_ isPublicMeeting (with those two as your identifiers, u can find the specific meeting in db - isolated or shofar_blower_pub) 

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
