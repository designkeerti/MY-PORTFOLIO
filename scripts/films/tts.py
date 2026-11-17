"""Narration for a case-study film.

Reads a JSON list of lines on stdin, writes b{i}.mp3 and b{i}.json (sentence marks, in
seconds) into the directory given as argv[1]. Uses Microsoft's neural voices through the
edge-tts package; set FILM_VOICE to change the voice, FILM_RATE to change the pace.
"""
import asyncio, json, os, sys
import edge_tts

VOICE = os.environ.get('FILM_VOICE', 'en-US-AndrewMultilingualNeural')
RATE = os.environ.get('FILM_RATE', '+0%')
PROXY = os.environ.get('HTTPS_PROXY') or None


async def one(i, text, out):
    mp3 = os.path.join(out, f'b{i}.mp3')
    key = os.path.join(out, f'b{i}.txt')
    sig = f'{VOICE}|{RATE}|{text}'
    if os.path.exists(key) and open(key).read() == sig and os.path.exists(mp3):
        return  # already made, unchanged
    marks = []
    for attempt in range(4):
        try:
            com = edge_tts.Communicate(text, VOICE, rate=RATE, proxy=PROXY, boundary='SentenceBoundary')
            marks = []
            with open(mp3, 'wb') as f:
                async for chunk in com.stream():
                    if chunk['type'] == 'audio':
                        f.write(chunk['data'])
                    elif chunk['type'] == 'SentenceBoundary':
                        marks.append({'t': chunk['offset'] / 1e7, 'd': chunk['duration'] / 1e7, 'text': chunk['text']})
            break
        except Exception as e:  # the service drops connections now and then
            if attempt == 3:
                raise
            await asyncio.sleep(2 * (attempt + 1))
    with open(os.path.join(out, f'b{i}.json'), 'w') as f:
        json.dump(marks, f)
    with open(key, 'w') as f:
        f.write(sig)


async def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    lines = json.load(sys.stdin)
    for i, text in enumerate(lines):
        await one(i, text, out)
        print(f'  voice {i + 1}/{len(lines)}', flush=True)


asyncio.run(main())
