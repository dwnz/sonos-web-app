function SonosApp() {
	var self = this;
	self.Spotify = new SpotifyWebApi();

	self.searchText = ko.observable();
	self.artists = ko.observableArray();
	self.albums = ko.observableArray();
	self.queue = ko.observableArray();

	self.artist = ko.observable();
	self.album = ko.observable();
	self.state = ko.observable();
	self.stateInterval = null;

	self.start = function() {
		self.stateInterval = setInterval(self.loadState, 1000);
	};

	self.checkKeys = function(app, e) {
		if (e.keyCode === 13) {
			console.log(self.searchText());
			self.search(self.searchText());
		}

		return true;
	};

	self.search = function(artist, cb) {
		self.artists.removeAll();

		self.Spotify.searchArtists(artist).then(function(data) {
			for (var i = 0; i < data.artists.items.length; i++) {
				var m = new ArtistModel();
				console.log(data.artists.items[i]);
				m.load(data.artists.items[i]);
				self.artists.push(m);
			}

			if (cb) {
				cb();
			}
		}, function(err) {
			console.log(err);
			if (cb) {
				cb();
			}
		});
	};

	self.loadAlbums = function(artist) {
		if (self.artist()) {
			self.artist().selected(false);
		}

		self.artist(artist);
		self.artist().selected(true);

		self.albums.removeAll();
		self.Spotify.getArtistAlbums(self.artist().id()).then(function(data) {
			for (var i = 0; i < data.items.length; i++) {
				var m = new AlbumModel();
				m.load(data.items[i]);
				self.artist().albums.push(m);
			}
		});
	}

	self.loadSongs = function(album) {
		if (self.album()) {
			self.album().selected(false);
		}
		self.album(album);
		self.album().selected(true);

		self.Spotify.getAlbum([album.id()]).then(function(data) {
			console.log(data);
			/*var m = new AlbumDetailsModel();
			m.load(data);
			console.log("Pushing",JSON.parse(ko.toJSON(m)));
			self.album().songs.push(m);*/

			for (var i = 0; i < data.tracks.items.length; i++) {
				var m = new TrackModel();
				m.load(data.tracks.items[i]);
				self.album().songs.push(m);
			}
		});
	}

	self.playSong = function(song) {
		$.get('/api/play/' + song.uri());
	}

	self.loadState = function() {
		$.get('/api/state', function(data) {
			data = JSON.parse(data);
			var m = new StateModel();
			var currentTrack = data.currentTrack;
			console.log(currentTrack);
			m.load({
				songName: currentTrack.title,
				artistName: currentTrack.artist,
				url: currentTrack.absoluteAlbumArtURI,
				uri: currentTrack.uri
			});
			self.state(m);
		});

		if (self.state()) {
			$.get('/api/queue', function(data) {
				data = JSON.parse(data);
				self.queue.removeAll();

				var addNow = false;
				for (var i = 0; i < data.items.length; i++) {
					var m = new QueueModel();

					if (data.items[i].uri === self.state().uri()) {
						addNow = true;
						continue;
					}

					if (addNow) {
						m.load(data.items[i]);
						self.queue.push(m);
					}
				}
			});
		};
	}
}


// MODELS
function ArtistModel() {
	var self = this;

	self.external_urls = ko.observable();
	self.followers = ko.observable();
	self.genres = ko.observableArray();
	self.href = ko.observable();
	self.id = ko.observable();
	self.images = ko.observableArray();
	self.name = ko.observable();
	self.popularity = ko.observable();
	self.type = ko.observable();
	self.uri = ko.observable();
	self.albums = ko.observableArray();
	self.selected = ko.observable(false);

	self.cover = ko.computed(function() {
		if (self.images().length > 0) {
			return self.images()[0].url;
		}
	});

	self.load = function(data) {
		self.external_urls(data.external_urls);
		self.followers(data.followers);
		self.genres(data.genres);
		self.href(data.href);
		self.id(data.id);
		self.images(data.images);
		self.name(data.name);
		self.popularity(data.popularity);
		self.type(data.type);
		self.uri(data.uri);
	}
}

function AlbumModel() {
	var self = this;

	self.album_type = ko.observable();
	self.available_markets = ko.observableArray();
	self.external_urls = ko.observable();
	self.href = ko.observable();
	self.id = ko.observable();
	self.images = ko.observableArray();
	self.name = ko.observable();
	self.type = ko.observable();
	self.uri = ko.observable();
	self.selected = ko.observable(false);
	self.songs = ko.observableArray();

	self.cover = ko.computed(function() {
		if (self.images().length > 0) {
			return self.images()[0].url;
		}
	});

	self.load = function(data) {
		self.album_type(data.album_type);
		self.available_markets(data.available_markets);
		self.external_urls(data.external_urls);
		self.href(data.href);
		self.id(data.id);
		self.images(data.images);
		self.name(data.name);
		self.type(data.type);
		self.uri(data.uri);
	}
}

function AlbumDetailsModel() {
	var self = this;

	self.album_type = ko.observable();
	self.artists = ko.observableArray();
	self.available_markets = ko.observableArray();
	self.copyrights = ko.observableArray();
	self.external_ids = ko.observable();
	self.external_urls = ko.observable();
	self.genres = ko.observableArray();
	self.href = ko.observable();
	self.id = ko.observable();
	self.images = ko.observableArray();
	self.name = ko.observable();
	self.popularity = ko.observable();
	self.release_date = ko.observable();
	self.release_date_precision = ko.observable();
	self.tracks = ko.observableArray();
	self.type = ko.observable();
	self.uri = ko.observable();

	self.load = function(data) {
		self.album_type(data.album_type);
		self.artists(data.artists);
		self.available_markets(data.available_markets);
		self.copyrights(data.copyrights);
		self.external_ids(data.external_ids);
		self.external_urls(data.external_urls);
		self.genres(data.genres);
		self.href(data.href);
		self.id(data.id);
		self.images(data.images);
		self.name(data.name);
		self.popularity(data.popularity);
		self.release_date(data.release_date);
		self.release_date_precision(data.release_date_precision);

		for (var i = 0; i < data.tracks.items.length; i++) {
			var m = new TrackModel();
			m.load(data.tracks.items[i]);
			self.tracks.push(m);
		}

		self.type(data.type);
		self.uri(data.uri);
	}
}

function TrackModel() {
	var self = this;

	self.artists = ko.observableArray();
	self.available_markets = ko.observableArray();
	self.disc_number = ko.observable();
	self.duration_ms = ko.observable();
	self.explicit = ko.observable();
	self.external_urls = ko.observable();
	self.href = ko.observable();
	self.id = ko.observable();
	self.name = ko.observable();
	self.preview_url = ko.observable();
	self.track_number = ko.observable();
	self.type = ko.observable();
	self.uri = ko.observable();
	self.selected = ko.observable(false);

	self.load = function(data) {
		self.artists(data.artists);
		self.available_markets(data.available_markets);
		self.disc_number(data.disc_number);
		self.duration_ms(data.duration_ms);
		self.explicit(data.explicit);
		self.external_urls(data.external_urls);
		self.href(data.href);
		self.id(data.id);
		self.name(data.name);
		self.preview_url(data.preview_url);
		self.track_number(data.track_number);
		self.type(data.type);
		self.uri(data.uri);
	}
}

function StateModel() {
	var self = this;

	self.songName = ko.observable();
	self.artistName = ko.observable();
	self.url = ko.observable();
	self.uri = ko.observable();

	self.load = function(data) {
		self.songName(data.songName);
		self.artistName(data.artistName);
		self.url(data.url);
		self.uri(data.uri);
	}
}

function QueueModel() {
	var self = this;

	self.absoluteAlbumArtURI = ko.observable();
	self.album = ko.observable();
	self.artist = ko.observable();
	self.title = ko.observable();
	self.uri = ko.observable();

	self.queueTitle = ko.computed(function(){
		return self.title() + ' - ' + self.artist();
	});

	self.load = function(data) {
		self.absoluteAlbumArtURI(data.absoluteAlbumArtURI);
		self.album(data.album);
		self.artist(data.artist);
		self.title(data.title);
		self.uri(data.uri);
	}
}