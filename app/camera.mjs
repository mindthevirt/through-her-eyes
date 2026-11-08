/** @typedef {{ srcObject: MediaProvider | null, play: () => Promise<void> }} VideoTarget */

/** Keeps ownership of every requested stream, including requests that resolve late. */
export function createCameraController() {
  let generation = 0;
  /** @type {MediaStream | null} */
  let activeStream = null;
  /** @type {VideoTarget | null} */
  let activeVideo = null;

  const stop = () => {
    generation += 1;
    if (activeVideo && activeVideo.srcObject === activeStream) {
      activeVideo.srcObject = null;
    }
    activeStream?.getTracks().forEach((track) => track.stop());
    activeStream = null;
    activeVideo = null;
  };

  /**
   * @param {() => Promise<MediaStream>} request
   * @param {() => VideoTarget | null} getVideo
   * @returns {Promise<{status: 'started' | 'stale'} | {status: 'failed', error: unknown}>}
   */
  const start = async (request, getVideo) => {
    stop();
    const current = generation;
    /** @type {MediaStream | null} */
    let stream = null;
    try {
      stream = await request();
      if (current !== generation) {
        stream.getTracks().forEach((track) => track.stop());
        return { status: "stale" };
      }
      const video = getVideo();
      if (!video) throw new Error("Camera video is unavailable");
      activeStream = stream;
      activeVideo = video;
      video.srcObject = stream;
      await video.play();
      if (current !== generation) return { status: "stale" };
      return { status: "started" };
    } catch (error) {
      if (current !== generation) {
        // stop() already released a stream assigned to this controller.
        // A stream acquired before assignment still needs to be released.
        if (stream && stream !== activeStream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        return { status: "stale" };
      }
      if (stream && stream !== activeStream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      stop();
      return { status: "failed", error };
    }
  };

  return { start, stop };
}
