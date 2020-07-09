const mongoose = require('mongoose');

const Playlist = new mongoose.Schema({
    id: String,
    title: String,
    description: String,
    thumbnails: Array,
    no_of_vids: Number,
    video: Array
})

const PlaylistSchema = mongoose.model("Playlist", Playlist);

module.exports = PlaylistSchema;