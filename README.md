# ivis-poe

# Path of Exile Player Data Over Time


This project is in the form of a static HTML project, however as d3js requires a certain backend to function properly, a local python server is recommended.


# Python Server
**To run the python server, follow these steps:**

1. Run a command window / terminal / powershell, keep this open while using the website
2. Navigate to the folder where the index.html file is located at
3. - Python 3
		- enter command
		```
		python -m http.server
		```
	- Python 2 and lower
		- enter command
		```
		python -m SimpleHTTPServer
		```
4. **Leave this window open**
5. To open the website, type the following line in the URL window of your browser
```
localhost:8000/index.html
```
6. *Optional*:
	- the python server listens to port 8000 by default, you can change this by appending "portnumber &" to the command
		- an example of this would be ```python -m http.server 8080 &```
		- **please note** that this also requires you to use the respective port for the localhost address from Step 5. ```localhost:8080/index.html``` in this example.


# General Project Information

This project is part of an assignment of the ivis (information visualization) class. The idea is to represent the Path of Exile player base's choices, locations, and various other data in an intuitive and visually pleasing way.
This project does **not** use actual player data. The data is instead generated using [mockaroo](https://mockaroo.com/) with the goal of trying to be as realistic as possible. We, for example, take into accountt hat the majority of the playerbase is male rather than female among other variables. The idea here is to not have fully randomized data, but rather randomized data that seems to make sense in the context of this project.

It is also important to know that the way this project is built might change in the future. Right now, the web project requires a local python webserver to run, which is not intuitive at all but makes sense for development reasons.

