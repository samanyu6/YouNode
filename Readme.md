# Introduction 
- Project made to call the youtube API and fetch playlist specific metadata.
- Supports pagination of queries, tested for upto 5000 videos per playlist (upto 50 pages approximately).

# Pre-requisites
- Make sure MongoDB is set up and running on your computer.
- Create a Youtube API Credential on Google Developer Console, and insert it in the .env file.
- Have NodeJS installed.

# How to run: 
- ```shell
    git clone https://github.com/samanyu6/SuperSkool
    cd SuperSkool/
  ```
- ```javascript
    npm i
    nodemon index.js
  ```
- Project will run on http://localhost:5000. If this is unavailable, try http://locahost:8000.

# API Endpoints 
- /playlists : Gets all the playlists stored in the database. Accessible at http://localhost:5000/playlists
- /readCSV :  Reads the CSV file for playlistIDs, Queries the Youtube API for metadata and stores the data in the database. Accessible at http://localhost:5000/readCSV