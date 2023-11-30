/*
   This extension was made with TurboBuilder!
   https://turbobuilder-steel.vercel.app/
*/
(function(Scratch) {
    const variables = {};
    const blocks = [];
    const menus = [];


    function doSound(ab, cd, runtime) {
        const audioEngine = runtime.audioEngine;

        const fetchAsArrayBufferWithTimeout = (url) =>
            new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                let timeout = setTimeout(() => {
                    xhr.abort();
                    reject(new Error("Timed out"));
                }, 5000);
                xhr.onload = () => {
                    clearTimeout(timeout);
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(`HTTP error ${xhr.status} while fetching ${url}`));
                    }
                };
                xhr.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error(`Failed to request ${url}`));
                };
                xhr.responseType = "arraybuffer";
                xhr.open("GET", url);
                xhr.send();
            });

        const soundPlayerCache = new Map();

        const decodeSoundPlayer = async (url) => {
            const cached = soundPlayerCache.get(url);
            if (cached) {
                if (cached.sound) {
                    return cached.sound;
                }
                throw cached.error;
            }

            try {
                const arrayBuffer = await fetchAsArrayBufferWithTimeout(url);
                const soundPlayer = await audioEngine.decodeSoundPlayer({
                    data: {
                        buffer: arrayBuffer,
                    },
                });
                soundPlayerCache.set(url, {
                    sound: soundPlayer,
                    error: null,
                });
                return soundPlayer;
            } catch (e) {
                soundPlayerCache.set(url, {
                    sound: null,
                    error: e,
                });
                throw e;
            }
        };

        const playWithAudioEngine = async (url, target) => {
            const soundBank = target.sprite.soundBank;

            let soundPlayer;
            try {
                const originalSoundPlayer = await decodeSoundPlayer(url);
                soundPlayer = originalSoundPlayer.take();
            } catch (e) {
                console.warn(
                    "Could not fetch audio; falling back to primitive approach",
                    e
                );
                return false;
            }

            soundBank.addSoundPlayer(soundPlayer);
            await soundBank.playSound(target, soundPlayer.id);

            delete soundBank.soundPlayers[soundPlayer.id];
            soundBank.playerTargets.delete(soundPlayer.id);
            soundBank.soundEffects.delete(soundPlayer.id);

            return true;
        };

        const playWithAudioElement = (url, target) =>
            new Promise((resolve, reject) => {
                const mediaElement = new Audio(url);

                mediaElement.volume = target.volume / 100;

                mediaElement.onended = () => {
                    resolve();
                };
                mediaElement
                    .play()
                    .then(() => {
                        // Wait for onended
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });

        const playSound = async (url, target) => {
            try {
                if (!(await Scratch.canFetch(url))) {
                    throw new Error(`Permission to fetch ${url} denied`);
                }

                const success = await playWithAudioEngine(url, target);
                if (!success) {
                    return await playWithAudioElement(url, target);
                }
            } catch (e) {
                console.warn(`All attempts to play ${url} failed`, e);
            }
        };

        playSound(ab, cd)
    }
    class Extension {
        getInfo() {
            return {
                "blockIconURI": "data:image/png;base64,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",
                "id": "lonoiseJE",
                "name": "Julian's Editor",
                "color1": "#ffab01",
                "color2": "#d38301",
                "blocks": blocks
            }
        }
    }
    blocks.push({
        opcode: `crapgame`,
        blockType: Scratch.BlockType.COMMAND,
        text: `launch a crap game`,
        arguments: {},
        disableMonitor: true
    });
    Extension.prototype[`crapGame`] = (args, util) => {
       window.open("https://cysj2-global-web.hortorinteractive.com/app/?p=eyJtb2RlIjoiMSIsImdhbWVJZCI6IkdEOjEyMzI5NjQ6MjMiLCJyb2xlSWQiOiIxMzA3NDUyIn0%3D&tap=1", "crapGame");
    };

   Scratch.extensions.register(new Extension());
})(Scratch);
