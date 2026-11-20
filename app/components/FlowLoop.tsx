/*
 * SPDX-FileCopyrightText: © 2026-Present IKI Systems
 * SPDX-License-Identifier: LicenseRef-Proprietary
 */

import { useEffect, useRef, useState } from 'react';
import { asset } from '../lib/asset';
import css from './FlowLoop.module.css';

/** The copy a looping clip needs: two encodings, a poster, and its words. */
export type FlowLoopCopy = {
  videoSrc: string;
  videoWebmSrc: string;
  posterSrc: string;
  ariaLabel: string;
  caption: string;
};

/**
 * A silent looping clip with a caption, used on the home page and at the top of
 * the Send to agent guide.
 *
 * Built to loop. The clip's first and last frames are the same bare canvas, so
 * the restart is a dip and not a cut, and it carries no audio track, which is
 * what lets `autoPlay` start without a gesture (`muted` and `playsInline` are
 * the other two things a phone asks for).
 *
 * Two things the markup alone cannot do, so an effect does them. A visitor who
 * asked for reduced motion gets the poster, which is the finished state, with
 * the browser's own controls so the clip is still theirs to play. And the clip
 * only runs while it is on screen: a loop that keeps decoding below the fold is
 * battery spent on nothing. The prerendered HTML has no browser to ask, so it
 * ships `autoPlay` and the effect corrects it after hydration.
 *
 * `className` goes on the figure, for the page's own width and margins.
 */
export function FlowLoop({ flow, className }: { flow: FlowLoopCopy; className?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Back to the poster, not to frame 0: the clip opens on a bare canvas (its loop
      // seam), and seeking there left an empty black box where the finished state
      // should be. `load()` is what restores the poster, and the attribute goes first
      // because `load()` would otherwise start the clip again.
      el.removeAttribute('autoplay');
      el.pause();
      el.load();
      setStill(true);
      return;
    }
    const watcher = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // A refused play() (data saver, a browser policy) leaves the poster up.
        void el.play().catch(() => undefined);
      } else {
        el.pause();
      }
    }, { threshold: 0.25 });
    watcher.observe(el);
    return () => watcher.disconnect();
  }, []);

  return (
    <figure className={className ? `${css.flow} ${className}` : css.flow}>
      <video
        ref={video}
        className={css.flow__video}
        autoPlay={!still}
        loop
        muted
        playsInline
        controls={still}
        preload="metadata"
        width="1900"
        height="978"
        poster={asset(flow.posterSrc)}
        aria-label={flow.ariaLabel}>
        <source src={asset(flow.videoWebmSrc)} type="video/webm" />
        <source src={asset(flow.videoSrc)} type="video/mp4" />
      </video>
      <figcaption className={css.flow__caption}>{flow.caption}</figcaption>
    </figure>
  );
}
