const express = require('express'),
    helmet = require('helmet'),
    body_parser = require('body-parser'),
    axios = require('axios'),
    database = require('./db'),
    PlaylistSchema = require('./Schemas/PlaylistSchema');

// Configure Environment Variables.
require('dotenv').config();

// Set up Express.JS with security and parser libraries.
const app = express();
app.use(body_parser.json());
app.use(helmet());

// Port configuration
var port = process.env.PORT || 8000;

//Function to request data from API
const getPlaylist = async (playListID) => {
    
    var ytdata = {};

    const response = await axios.all([
        axios.get('https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&maxResults=100&id='+playListID+'&key='+process.env.YOUTUBE_API_KEY),
        axios.get('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=100&playlistId='+playListID+'&key='+process.env.YOUTUBE_API_KEY)
    ])
    .then(axios.spread((res1,res2)=>{
        //Collecting generic playlist data
        
        ytdata["id"] = res2.data.items[0].id;
        ytdata["title"] = res2.data.items[0].snippet.title.toString();
        ytdata["description"] = res2.data.items[0].snippet.description;
        ytdata["thumbnails"] = res2.data.items[0].snippet.thumbnails;
        ytdata["no_of_vids"] = res1.data.items[0].contentDetails.itemCount;
        ytdata["video"] = [];

        //Sanitising video data
        for(let i=0;i<res1.data.items[0].contentDetails.itemCount;i++){
            let snip = {};
            let meta = res2.data.items[i].snippet;

            snip["title"] = meta.title;
            snip["url"] = "https://www.youtube.com/watch?v="+meta.resourceId.videoId+"&list="+meta.playlistId+"/";
            snip["id"] = meta.resourceId.videoId;
            snip["description"]= meta.description;
            snip["thumbnail"] = meta.thumbnails;

            ytdata["video"].push(snip);
        }

        return ytdata;
    }))
    .catch((err)=> console.log(err));

    return response;
}

//Function to get playlistID and to insert it into the database
function writePlaylist(playListID){
    getPlaylist(playListID)
        .then((res)=>{
            PlaylistSchema.create({
                id: res.id,
                title: res.title,
                description: res.description,
                thumbnails: res.thumbnails,
                no_of_vids: res.no_of_vids,
                video: res.video
            }, function(err,playlist){
                if(err)
                    console.log(err);
                else if(playlist)  
                    console.log("Added document successfully.");
            });
        })
        .catch((e)=>console.log(e));
}


// Function to retrieve playlists
app.get('/playlists', (req,res)=>{

    PlaylistSchema.find({}, function(err,playlist){
        if(err) 
            res.status(404).send({"error": "no data available"});
        else 
            res.status(200).send(playlist);
    });
});

app.get('/readCSV', (req,res)=>{
    
});

app.listen(port, ()=>console.log(`Running on port ${port}`))