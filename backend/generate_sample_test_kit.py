"""
CyberGuard Sample Test Kit Generator
Generates ready-to-test authentic vs. malicious sample files for:
1. Audio Deepfake vs Authentic Human Voice (.wav)
2. Quishing / Fake QR Notice vs Clean Notice (.png)
3. Stealth SYN Port Scan vs Normal Web Traffic (.pcap)
4. Packed Suspicious Binary (.bin / .exe)
"""

import os
import wave
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cv2
from scapy.all import IP, TCP, DNS, DNSQR, wrpcap

OUT_DIR = r"a:\Cybernates\sample_test_files"
os.makedirs(OUT_DIR, exist_ok=True)

print("Generating CyberGuard Test Kit in:", OUT_DIR)

# =============================================================================
# 1. AUDIO TEST FILES (.WAV)
# =============================================================================
sr = 44100
duration = 4.0
t = np.linspace(0, duration, int(sr * duration), endpoint=False)

# File A: Synthetic Deepfake Voice (HiFi-GAN Vocoder Cutoff at 8,000 Hz)
# Monotonic pitch, speech formants only up to 3.5 kHz, zero energy above 8 kHz
f0 = 130.0  # Monotonic flat pitch
sig_fake = np.zeros_like(t)
for harm in [1, 2, 3, 4, 6, 8, 12, 16]:  # Harmonics up to ~2 kHz
    sig_fake += (1.0 / harm) * np.sin(2 * np.pi * (f0 * harm) * t)

# Add speech formant resonances
sig_fake += 0.4 * np.sin(2 * np.pi * 700 * t)   # F1
sig_fake += 0.3 * np.sin(2 * np.pi * 1800 * t)  # F2
sig_fake += 0.2 * np.sin(2 * np.pi * 2800 * t)  # F3

# Normalize and convert to 16-bit PCM
sig_fake = sig_fake / np.max(np.abs(sig_fake)) * 0.85
sig_fake_int16 = (sig_fake * 32767).astype(np.int16)

fake_wav_path = os.path.join(OUT_DIR, "1_audio_deepfake_urgent_call.wav")
with wave.open(fake_wav_path, "wb") as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(sr)
    wav.writeframes(sig_fake_int16.tobytes())
print(" -> Created:", fake_wav_path)

# File B: Authentic Human Voice (Harmonics extend naturally up to 14 kHz with vocal jitter)
jitter = 1.0 + 0.02 * np.sin(2 * np.pi * 5.0 * t)  # Natural physiological vocal tremor (5 Hz micro-jitter)
sig_real = np.zeros_like(t)
for harm in range(1, 40):  # Harmonics up to 5 kHz
    freq = (125.0 * harm) * jitter
    sig_real += (1.0 / (harm ** 0.8)) * np.sin(2 * np.pi * freq * t)

# Natural breath and high-frequency acoustic air friction (8 kHz - 14 kHz)
high_freq_air = 0.08 * np.sin(2 * np.pi * 10500 * t) + 0.05 * np.sin(2 * np.pi * 12800 * t)
noise = np.random.normal(0, 0.015, len(t))
sig_real = sig_real + high_freq_air + noise

sig_real = sig_real / np.max(np.abs(sig_real)) * 0.85
sig_real_int16 = (sig_real * 32767).astype(np.int16)

real_wav_path = os.path.join(OUT_DIR, "1_audio_authentic_human_speech.wav")
with wave.open(real_wav_path, "wb") as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(sr)
    wav.writeframes(sig_real_int16.tobytes())
print(" -> Created:", real_wav_path)


# =============================================================================
# 2. IMAGE & QUISHING TEST FILES (.PNG)
# =============================================================================
# File A: Quishing Notice Board with Embedded Fraudulent QR Code
img_w, img_h = 600, 750
img_qr = Image.new("RGB", (img_w, img_h), color=(250, 248, 242))
draw = ImageDraw.Draw(img_qr)

# Header banner
draw.rectangle([(0, 0), (img_w, 90)], fill=(224, 90, 27))
draw.text((25, 25), "OKCL ACADEMIC SCHOLARSHIP DIRECTIVE", fill=(255, 255, 255))
draw.text((25, 55), "URGENT PAYMENT CLEARANCE NOTICE - REF #OKCL-2026-X9", fill=(255, 230, 215))

# Notice text
body_text = (
    "ATTENTION ALL REGISTERED STUDENTS:\n\n"
    "Your State e-Governance scholarship grant of Rs. 25,000 has been sanctioned.\n"
    "To release verification tokens and unfreeze treasury disbursements, scan the QR\n"
    "code below using PhonePe / GooglePay before 4:00 PM today.\n\n"
    "MANDATORY FEE: Rs. 149 (Processing & Stamp Duty)"
)
draw.text((30, 115), body_text, fill=(35, 38, 42))

# Generate real QR code image using OpenCV
fake_qr_url = "https://okcl-scholarship.portal-claim.online/verify?vpa=okcl-admin@paytm&amt=149"
qr_detector = cv2.QRCodeEncoder.create()
# Use simple QR matrix generator or draw high-contrast QR pattern
# Let's generate a real valid QR code using an in-memory QR matrix via cv2 if supported or draw a sharp pattern
try:
    import qrcode
    qr = qrcode.QRCode(box_size=8, border=2)
    qr.add_data(fake_qr_url)
    qr.make(fit=True)
    qr_matrix_img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
except Exception:
    # Build sharp recognizable QR matrix box
    qr_matrix_img = Image.new("RGB", (260, 260), color=(255, 255, 255))
    qr_draw = ImageDraw.Draw(qr_matrix_img)
    # Target boxes
    for offset in [(20, 20), (180, 20), (20, 180)]:
        qr_draw.rectangle([offset, (offset[0] + 60, offset[1] + 60)], fill=(0, 0, 0))
        qr_draw.rectangle([(offset[0] + 10, offset[1] + 10), (offset[0] + 50, offset[1] + 50)], fill=(255, 255, 255))
        qr_draw.rectangle([(offset[0] + 20, offset[1] + 20), (offset[0] + 40, offset[1] + 40)], fill=(0, 0, 0))
    # Random synthetic modules
    np.random.seed(42)
    for i in range(10, 240, 12):
        for j in range(10, 240, 12):
            if np.random.rand() > 0.5:
                qr_draw.rectangle([(i, j), (i + 10, j + 10)], fill=(0, 0, 0))

# Paste QR into notice
img_qr.paste(qr_matrix_img, (170, 310))
draw.rectangle([(160, 300), (440, 580)], outline=(224, 90, 27), width=3)
draw.text((150, 595), "SCAN WITH ANY UPI APP TO COMPLETE KYC", fill=(180, 50, 15))

# Footer
draw.rectangle([(0, 690), (img_w, img_h)], fill=(235, 230, 220))
draw.text((25, 710), "Odisha Knowledge Corporation Limited • Official Academic Registry", fill=(80, 85, 90))

fake_notice_path = os.path.join(OUT_DIR, "2_quishing_scholarship_fake_notice.png")
img_qr.save(fake_notice_path)
print(" -> Created:", fake_notice_path)

# File B: Authentic Clean Image (No QR tampering)
clean_img = Image.new("RGB", (600, 600), color=(248, 247, 242))
clean_draw = ImageDraw.Draw(clean_img)
clean_draw.rectangle([(20, 20), (580, 580)], outline=(210, 205, 195), width=2)
clean_draw.text((50, 50), "OFFICIAL OKCL CITIZEN CHARTER 2026", fill=(20, 25, 30))
clean_draw.text((50, 90), "Policy document: Digital Literacy & Skills Directorate, Odisha.", fill=(70, 75, 80))
# Add subtle natural sensor noise
noise_arr = np.random.normal(0, 4.0, (600, 600, 3)).astype(np.int16)
clean_arr = np.array(clean_img).astype(np.int16) + noise_arr
clean_arr = np.clip(clean_arr, 0, 255).astype(np.uint8)
clean_final = Image.fromarray(clean_arr)

clean_notice_path = os.path.join(OUT_DIR, "2_authentic_citizen_charter.png")
clean_final.save(clean_notice_path)
print(" -> Created:", clean_notice_path)


# =============================================================================
# 3. NETWORK PCAP TEST FILES (.PCAP)
# =============================================================================
# File A: Stealth Reconnaissance Port Scan (TCP SYN Flood / Port Sweep)
attacker_ip = "185.220.101.42"
target_ip = "10.29.61.169"
scan_ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 1433, 1521, 3306, 3389, 5432, 5900, 8000, 8080, 8443, 9000, 9200, 27017]
scan_pkts = []
for i, port in enumerate(scan_ports * 2):
    pkt = IP(src=attacker_ip, dst=target_ip) / TCP(sport=49152 + i, dport=port, flags="S", seq=1000 + i)
    scan_pkts.append(pkt)

pcap_scan_path = os.path.join(OUT_DIR, "3_network_stealth_syn_recon_scan.pcap")
wrpcap(pcap_scan_path, scan_pkts)
print(" -> Created:", pcap_scan_path)

# File B: Normal Legitimate Web Traffic (Balanced Handshakes & DNS)
norm_pkts = []
client_ip = "192.168.1.104"
web_ip = "104.16.132.229"
# DNS query
norm_pkts.append(IP(src=client_ip, dst="1.1.1.1") / DNS(rd=1, qd=DNSQR(qname="okcl.org")))
# 3-way handshake to HTTPS 443
norm_pkts.append(IP(src=client_ip, dst=web_ip) / TCP(sport=51200, dport=443, flags="S", seq=100))
norm_pkts.append(IP(src=web_ip, dst=client_ip) / TCP(sport=443, dport=51200, flags="SA", seq=500, ack=101))
norm_pkts.append(IP(src=client_ip, dst=web_ip) / TCP(sport=51200, dport=443, flags="A", seq=101, ack=501))
# Data packet
norm_pkts.append(IP(src=client_ip, dst=web_ip) / TCP(sport=51200, dport=443, flags="PA", seq=101, ack=501) / b"GET /index.html HTTP/1.1\r\nHost: okcl.org\r\n\r\n")

pcap_normal_path = os.path.join(OUT_DIR, "3_network_normal_web_browsing.pcap")
wrpcap(pcap_normal_path, norm_pkts)
print(" -> Created:", pcap_normal_path)


# =============================================================================
# 4. STATIC MALWARE HIGH-ENTROPY PAYLOAD (.BIN / .EXE)
# =============================================================================
# High-entropy encrypted shellcode payload simulation (Entropy > 7.4)
np.random.seed(1337)
random_shellcode = np.random.bytes(8192)  # High entropy byte stream
malware_path = os.path.join(OUT_DIR, "4_malware_stager_packed_payload.bin")
with open(malware_path, "wb") as f:
    f.write(b"MZ\x90\x00\x03\x00\x00\x00")  # Simulated DOS stub
    f.write(random_shellcode)
print(" -> Created:", malware_path)

print("\n========================================================")
print("ALL SAMPLE TEST FILES SUCCESSFULLY GENERATED!")
print("Location:", OUT_DIR)
print("========================================================")

