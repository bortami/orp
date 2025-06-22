
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const nickname = 'dustandrunphotos';
const BASE = 'https://api.smugmug.com';

app.use(express.static(path.join(__dirname, 'public'))); // serve HTML

// API proxy
app.get('/api/galleries', async (req, res) => {
    try {
        const albumsRes = await fetch(`https://api.smugmug.com/api/v2/user/${nickname}!albums?APIKey=nJx32RdgNxkSdcN52pBDjmCSCXdTRxZ5&Order=Date%20Added%20(Descending)`, {
            headers: { 'Accept': 'application/json' }
        });

        const { Response } = await albumsRes.json();
        const albums = Response.Album.slice(0, 6);

        const galleryCards = await Promise.all(albums.map(async (album) => {
            let imageUrl = '';
            try {
                const imgRes = await fetch(`https://api.smugmug.com${album.Uris.AlbumHighlightImage.Uri}`, {
                    headers: { 'Accept': 'application/json' }
                });
                const imgData = await imgRes.json();
                imageUrl = imgData.Response?.AlbumImage?.ThumbnailUrl || '';
            } catch (e) {
                console.warn(`No highlight image for album ${album.Title}`);
            }

            return `<div class="grid-item"> 
                <div class="wptb-item--inner">
                    <div class="wptb-item--image">
                        <img src="${imageUrl}" alt="img">
                    </div>

                    <div class="wptb-item--holder">
                        <div class="wptb-item--meta">
                            <h4><a href="${album.WebUri}">${album.Title}</a></h4>
                            
                        </div>
                    </div>
                </div>
            </div> 
      `;
        }));

        res.send(galleryCards.join(''));
    } catch (err) {
        console.error('Failed to load galleries:', err);
        res.status(500).send('<p>Unable to load galleries.</p>');
    }
});
