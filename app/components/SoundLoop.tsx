/*
 * SPDX-FileCopyrightText: © 2026-Present IKI Systems
 * SPDX-License-Identifier: LicenseRef-Proprietary
 */

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { asset } from '../lib/asset';
import css from './SoundLoop.module.css';

/** A take with sound, plus the short silent loop cut from its opening. */
export type SoundLoopCopy = {
  /** The full take, with its audio track. */
  videoSrc: string;
  /** The loop: the take's first seconds, no audio, faded at both ends. */
  loopSrc: string;
  loopWebmSrc: string;
  posterSrc: string;
  ariaLabel: string;
  /** Left out where the figure's own legend goes under the player instead. */
  caption?: string;
  /** The button that hands over to the full take. */
  soundLabel: string;
  /** The same button once the take is running, which hands back to the loop. */
  soundOffLabel: string;
};

/**
 * A silent loop that plays on its own, and one button that carries on into the
 * full take with sound.
 *
 * Why two videos. A browser only starts a clip unasked when it is muted, so the
 * thing that plays on arrival has to be silent, and it should be small: the loop
 * is a few hundred kilobytes where the take is several megabytes. The take is
 * therefore not requested at all (`preload="none"`) until the button is pressed.
 *
 * Sound starts at the beginning. The loop is the take's own opening cut from
 * 0:00, so the two do share a clock and the take could be picked up at the frame
 * the loop is showing -- it used to be. But what the button offers is the sound,
 * and the sound is speech: joining it wherever the loop happened to stand drops
 * the visitor into the middle of a sentence. A seamless picture is not worth an
 * unintelligible first line, so the take starts at 0:00 and the jump backwards is
 * accepted. The loop still stays on screen until the take reports `playing`, so
 * there is no poster flash in between.
 *
 * Going back the other way keeps the continuity, because nothing is being missed:
 * `soundOff` resumes the loop at the take's own moment wherever the loop still
 * holds that frame. The asymmetry is deliberate.
 *
 * Sound stays on. The take carries `loop`, so it repeats with its audio
 * until the visitor says otherwise -- it is their decision when the sound stops,
 * not the clip's length. The same button is how they say so: while the take runs
 * it reads `soundOffLabel` and hands back to the silent loop. Without it the only
 * way back would be reloading the page, because the take covers the loop for as
 * long as it is on.
 *
 * Seeking the take needs a host that answers byte-range requests. The published
 * site does; a plain `python -m http.server` does not. The handover itself no
 * longer seeks, so it survives such a host, but the take carries the browser's
 * own controls and scrubbing them still needs ranges.
 *
 * Cutting a loop from a take (ffmpeg; `END` is where the excerpt stops, and the
 * second fade starts half a second before it). The excerpt must start at 0:00
 * or the handover lands on the wrong moment:
 *
 *   F="fps=30,scale=1920:1080:flags=lanczos,fade=t=in:st=0:d=0.4,fade=t=out:st=$((END-0.5)):d=0.5"
 *   ffmpeg -i take.mp4 -t $END -an -vf "$F" -c:v libx264 -profile:v high -level 4.0 \
 *     -pix_fmt yuv420p -crf 27 -preset slow -movflags +faststart take-loop.mp4
 *   ffmpeg -i take.mp4 -t $END -an -vf "$F" -c:v libvpx-vp9 -pix_fmt yuv420p \
 *     -crf 38 -b:v 0 -row-mt 1 take-loop.webm
 *
 * The Type into app loop is the take's first 13.2 seconds, which ends just
 * after the fourth message lands.
 *
 * The loop only runs while it is on screen. A visitor who asked for reduced
 * motion gets the poster and the same button, which is then the only way
 * anything moves.
 *
 * Under the player goes `clip.caption`, or `footer` where the figure carries a
 * whole legend instead of one line -- the hero's lead, its three membership
 * points and its pricing link. A player with neither gets no `figcaption`.
 */
export function SoundLoop({ clip, className, videoClassName, captionClassName, frameClassName, footer }: {
  clip: SoundLoopCopy;
  className?: string;
  videoClassName?: string;
  captionClassName?: string;
  /**
   * The box that holds the two videos and nothing else. A page that masks or
   * shadows its player hangs those here rather than on the stage, because the
   * stage also holds the sound button: a filter there would drag the button's
   * own shadow with it, and a mask there would cut the button off.
   */
  frameClassName?: string;
  /** Goes under the player in place of `clip.caption`, for a figure with a legend. */
  footer?: ReactNode;
}) {
  const loop = useRef<HTMLVideoElement>(null);
  const take = useRef<HTMLVideoElement>(null);
  // 'loop': the silent loop is showing. 'handover': the take is starting underneath.
  // 'take': the take is showing, with sound and the browser's controls.
  const [phase, setPhase] = useState<'loop' | 'handover' | 'take'>('loop');
  const [still, setStill] = useState(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    const el = loop.current;
    if (!el) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Back to the poster, not to frame 0: the loop opens on black (its seam).
      el.removeAttribute('autoplay');
      el.pause();
      el.load();
      setStill(true);
      return;
    }
    const watcher = new IntersectionObserver(([entry]) => {
      if (phaseRef.current !== 'loop') {
        return;
      }
      if (entry.isIntersecting) {
        void el.play().catch(() => undefined);
      } else {
        el.pause();
      }
    }, { threshold: 0.25 });
    watcher.observe(el);
    return () => watcher.disconnect();
  }, []);

  function playWithSound() {
    const to = take.current;
    if (!to || phase !== 'loop') {
      return;
    }
    setPhase('handover');
    const start = () => {
      // From the top, so the speech is heard from its first word. See above.
      to.currentTime = 0;
      to.muted = false;
      void to.play().catch(() => setPhase('loop'));
    };
    if (to.readyState >= 1) {
      start();
    } else {
      to.addEventListener('loadedmetadata', start, { once: true });
      to.load();
    }
  }

  function takeIsPlaying() {
    if (phase === 'handover') {
      loop.current?.pause();
      setPhase('take');
    }
  }

  /** Back to the silent loop, from wherever the take has got to. */
  function soundOff() {
    const from = take.current;
    const to = loop.current;
    if (!from || !to || phase !== 'take') {
      return;
    }
    from.pause();
    setPhase('loop');
    if (still) {
      // The reduced-motion path again: the poster, not a frozen frame.
      to.load();
      return;
    }
    // The loop is only the take's opening, so the two share a clock for the
    // loop's own length and no further. Inside it the handover is exact, the
    // same way round as `playWithSound`. Past it there is no matching frame, so
    // the loop simply resumes where the handover paused it rather than snapping
    // to its frame 0, which is the black of its fade-in seam.
    if (from.currentTime < to.duration) {
      to.currentTime = from.currentTime;
    }
    void to.play().catch(() => undefined);
  }

  const showTake = phase === 'take';
  const frame = videoClassName ? `${css.video} ${videoClassName}` : css.video;
  const legend = footer ?? clip.caption;
  return (
    <figure className={className ? `${css.figure} ${className}` : css.figure}>
      <div className={css.stage}>
        <div className={frameClassName ? `${css.clip} ${frameClassName}` : css.clip}>
          <video
            ref={loop}
            className={frame}
            autoPlay={!still}
            loop
            muted
            playsInline
            preload="metadata"
            poster={asset(clip.posterSrc)}
            aria-label={clip.ariaLabel}
            aria-hidden={showTake}>
            <source src={asset(clip.loopWebmSrc)} type="video/webm" />
            <source src={asset(clip.loopSrc)} type="video/mp4" />
          </video>
          <video
            ref={take}
            className={`${frame} ${css.take}`}
            data-on={showTake}
            controls={showTake}
            playsInline
            loop
            preload="none"
            tabIndex={showTake ? 0 : -1}
            aria-label={clip.ariaLabel}
            aria-hidden={!showTake}
            onPlaying={takeIsPlaying}>
            <source src={asset(clip.videoSrc)} type="video/mp4" />
          </video>
        </div>
        {/* One button both ways. While the take runs it moves to the top of the
            frame, clear of the browser's own control bar along the bottom. */}
        <button
          type="button"
          className={css.sound}
          data-take={showTake}
          disabled={phase === 'handover'}
          onClick={showTake ? soundOff : playWithSound}>
          <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
            <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3z" />
            {showTake ? (
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                d="m15.5 9.5 5 5m0-5-5 5" />
            ) : (
              <path fill="currentColor" d="M16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />
            )}
          </svg>
          {showTake ? clip.soundOffLabel : clip.soundLabel}
        </button>
      </div>
      {legend && <figcaption className={captionClassName}>{legend}</figcaption>}
    </figure>
  );
}
