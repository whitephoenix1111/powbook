# Feature Design: Audio Player

## Purpose & Scope

AudioPlayer là component audio playback cố định ở bottom của shell layout, cho phép user nghe audiobook mà **không bị gián đoạn khi navigate** giữa các pages. Nó render 1 lần duy nhất trong `app/(main)/layout.tsx` và giao tiếp với toàn bộ app thông qua `audioStore`.

**Scope:**
- Play / Pause / Skip ±10s / Seek / Playback speed
- Hiển thị book cover + title + author + narrator
- Progress bar click-to-seek
- Dismiss (dừng audio + ẩn player)
- **Ngoài scope:** queue, playlist, volume control, equalizer

---

## State Architecture

**Store:** `lib/store/audioStore.ts` (Zustand, không persist)

```typescript
interface AudioState {
  currentBook:  Book | null       // sách đang phát
  audioUrl:     string | null     // MP3 URL
  isPlaying:    boolean
  currentTime:  number            // seconds (sync từ DOM)
  duration:     number            // seconds (từ onLoadedMetadata)
  playbackRate: number            // 1 | 1.25 | 1.5 | 2
  audioRef:     HTMLAudioElement | null  // DOM element ref lưu trong store

  // Actions
  setBook(book, audioUrl)   // load sách mới → reset time, set isPlaying=true
  dismiss()                 // pause + clear state
  togglePlay()
  seek(time)                // audioRef.currentTime = time
  skipForward(seconds=10)
  skipBackward(seconds=10)
  setPlaybackRate(rate)
  setAudioRef(el)           // được gọi bởi callback ref
  setCurrentTime(time)      // được gọi bởi onTimeUpdate
  setDuration(duration)     // được gọi bởi onLoadedMetadata
}
```

**Tại sao lưu `audioRef` trong store?**
Vì nhiều nơi trong app (BookSidePanel, page.tsx) có thể trigger `setBook()` — chúng không có access trực tiếp đến DOM element. Store làm bridge giữa logic và DOM.

---

## Component Breakdown

```
AudioPlayer                    ← render null nếu !currentBook || !audioUrl
│
├── <audio>                    ← ẩn, điều khiển bằng ref
│   ref={audioCallbackRef}     ← callback ref, set audioStore.audioRef
│   src={audioUrl}
│   onTimeUpdate → setCurrentTime
│   onLoadedMetadata → setDuration + restore playbackRate
│   onEnded → pause()
│
├── Cover + Info (w-[220px])
│   ├── book.cover (40×40, ring-1)
│   ├── book.title (line-clamp-1)
│   └── book.author · book.narrator
│
├── Controls (center)
│   ├── Rate button (1x / 1.25x / 1.5x / 2x — cycle)
│   ├── SkipBackward 10s (RotateCcw icon + "10" label)
│   ├── Play/Pause button (brand color, 36px circle)
│   ├── SkipForward 10s (RotateCw icon + "10" label)
│   └── SkipNext (chưa implement — disabled-ish)
│
├── Progress + Time (flex-1)
│   ├── currentTime (formatTime)
│   ├── Click-to-seek progress bar
│   │   └── Thumb indicator (opacity-0 → opacity-100 on hover)
│   └── duration (formatTime)
│
├── Queue button (ListMusic — chưa implement)
│
└── Dismiss button (X — pause + clear state)
```

---

## Interaction Workflow

### Load sách mới
```
User click [Play] / [Play Sample → full] trong BookSidePanel
  → audioStore.setBook(book, book.audioUrl)
     → { currentBook: book, audioUrl, isPlaying: true, currentTime: 0 }
  → AudioPlayer re-render (không null nữa)
  → useEffect [audioUrl]:
       el.load()                    ← reset element
       playPromiseRef = el.play()   ← bắt đầu phát
       → onLoadedMetadata: setDuration, restore playbackRate
```

### Toggle Play/Pause
```
User click Play/Pause button
  → togglePlay() → isPlaying = !isPlaying
  → useEffect [isPlaying]:
       isPlaying=true:  playPromiseRef = el.play()
       isPlaying=false: playPromiseRef.then(() => el.pause())
```

### Seek (click progress bar)
```
User click trên progress bar
  → onClick: ratio = (clientX - rect.left) / rect.width
  → seek(ratio × duration)
     → audioRef.currentTime = time
     → setCurrentTime(time)
```

### Playback Speed
```
User click rate button
  → nextRate(): RATES[(currentIdx + 1) % 4]
     RATES = [1, 1.25, 1.5, 2]
  → setPlaybackRate(rate)
     → audioRef.playbackRate = rate
     → store.playbackRate = rate (persist across remount)
```

---

## Edge Cases

| Tình huống | Xử lý |
|---|---|
| `el.play()` bị browser block (autoplay policy) | `.catch(() => pause())` — sync store về isPlaying=false |
| User đổi sách trong khi play() chưa resolve | `cancelled = true` flag trong cleanup; nếu promise resolve sau → `el.pause()` ngay |
| `pause()` gọi trước `play()` resolve | `playPromiseRef.then(() => el.pause())` — đợi promise xong rồi mới pause |
| Element remount (hot reload) | `audioRef` được restore qua callback ref; `playbackRate` restore qua `onLoadedMetadata` |
| `skipForward` vượt quá duration | `Math.min(currentTime + 10, duration || 0)` |
| `skipBackward` xuống dưới 0 | `Math.max(currentTime - 10, 0)` |
| Audio ended | `onEnded` → `pause()` — isPlaying=false, player vẫn hiện |

---

## Key Implementation Notes

**1. Callback ref vs useRef:**
```typescript
// ĐÚNG — callback ref đảm bảo audioRef set trước bất kỳ useEffect nào
const audioCallbackRef = useCallback((el: HTMLAudioElement | null) => {
  setAudioRef(el);
}, [setAudioRef]);

// SAI — useRef + useEffect có timing window
const ref = useRef<HTMLAudioElement>(null);
useEffect(() => { store.setAudioRef(ref.current); }, []);
```

**2. Tách biệt 2 useEffect:**
- `useEffect([audioUrl])` — load track mới, trigger play
- `useEffect([isPlaying])` — sync state → DOM (play/pause)
- Nếu gộp thành 1, `isPlaying` changes sẽ re-trigger load và gây vòng lặp

**3. `formatTime` helper:**
```typescript
// Xuất khẩu từ audioStore.ts để dùng ở cả AudioPlayer lẫn nơi khác
export function formatTime(seconds: number): string {
  // → "m:ss" nếu < 1 giờ
  // → "h:mm:ss" nếu ≥ 1 giờ
}
```

**4. BookSidePanel sample vs main player:**
BookSidePanel có `audioRef` riêng (local `useRef`) để play 30s sample — độc lập với `audioStore`. Khi user click [Play] (full), sample bị pause và `setBook()` được gọi để chuyển sang main player.
