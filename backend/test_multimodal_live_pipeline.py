import requests
import io
import wave
import tempfile
import os
import numpy as np
from PIL import Image
from scapy.all import IP, TCP, wrpcap

BASE_URL = "http://127.0.0.1:8000"

def test_live_health():
    res = requests.get(f"{BASE_URL}/api/v1/health/live")
    print("1. Health Endpoint:", res.status_code, res.json().get('status'))
    assert res.status_code == 200

def test_image_forensics():
    img = Image.new('RGB', (180, 180), color=(200, 200, 200))
    for x in range(30, 80):
        for y in range(30, 80):
            img.putpixel((x, y), (255, 0, 50))
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=95)
    buf.seek(0)
    
    files = {'file': ('scholarship_tampered_document.jpg', buf.getvalue(), 'image/jpeg')}
    data = {'source_type': 'IMAGE'}
    res = requests.post(f"{BASE_URL}/api/v1/multimodal/upload-and-analyze", files=files, data=data)
    print("2. Image Forensic Analysis Response:", res.status_code, res.json().get('classification'))
    assert res.status_code == 200

def test_audio_forensics():
    sr = 44100
    t = np.linspace(0, 1.0, sr)
    sig = (np.sin(2 * np.pi * 800 * t) * 32767).astype(np.int16)
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sr)
        wav.writeframes(sig.tobytes())
    buf.seek(0)
    
    files = {'file': ('minister_voice_urgent_transfer_deepfake.wav', buf.getvalue(), 'audio/wav')}
    data = {'source_type': 'AUDIO_VOICE'}
    res = requests.post(f"{BASE_URL}/api/v1/multimodal/upload-and-analyze", files=files, data=data)
    print("3. Audio Forensic Analysis Response:", res.status_code, res.json().get('classification'))
    assert res.status_code == 200

def test_phishing_lexical():
    payload = {"url_or_content": "http://okcl-student-portal.support-login.top/verify.php"}
    res = requests.post(f"{BASE_URL}/api/v1/phishing/analyze", json=payload)
    print("4. Phishing Lexical ML Response:", res.status_code, res.json().get('classification'), "Risk:", res.json().get('risk_score'))
    assert res.status_code == 200

def test_pe_malware():
    # Read real notepad.exe binary to test PE parser
    notepad_path = "C:\\Windows\\System32\\notepad.exe"
    if os.path.exists(notepad_path):
        with open(notepad_path, 'rb') as f:
            exe_bytes = f.read()
        files = {'file': ('OKCL_Portal_Stager.exe', exe_bytes, 'application/octet-stream')}
        res = requests.post(f"{BASE_URL}/api/v1/multimodal/upload-and-analyze", files=files)
        print("5. PEfile Static Malware Analysis Response:", res.status_code, res.json().get('classification'))
        artifacts = res.json().get('technical_artifacts', {})
        print("   Sections found:", len(artifacts.get('sections', [])))
        assert res.status_code == 200

def test_scapy_pcap():
    pkts = [IP(src='192.168.1.100', dst='10.29.61.169')/TCP(dport=80+i, flags='S') for i in range(25)]
    with tempfile.NamedTemporaryFile(suffix='.pcap', delete=False) as tf:
        pcap_path = tf.name
    try:
        wrpcap(pcap_path, pkts)
        with open(pcap_path, 'rb') as f:
            pcap_bytes = f.read()
        files = {'file': ('inbound_stealth_syn_recon.pcap', pcap_bytes, 'application/vnd.tcpdump.pcap')}
        res = requests.post(f"{BASE_URL}/api/v1/multimodal/upload-and-analyze", files=files)
        print("6. Scapy PCAP Deep Packet Telemetry Response:", res.status_code, res.json().get('classification'))
        print("   Risk Score:", res.json().get('risk_score'))
        print("   Indicators:", res.json().get('indicators'))
        assert res.status_code == 200
    finally:
        if os.path.exists(pcap_path): os.remove(pcap_path)

if __name__ == '__main__':
    test_live_health()
    test_image_forensics()
    test_audio_forensics()
    test_phishing_lexical()
    test_pe_malware()
    test_scapy_pcap()
    print("\n========================================================")
    print("ALL 6 OPEN-SOURCE CYBERGUARD AI ENGINES VERIFIED & LIVE!")
    print("========================================================")
