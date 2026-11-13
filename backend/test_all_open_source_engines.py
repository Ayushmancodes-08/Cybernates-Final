import io
import math
import wave
import numpy as np
from PIL import Image, ImageChops
import cv2

def test_ela():
    # Create test image with a spliced high-contrast patch
    img = Image.new('RGB', (200, 200), color=(128, 128, 128))
    # Paste a patch
    for x in range(50, 100):
        for y in range(50, 100):
            img.putpixel((x, y), (255, 0, 0))
            
    buf = io.BytesIO()
    img.save(buf, 'JPEG', quality=90)
    buf.seek(0)
    recompressed = Image.open(buf)
    
    diff = ImageChops.difference(img, recompressed)
    diff_arr = np.array(diff)
    print("ELA Test - Max diff:", np.max(diff_arr), "Mean diff:", np.mean(diff_arr))
    assert np.max(diff_arr) > 0, "ELA difference should be non-zero"

def test_audio_fft():
    # Synthesize two audio signals:
    # 1. Natural sound with 12 kHz energy
    # 2. TTS sound cut off at 8 kHz
    sr = 44100
    t = np.linspace(0, 1.0, sr)
    
    # Authentic: 1 kHz + 10 kHz
    sig_real = np.sin(2 * np.pi * 1000 * t) + 0.3 * np.sin(2 * np.pi * 10000 * t)
    fft_real = np.abs(np.fft.rfft(sig_real))
    freqs = np.fft.rfftfreq(len(sig_real), 1.0 / sr)
    hi_real = np.sum(fft_real[freqs >= 8000]**2) / np.sum(fft_real**2)
    
    # Synthetic (vocoder cutoff at 8 kHz)
    sig_fake = np.sin(2 * np.pi * 1000 * t)
    fft_fake = np.abs(np.fft.rfft(sig_fake))
    hi_fake = np.sum(fft_fake[freqs >= 8000]**2) / np.sum(fft_fake**2)
    
    print("Audio FFT Test - Real high freq ratio:", hi_real, "Fake high freq ratio:", hi_fake)
    assert hi_real > hi_fake, "Real audio should have significantly higher high-frequency energy than vocoder cutoff"

if __name__ == '__main__':
    test_ela()
    test_audio_fft()
    print("All forensic unit tests passed successfully!")
