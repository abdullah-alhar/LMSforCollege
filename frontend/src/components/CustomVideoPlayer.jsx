import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

// Extract YouTube video ID from any YouTube URL format
const extractYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Load YouTube IFrame API once globally
let ytApiLoaded = false;
let ytApiLoadingCallbacks = [];

const loadYtApi = (callback) => {
  if (window.YT && window.YT.Player) {
    callback();
    return;
  }
  ytApiLoadingCallbacks.push(callback);
  if (!ytApiLoaded) {
    ytApiLoaded = true;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      ytApiLoadingCallbacks.forEach(cb => cb());
      ytApiLoadingCallbacks = [];
    };
  }
};

const CustomVideoPlayer = ({ url, title }) => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const iframeContainerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const seekingRef = useRef(false);

  const [playerReady, setPlayerReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true); // start muted so autoplay works
  const [volume, setVolume] = useState(70);
  const [played, setPlayed] = useState(0);       // 0–1
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [buffered, setBuffered] = useState(0);   // 0–1
  const [seeking, setSeeking] = useState(false);
  const [qualityLevels, setQualityLevels] = useState([]);
  const [currentQuality, setCurrentQuality] = useState('default');
  const [showQuality, setShowQuality] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimer = useRef(null);

  const videoId = extractYouTubeId(url);

  // ── Init YouTube Player ───────────────────────────────────────────────────
  useEffect(() => {
    if (!videoId || !iframeContainerRef.current) return;

    // Give the div a unique ID
    const divId = `yt-player-${videoId}-${Date.now()}`;
    iframeContainerRef.current.id = divId;

    loadYtApi(() => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player(divId, {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,         // auto-start (muted allows it)
          mute: 1,             // MUST mute for autoplay to work in browsers
          controls: 0,         // hide native YouTube controls
          disablekb: 1,        // disable keyboard shortcuts
          fs: 0,               // disable fullscreen button
          rel: 0,              // no related videos
          modestbranding: 1,   // minimal YouTube branding
          iv_load_policy: 3,   // no video annotations
          playsinline: 1,      // play inline on iOS
          enablejsapi: 1,      // required for JS API
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            setPlayerReady(true);
            setDuration(event.target.getDuration());
            // Video started muted + autoplay — we set our state to reflect that
            setMuted(true);
            setPlaying(true);
            // Apply initial volume (won't be audible until user unmutes)
            event.target.setVolume(volume);
            // Load available quality levels
            try {
              const levels = event.target.getAvailableQualityLevels();
              if (levels && levels.length > 1) setQualityLevels(levels);
            } catch (_) {}
          },
          onStateChange: (event) => {
            const YT = window.YT;
            if (event.data === YT.PlayerState.PLAYING) {
              setPlaying(true);
              setDuration(event.target.getDuration());
              startProgressTracker();
            } else if (
              event.data === YT.PlayerState.PAUSED ||
              event.data === YT.PlayerState.ENDED
            ) {
              setPlaying(false);
              stopProgressTracker();
            } else if (event.data === YT.PlayerState.BUFFERING) {
              // keep playing state, just show loading if desired
            }
          },
          onError: (event) => {
            console.error('YouTube player error:', event.data);
          }
        }
      });
    });

    return () => {
      stopProgressTracker();
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }
      setPlayerReady(false);
      setPlaying(false);
      setPlayed(0);
      setCurrentTime(0);
      setDuration(0);
    };
  }, [videoId]);

  // ── Progress tracker ─────────────────────────────────────────────────────
  const startProgressTracker = useCallback(() => {
    stopProgressTracker();
    progressIntervalRef.current = setInterval(() => {
      if (!playerRef.current || seekingRef.current) return;
      try {
        const current = playerRef.current.getCurrentTime() || 0;
        const dur = playerRef.current.getDuration() || 0;
        const bufferedFrac = playerRef.current.getVideoLoadedFraction() || 0;
        setCurrentTime(current);
        setPlayed(dur > 0 ? current / dur : 0);
        setDuration(dur);
        setBuffered(bufferedFrac);
      } catch (_) {}
    }, 250);
  }, []);

  const stopProgressTracker = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // ── Controls ─────────────────────────────────────────────────────────────
  const togglePlay = () => {
    if (!playerRef.current || !playerReady) return;
    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (muted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
      setMuted(false);
    } else {
      playerRef.current.mute();
      setMuted(true);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (!playerRef.current) return;
    playerRef.current.setVolume(vol);
    if (vol === 0) {
      playerRef.current.mute();
      setMuted(true);
    } else {
      playerRef.current.unMute();
      setMuted(false);
    }
  };

  const handleSeekStart = () => { seekingRef.current = true; };
  const handleSeekChange = (e) => {
    setPlayed(Number(e.target.value));
    setCurrentTime(Number(e.target.value) * duration);
  };
  const handleSeekEnd = (e) => {
    seekingRef.current = false;
    const newTime = Number(e.target.value) * duration;
    if (playerRef.current) playerRef.current.seekTo(newTime, true);
  };

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const cycleSpeed = () => {
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (playerRef.current) playerRef.current.setPlaybackRate(nextSpeed);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Show/hide controls on mouse movement ────────────────────────────────
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    if (playing) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  };
  const handleMouseLeave = () => {
    if (playing) setShowControls(false);
  };

  // ── Block right-click ────────────────────────────────────────────────────
  useEffect(() => {
    const block = (e) => e.preventDefault();
    const el = containerRef.current;
    if (el) el.addEventListener('contextmenu', block);
    return () => { if (el) el.removeEventListener('contextmenu', block); };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: isFullscreen ? '0' : '56.25%',
        height: isFullscreen ? '100vh' : '0',
        background: '#000',
        borderRadius: isFullscreen ? '0' : '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        cursor: showControls ? 'default' : 'none',
        userSelect: 'none',
      }}
    >
      {/* YouTube IFrame renders here */}
      <div
        ref={iframeContainerRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />

      {/* Click overlay — sends play/pause to YT */}
      <div
        onClick={togglePlay}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          bottom: showControls ? '70px' : 0,
          zIndex: 10, cursor: 'pointer',
        }}
      />

      {/* ── Control Bar ── */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '0 1rem 0.6rem',
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)',
          zIndex: 20,
          transition: 'opacity 0.3s',
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        {/* ── Progress bar ── */}
        <div style={{ position: 'relative', height: '18px', display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          {/* Buffered track */}
          <div style={{
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
            width: '100%', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px'
          }}>
            <div style={{ width: `${buffered * 100}%`, height: '100%', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
          </div>
          {/* Played track */}
          <div style={{
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
            width: `${played * 100}%`, height: '4px', background: 'var(--teal-light, #00bcd4)', borderRadius: '2px',
            pointerEvents: 'none'
          }} />
          {/* Range input */}
          <input
            type="range" min={0} max={1} step={0.001} value={played}
            onMouseDown={handleSeekStart}
            onChange={handleSeekChange}
            onMouseUp={handleSeekEnd}
            onTouchStart={handleSeekStart}
            onTouchEnd={handleSeekEnd}
            style={{
              position: 'absolute', width: '100%', height: '18px',
              opacity: 0, cursor: 'pointer', margin: 0,
            }}
          />
        </div>

        {/* ── Buttons Row ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Play / Pause */}
            <button onClick={togglePlay} style={btnStyle}>
              {playing ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" />}
            </button>

            {/* Volume */}
            <button onClick={toggleMute} style={btnStyle}>
              {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range" min={0} max={100} step={1} value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              style={{ width: '80px', accentColor: 'var(--teal-light, #00bcd4)', cursor: 'pointer' }}
            />

            {/* Time */}
            <span style={{ color: 'white', fontSize: '0.85rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Muted hint */}
            {muted && playerReady && (
              <span
                onClick={toggleMute}
                style={{
                  color: '#ff9800', fontSize: '0.75rem', cursor: 'pointer',
                  border: '1px solid #ff9800', borderRadius: '4px', padding: '1px 6px'
                }}
              >
                🔇 Click to unmute
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
            {/* Quality selector */}
            {qualityLevels.length > 1 && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowQuality(q => !q)}
                  style={{ ...btnStyle, fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '4px', padding: '2px 8px' }}
                >
                  {currentQuality === 'default' ? 'Auto' : currentQuality.replace('hd', '').replace('large','480').replace('medium','360').replace('small','240') + 'p'}
                </button>
                {showQuality && (
                  <div style={{
                    position: 'absolute', bottom: '120%', right: 0,
                    background: 'rgba(0,0,0,0.92)', borderRadius: '6px',
                    padding: '0.4rem 0', minWidth: '100px', zIndex: 50,
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}>
                    {['auto', ...qualityLevels].map(q => (
                      <button key={q} onClick={() => {
                        const level = q === 'auto' ? 'default' : q;
                        if (playerRef.current) playerRef.current.setPlaybackQuality(level);
                        setCurrentQuality(q === 'auto' ? 'default' : q);
                        setShowQuality(false);
                      }} style={{
                        display: 'block', width: '100%', background: 'none',
                        border: 'none', color: (q === 'auto' ? currentQuality === 'default' : q === currentQuality) ? 'var(--teal-light, #00bcd4)' : 'white',
                        padding: '0.35rem 1rem', textAlign: 'left', cursor: 'pointer',
                        fontSize: '0.78rem', fontWeight: (q === 'auto' ? currentQuality === 'default' : q === currentQuality) ? 700 : 400
                      }}>
                        {q === 'auto' ? 'Auto' : q.replace('hd', '').replace('large','480').replace('medium','360').replace('small','240') + 'p'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Speed */}
            <button onClick={cycleSpeed} style={{ ...btnStyle, fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '4px', padding: '2px 8px' }}>
              {playbackRate}×
            </button>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} style={btnStyle}>
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Loading overlay while player initializes */}
      {!playerReady && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', zIndex: 30, background: '#000',
        }}>
          <div style={{
            width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.15)',
            borderTopColor: 'var(--teal-light, #00bcd4)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '1rem', fontSize: '0.9rem' }}>Loading secure stream…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      )}
    </div>
  );
};

const btnStyle = {
  background: 'none',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export default CustomVideoPlayer;
