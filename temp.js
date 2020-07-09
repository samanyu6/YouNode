
// Function to retrieve next page
const nextPages = async (playListID, nextToken, nextData) =>{
    const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=100&nextPageToken='+nextToken+'&playlistId='+playListID+'&key='+process.env.YOUTUBE_API_KEY)
                    .then((res1)=>{

                        (res1.data.items).forEach((e)=>{
                            var snip = {};
                            let meta = e.snippet;
                            snip["title"] = meta.title;
                            snip["url"] = "https://www.youtube.com/watch?v="+meta.resourceId.videoId+"&list="+meta.playlistId+"/";
                            snip["id"] = meta.resourceId.videoId;
                            snip["description"]= meta.description;
                            snip["thumbnail"] = meta.thumbnails;
                
                            nextData.push(snip);
                            if(res1.data.nextPageToken)
                                nextPages(playListID, res1.data.nextPageToken, nextData).then((r)=>{
                                    nextData.push(r);
                                });                           
                        });

                        return nextData;
                    })
                    .catch((e)=> console.log(e));
    
    return response;
}



 if(res2.data.nextPageToken)
 nextPages(playListID, res2.data.nextPageToken, [])
     .then((res)=>ytdata["video"].push(res))
     .catch((err)=>console.log("err-1"));