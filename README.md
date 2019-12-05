# ivis-poe

# Path of Exile Player Data Over Time


## This project is in the form of a static HTML project, however as d3js requires a certain backend to function properly, a local python server is recommended.


# Python Server
## to run the python server, follow these steps:
1. Run a command window / terminal / powershell, keep this open while using the website
2. Navigate to the folder where the index.hmtl file is located at
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
4. Leave this window open
5. In your browser, type in
```
localhost:8000/index.html
```
to navigate to the server