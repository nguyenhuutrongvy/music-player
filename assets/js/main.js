const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "MY_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
  currentIndex: 0,
  isPLaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "On My Way",
      singer: "Alan Walker",
      path: "./assets/music/song1.mp3",
      image: "./assets/img/song1.jpg"
    },
    {
      name: "Never Be Alone",
      singer: "TheFatRat",
      path: "./assets/music/song2.mp3",
      image: "./assets/img/song2.jpg"
    },
    {
      name: "Unity",
      singer: "TheFatRat",
      path: "./assets/music/song3.mp3",
      image: "./assets/img/song3.jpg"
    },
    {
      name: "Save Me",
      singer: "ĐEAMN",
      path: "./assets/music/song4.mp3",
      image: "./assets/img/song4.jpg"
    },
    {
      name: "Nevada",
      singer: "Vicetone",
      path: "./assets/music/song5.mp3",
      image: "./assets/img/song5.jpg"
    },
    {
      name: "Umbrella Remix",
      singer: "The White Panda",
      path: "./assets/music/song6.mp3",
      image: "./assets/img/song6.jpg"
    },
    {
      name: "End Of The Night",
      singer: "Danny Avila",
      path: "./assets/music/song7.mp3",
      image: "./assets/img/song7.jpg"
    },
  ],

  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
				<div class="song${index === this.currentIndex ? " active" : ""}" data-index="${index}">
					<div class="thumb" style="background-image: url('${song.image}')">
					</div>
					<div class="body">
						<h3 class="title">${song.name}</h3>
						<p class="author">${song.singer}</p>
					</div>
					<div class="option">
						<i class="fas fa-ellipsis-h"></i>
					</div>
				</div>
			`;
    });

    playlist.innerHTML = htmls.join('');
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      }
    });
  },

  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // Handle rotate CD
    const cdThumbAnimate = cdThumb.animate([
      { transform: 'rotate(360deg)' }
    ], {
      duration: 20000,
      iterations: Infinity
    });
    cdThumbAnimate.pause();

    // Handle thumbnail when scroll playlist
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    }

    // Handle when click Playing button
    playBtn.onclick = function () {
      if (_this.isPLaying) {
        audio.pause();
      } else {
        audio.play();
      }
    }

    audio.onplay = function () {
      _this.isPLaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
      _this.scrollToActiveSong();
    }

    audio.onpause = function () {
      _this.isPLaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    }

    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
        progress.value = progressPercent;
      }
    }

    progress.onchange = function (e) {
      const seekTime = e.target.value / 100 * audio.duration;
      audio.currentTime = seekTime;
    }

    // Handle when click previous button
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.playPreviousSong();
      }
      audio.play();
      _this.render();
    }

    // Handle when click next button
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.playNextSong();
      }
      audio.play();
      _this.render();
    }

    // Handle when shuffle button is activated
    randomBtn.onclick = function () {
      /* if (_this.isRandom) {
        randomBtn.classList.remove("active");
        _this.isRandom = false;
      } else {
        randomBtn.classList.add("active");
        _this.isRandom = true;
      } */

      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      // Add class when true or remove when false
      randomBtn.classList.toggle("active", _this.isRandom);
    }

    // Handle when repeat button is activated
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      // Add class when true and remove when false
      repeatBtn.classList.toggle("active", _this.isRepeat);
    }

    // Handle play next song when audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    }

    // Handle when click on playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      const optionNode = e.target.closest(".option");

      if (songNode || optionNode) {
        // Handle when click on song
        if (songNode) {
          // console.log(songNode.getAttribute("data-index"));
          // console.log(songNode.dataset.index);

          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          audio.play();
          _this.render();
        }

        // Handle when click on song option
        if (optionNode) {

        }
      }
    }
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },

  playPreviousSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  playNextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex = this.currentIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 300);
  },

  start: function () {
    this.loadConfig();
    // Load initial configs
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);

    this.defineProperties();
    this.handleEvents();
    this.loadCurrentSong();
    this.render();
  },
};

app.start();