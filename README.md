# PinkStudyGame

Sparkle-powered study sessions with a fresh flashcard generator.

## Quick Start

1. Open `index.html` in your favourite browser.
2. On the welcome screen, enter a name (or leave it as Emilija), type the passcode **differentdimension** (or paste your own OpenAI API key if you prefer), optionally tick **Remember this code**, and hit **Enter the Lounge**.
3. Inside the **Sparkle Study Studio**, use the notepad, sticky board, and flashcard mixer to craft the perfect vibe. Need to tweak your details later? Tap **Back to Setup** anytime.

## Sparkle Study Studio Corners

- **Pink PDF Flashcard Mixer** – drop in a PDF, and we’ll use the name + key from the welcome screen to spin up a flip-to-reveal deck.
- **Glam To-Do Notepad** – jot quick study tasks, check them off, and pin the essential ones.
- **Pinned Pastel Board** – pinned notes appear as animated pastel stickies; tap the pin to watch them drift away with a cute chime.

### What you need

- The built-in passcode `differentdimension` (works with the bundled Raspberry Pi proxy).
- An OpenAI API key with access to `gpt-4.1-mini` if you want to call OpenAI directly or configure the proxy with your own model.
- An internet connection so the page can load the `pdf.js` helper from the CDN and reach your Pi proxy / OpenAI.
- A text-based PDF under 8&nbsp;MB (scanned images without selectable text will not extract well).

### How to use the mixer

1. Inside the studio, find the "Pink PDF Flashcard Mixer" card.
2. Choose a PDF with the file picker.
3. Press **Conjure Flashcards**. The lounge extracts text, sends it to the API, and displays a cute flip-card widget.
4. Click or tap the flashcard to flip between prompt and answer, and use the pink navigation pills to move through the deck.

If something goes wrong the status line under the button will explain whether the PDF could not be read or the API request failed.

### Security notes

- Keys are never transmitted anywhere except to your Raspberry Pi proxy (or directly to `api.openai.com` if you choose to enter the key in the browser).
- Choosing not to tick **Remember this code** means nothing is stored; otherwise the passcode or key is saved under `pinkStudy.credential` in `localStorage` for reuse.

## Tweaks

- Edit flashcard prompts and limits inside `script.js` (`MAX_PDF_CHARACTERS`, `FLASHCARD_MODEL`, etc.).
- Tweak sticky palettes or note animations in `script.js` (`STICKY_PALETTES`) and `style.css` under the `sticky-` class names.
- Styling for the mixer lives in `style.css` under the `flashcard-` class names.
