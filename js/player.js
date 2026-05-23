/**
 * Manages sequential playback of sign videos and fingerspelling images.
 */
class SignPlayer {
    /**
     * @param {string} outputContainerId - The ID of the div where signs will be displayed.
     */
    constructor(outputContainerId) {
        this.container = document.getElementById(outputContainerId);
        this.isPlaying = false;
        this.queue = [];
        this.currentIndex = 0;
        this.dictionary = null;
        this.alphabet = null;
        this.imageDuration = 800; // Duration to show each fingerspelling image in ms
    }

    /**
     * Plays a sequence of signs and letters.
     * @param {Array<string>} sequence - Array of words/letters to play.
     * @param {Object} dictionary - Mapping of words to video files.
     * @param {Object} alphabet - Mapping of letters to image files.
     */
    async playSequence(sequence, dictionary, alphabet) {
        if (this.isPlaying) {
            console.warn("Already playing a sequence.");
            return;
        }

        this.isPlaying = true;
        this.queue = sequence;
        this.dictionary = dictionary;
        this.alphabet = alphabet;
        this.currentIndex = 0;

        await this.playNext();
    }

    /**
     * Plays the next item in the queue.
     */
    async playNext() {
        if (this.currentIndex >= this.queue.length) {
            this.finish();
            return;
        }

        const item = this.queue[this.currentIndex];
        this.currentIndex++;

        // Check if it's a dictionary word (sign video)
        if (this.dictionary[item]) {
            await this.playVideo(this.dictionary[item]);
        } 
        // Check if it's a letter (fingerspelling image)
        else if (this.alphabet[item.toLowerCase()]) {
            await this.showImage(this.alphabet[item.toLowerCase()]);
        } 
        // Unknown: Skip or handle as space
        else {
            await this.playNext();
        }
    }

    /**
     * Creates and plays a video element.
     * @param {string} filename - The video filename.
     */
    playVideo(filename) {
        return new Promise((resolve) => {
            this.container.innerHTML = "";
            const video = document.createElement("video");
            video.src = `assets/signs/${filename}`;
            video.autoplay = true;
            video.className = "sign-media";
            
            video.onended = () => {
                resolve(this.playNext());
            };

            video.onerror = () => {
                console.error(`Error loading video: ${filename}`);
                resolve(this.playNext());
            };

            this.container.appendChild(video);
        });
    }

    /**
     * Displays an image for a fixed duration.
     * @param {string} filename - The image filename.
     */
    showImage(filename) {
        return new Promise((resolve) => {
            this.container.innerHTML = "";
            const img = document.createElement("img");
            img.src = `assets/fingerspelling/${filename}`;
            img.className = "sign-media";

            this.container.appendChild(img);

            setTimeout(() => {
                resolve(this.playNext());
            }, this.imageDuration);
        });
    }

    /**
     * Shows "Fin" when the sequence is complete.
     */
    finish() {
        this.isPlaying = false;
        this.container.innerHTML = '<div class="finish-text">Fin</div>';
    }
}

// Export for use in main.js
if (typeof module !== "undefined" && module.exports) {
    module.exports = SignPlayer;
} else {
    window.SignPlayer = SignPlayer;
}
