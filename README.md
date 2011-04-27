[Crewracing](http://dtinth.github.com/crewracing/) (Client-Side Part)
==================================================

This page displays ongoing crew race data in an easier-to-look way.

It downloads the [JSONP data](http://tnk.dt.in.th/tnk2/data.js) from my website,
which is regenerated every 30 minutes from [DJMAX TECHNIKA2 website](http://www.djmaxcrew.com/crewrace/crewrace_ing.asp?page=1).
The fetching process is done by a PHP script. To see the code please look at the "[server](https://github.com/dtinth/crewracing/tree/server)" branch.


Development
-----------

CSS file `css/main.css` is generated from SCSS file `scss/main.scss`, using Compass:

    cd compass
	compass watch

JavaScript file `script.js` is generated from CoffeeScript `script.coffee`:

    coffee -c -w script.coffee
