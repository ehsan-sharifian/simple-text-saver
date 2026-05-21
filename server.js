// 1. Import the built-in "http" tool. This allows Node.js to act like a web server.
const http = require('http');           //require is a node.js function to import some functionalities from external sources.

// 2. Import the built-in "fs" (File System) tool. This allows Node.js to read/write files on your computer.
const fs = require('fs');

// 3. Create the web server program
const server = http.createServer((req, res) => {    //{: Opens the body of our server's traffic-handling function. 
                                                    // Everything down to the matching closing } defines how the server handles an incoming visitor.
    
    // A. Handle security (CORS). This allows your webpage to talk safely to your backend server.
    // setHeader: A method used to attach structural metadata to our response before shipping it back to the network.
    res.setHeader('Access-Control-Allow-Origin', '*');      //'*': The value string; a wildcard meaning "any website." It tells the browser: "Let any external frontend web page read this server's data safely."
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');  //permits clients to submit new data (POST) and execute security checks (OPTIONS).
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');  //The value string; grants permission for the client browser to label their incoming data payloads as JSON format text.

    // If the browser sends a quick security check (OPTIONS), just reply "OK" and stop.
    if (req.method === 'OPTIONS') {
        res.writeHead(200);     //.writeHead: A method that instantly formats and transmits the official status header line back to the network. 200: The standard HTTP status code indicating success (200 OK).
        res.end();              //tells the network that our server is finished transmitting data for this interaction, sealing the network envelope and completing the response.
        return;
    }

    // 1. NEW SECTION: If someone visits the main homepage URL
    if (req.url === '/' && req.method === 'GET') {
        // Read the index.html file from the disk
        fs.readFile('index.html', (err, content) => {           //The file's raw data gets loaded into the content variable.
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading homepage');
            } else {
                // Send the HTML code back to the browser!
                res.writeHead(200, { 'Content-Type': 'text/html' });        //"Hey, don't just display this raw text as code. Read this text, parse the HTML tags (<div>, <button>), and render a beautiful, interactive visual webpage for the user.
                res.end(content);
            }
        });
        return;
    }



    // B. Check if the webpage is hitting the correct address (/save) using a POST request
    if (req.url === '/save' && req.method === 'POST') {
        let body = '';          //Declares a variable that is allowed to change its content over time.

        // C. As data strings flow across the network, catch the pieces and stitch them together
        req.on('data', chunk => {           //.on: An event listener registration method. It tells Node.js: "Listen continuously for a specific network event, and run code whenever it happens."
                                            //.on('data') is Node's way of saying: "Every time a chunk flies in from the network, run this code." It loops automatically until the data stops.
            body += chunk.toString();       //translates raw binary network data (0s and 1s) into a human-readable text format string
        });

        // D. Once all network pieces have fully arrived:
        req.on('end', () => {
            // Convert the raw network string back into a readable JavaScript object
            const data = JSON.parse(body);          //.parse: A method that converts a raw, flat string of text back into a live, interactive JavaScript object.
            const userText = data.message;          //take out the message out of the interactive JavaScript object. btw, that's how the frontend sends it. it sends a message (body: JSON.stringify({ message: textToSend }))

            // E. SAFETY CHECK: Double check that the text isn't empty and is under 200 characters
            if (userText && userText.length <= 200) {
                
                // Add a timestamp and a line break so every entry gets its own neat line
                const lineToWrite = `[${new Date().toISOString()}] ${userText}\n`;

                // F. Write it to disk! "appendFile" creates 'saved_text.txt' if it doesn't exist,
                // and safely adds new text to the bottom without overwriting old text.
                fs.appendFile('saved_text.txt', lineToWrite, (err) => {         //(err) => {: An inline callback function that Node.js calls once the hard drive finishes writing the text. It passes an err parameter containing error info
                    if (err) {
                        // If your hard drive physically errors out, tell the webpage something broke
                        res.writeHead(500, { 'Content-Type': 'text/plain' });       //: Sends back a status code 500 Server Error with metadata telling the browser it is receiving plain text.
                        res.end('Error writing to file');
                    } else {
                        // Success! Tell the browser everything went flawlessly (Status 200 OK)
                        res.writeHead(200, { 'Content-Type': 'text/plain' });       //Every single digital transaction on the web is broken into two sections: The Headers (the envelope) and The Body (the letter inside).
                        res.end('Saved!');
                    }
                });

            } else {
                // If someone bypassed the HTML limit and sent > 200 chars, reject it (Status 400 Bad Request)
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid text length.');
            }
        });                                 //.on('end') fires once when the final chunk arrives.

    } else {
        // If someone tries to visit an address that isn't /save, tell them it doesn't exist (Status 404 Not Found)
        //Endpoints meant for saving data should only be accessible via POST requests triggered by your frontend code, never by people casually browsing the URL path.
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});


// This tells the app: Use the port the cloud provider assigns us, OR fallback to 3000 locally.
const PORT = process.env.PORT || 3000;

// 4. Turn the server on! It will now sit awake, listening for data on Port 3000.
server.listen(PORT, () => {
    console.log('Server running perfectly on port ${PORT}');
});