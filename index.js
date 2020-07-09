const express = require('express'),
    helmet = require('helmet'),
    body_parser = require('body-parser'),
    axios = require('axios'),
    database = require('./db'),
    PlaylistSchema = require('./Schemas/PlaylistSchema'),
    xlsx = require('xlsx');

// Configure Environment Variables.
require('dotenv').config();

// Set up Express.JS with security and parser libraries.
const app = express();
app.use(body_parser.json());
app.use(helmet());

// Port configuration
var port = process.env.PORT || 8000;

// Function to retrieve next page

// Function to retrieve next page
const nextPages = async (playListID, nextToken, nextData) =>{
    const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=100&pageToken='+nextToken+'&playlistId='+playListID+'&key='+process.env.YOUTUBE_API_KEY)
                    .then((res1)=>{

                        for(let i=0;i<res1.data.items.length;i++){
                            var snip={};
                            let meta = res1.data.items[i].snippet;
                            snip["title"] = meta.title;
                            snip["url"] = "https://www.youtube.com/watch?v="+meta.resourceId.videoId+"&list="+meta.playlistId+"/";
                            snip["id"] = meta.resourceId.videoId;
                            snip["description"]= meta.description;
                            snip["thumbnail"] = meta.thumbnails;
                
                            nextData.push(snip);
                        }
                        
                        //     if(res1.data.nextPageToken)
                        //         nextPages(playListID, res1.data.nextPageToken, nextData).then((r)=>{
                        //             nextData.push(r);
                        //         });                           
                        // });

                        return nextData;
                    })
                    .catch((e)=> console.log(e));
    
    return response;
}

//Function to request data from API
const getPlaylist = async (playListID) => {
    
    var ytdata = {};

    const response = await axios.all([
        axios.get('https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&maxResults=100&id='+playListID+'&key='+process.env.YOUTUBE_API_KEY),
        axios.get('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=100&playlistId='+playListID+'&key='+process.env.YOUTUBE_API_KEY)  
    ])
    .then(axios.spread(async (res1,res2)=>{
        let snip = {};

        //Collecting generic playlist data
        ytdata["id"] = res2.data.items[0].id;
        ytdata["title"] = res2.data.items[0].snippet.title.toString();
        ytdata["description"] = res2.data.items[0].snippet.description;
        ytdata["thumbnails"] = res2.data.items[0].snippet.thumbnails;
        ytdata["no_of_vids"] = res1.data.items[0].contentDetails.itemCount;
        ytdata["video"] =[];

        //Sanitising video data
        for(let i=0;i<res2.data.items.length;i++){
            let meta = res2.data.items[i].snippet;
            snip["title"] = meta.title;
            snip["url"] = "https://www.youtube.com/watch?v="+meta.resourceId.videoId+"&list="+meta.playlistId+"/";
            snip["id"] = meta.resourceId.videoId;
            snip["description"]= meta.description;
            snip["thumbnail"] = meta.thumbnails;

            ytdata["video"].push(snip);
        }

        //Getting next page data
        if(res2.data.nextPageToken){
            try{
                ytdata["video"] = await nextPages(playListID, res2.data.nextPageToken, ytdata["video"]);
                return ytdata;

            }catch(e){
                console.log(e);
            }
        }
        else{
            return ytdata;
        }
    }))
    .catch((err)=> console.log(err));

    return response;
}

//Function to get playlistID and to insert it into the database
function writePlaylist(playListID){
    getPlaylist(playListID)
        .then((res)=>{
                console.log(res.video.length)
                PlaylistSchema.create({
                    id: res.id,
                    title: res.title,
                    description: res.description,
                    thumbnails: res.thumbnails,
                    no_of_vids: res.no_of_vids,
                    video: res.video
                }, function(err,playlist){
                    if(err){
                        console.log(`${playListID} error------->`);
                        console.log(err);
                    }
                    else if(playlist){  
                        console.log(`${playListID} added successfully`);
                    }
                    else
                        console.log('error')
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
    var wb = xlsx.readFile('yt_data.xlsx');
    var data = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
    

    writePlaylist('PLdinyWzDfipNMU9M2UqKkaUWIO7v-jGMT');
});

app.listen(port, ()=>console.log(`Running on port ${port}`))


// PL2FEB728FF960FBD9
// PLfhxmdI1VIPhaSc6MisoxZeHhiASVr4_f
// PLdinyWzDfipNMU9M2UqKkaUWIO7v-jGMT
// PLdinyWzDfipO_zPNeIEXy3qxVwYXDCUMf