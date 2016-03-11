Dependencies:

Git;
NodeJS and NPM;
Java (for Google Closure Compiler) -- JRE or JDK, as long as it can run a .jar.

All other dependencies are automatically resolved.


To start, open a command prompt in the project root folder and run the following command:

`npm start`
This will automatically resolve all the dependencies, install them, correct CSS and JS style syntax, minify our SCSS and JS, create source maps and link to them, inject the dependencies into index.html, start a local web server and open a browser page with the application loaded. A simple command, so many things!

This is a development server though. To deploy the application, you can run the following command:

`npm run deploy`
This will again resolve all the dependencies, install them, correct CSS and JS style sytax, minify CSS and JS but not create source maps, remove the original unminified JS and CSS sources, inject the dependencies into index.html, remove all other not necessary files for production environment, and throw this to /dist folder, ready to be deployed.

It's also possible to run a local web server with the deployed content for, for testing, with this command:

`npm run startdist`

Although it's necessary to run `npm run deploy` first.

The dist folder is included in case anything goes wrong with the deployment process, so at least there's opportunity to check the whole thing live and working.
