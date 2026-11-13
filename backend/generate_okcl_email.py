"""
Generate OKCL Phishing Email Asset and Malicious Quishing QR Code.
Produces:
1. sample_test_files/okcl_quishing_qr.png (Standalone high-res QR)
2. sample_test_files/okcl_phishing_email.html (Interactive browser email with embedded base64 QR)
3. sample_test_files/okcl_phishing_email.png (Full graphical email snapshot for image upload testing)
4. sample_test_files/okcl_phishing_email.eml (Standard RFC-822 email format)
"""

import os
import io
import base64
import qrcode
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = r"a:\Cybernates\sample_test_files"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. Generate standalone high-res QR Code
qr_target_url = "https://okcl-verification-portal.digital-kyc-auth.in/verify?candidate_id=OKCL-2026-94812"
qr = qrcode.QRCode(
    version=2,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)
qr.add_data(qr_target_url)
qr.make(fit=True)
qr_img = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF").convert("RGB")
qr_path = os.path.join(OUTPUT_DIR, "okcl_quishing_qr.png")
qr_img.save(qr_path)
print("[+] Generated Standalone OKCL Quishing QR:", qr_path)

# Convert QR to base64 for HTML embedding
with open(qr_path, "rb") as f:
    qr_b64 = base64.b64encode(f.read()).decode("utf-8")

# 2. Generate OKCL Phishing Email HTML
html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OKCL Official Notice: Mandatory e-Certificate Re-Verification</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f1f5f9;
      margin: 0;
      padding: 30px 16px;
      color: #1e293b;
    }}
    .email-container {{
      max-width: 640px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06);
      overflow: hidden;
    }}
    .email-header {{
      background: linear-gradient(135deg, #1e3a8a, #0369a1);
      color: #ffffff;
      padding: 24px 30px;
      border-bottom: 4px solid #f97316;
    }}
    .email-header h1 {{
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }}
    .email-header p {{
      margin: 4px 0 0;
      font-size: 12px;
      color: #bae6fd;
      font-family: monospace;
    }}
    .badge {{
      background: #f97316;
      color: #fff;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
    }}
    .email-body {{
      padding: 30px;
      font-size: 14px;
      line-height: 1.6;
    }}
    .urgent-banner {{
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 14px 18px;
      border-radius: 8px;
      margin-bottom: 20px;
      color: #991b1b;
      font-size: 13px;
      font-weight: 600;
    }}
    .meta-table {{
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 12px;
      background: #f8fafc;
      border-radius: 8px;
    }}
    .meta-table td {{
      padding: 8px 12px;
      border-bottom: 1px solid #e2e8f0;
    }}
    .meta-table td:first-child {{
      font-weight: 700;
      color: #64748b;
      width: 140px;
    }}
    .qr-card {{
      text-align: center;
      background: #f8fafc;
      border: 2px dashed #0284c7;
      border-radius: 16px;
      padding: 24px;
      margin: 24px 0;
    }}
    .qr-card img {{
      width: 200px;
      height: 200px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      background: #ffffff;
      padding: 8px;
    }}
    .qr-card .caption {{
      font-size: 13px;
      font-weight: 700;
      color: #0369a1;
      margin-top: 12px;
    }}
    .qr-card .sub-caption {{
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
      margin-top: 4px;
    }}
    .cta-btn {{
      display: inline-block;
      background: #f97316;
      color: #ffffff;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 10px;
      margin-top: 16px;
    }}
    .footer {{
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 20px 30px;
      font-size: 11px;
      color: #64748b;
      text-align: center;
    }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1>ODISHA KNOWLEDGE CORPORATION LIMITED</h1>
          <p>Government of Odisha Joint Initiative | Examination & Certification Directorate</p>
        </div>
        <span class="badge">OFFICIAL NOTICE</span>
      </div>
    </div>
    <div class="email-body">
      <div class="urgent-banner">
        WARNING: Mandatory Certificate Retention Action Required (Ref: OKCL/2026/SEC-94812)
      </div>
      
      <table class="meta-table">
        <tr><td>Notice ID:</td><td>OKCL/EXAM/2026/MANDATE-94812</td></tr>
        <tr><td>Candidate:</td><td>Registered OS-CIT Scholar</td></tr>
        <tr><td>Issuing Node:</td><td>Controller of Examinations, OKCL Bhubaneswar</td></tr>
        <tr><td>Resolution Time:</td><td><strong style="color: #dc2626;">Within 24 Hours (Before 11:59 PM IST)</strong></td></tr>
      </table>

      <p>Dear Candidate,</p>
      <p>As per the revised State Educational Security Notification (Ref: 2026/ED-441), all awarded credentials for <strong>OS-CIT (Odisha State Certificate in Information Technology)</strong> must undergo mandatory Aadhaar-linked digital signature validation.</p>
      
      <p>Failure to complete biometric re-verification will result in temporary suspension of certificate validity across State Public Service Commission (OPSC/OSSC) and university admission registries.</p>

      <div class="qr-card">
        <img src="data:image/png;base64,{qr_b64}" alt="OKCL Fast-Track Verification QR Code" />
        <div class="caption">SCAN TO COMPLETE E-KYC WITH PHONE CAMERA / GOOGLE LENS</div>
        <div class="sub-caption">Destination: okcl-verification-portal.digital-kyc-auth.in</div>
        <br/>
        <a href="{qr_target_url}" target="_blank" class="cta-btn">Scan or Tap to Authenticate Now</a>
      </div>

      <p style="font-size: 12px; color: #64748b;">
        <strong>Important Security Notice:</strong> Never share your 6-digit Aadhaar OTP. OKCL Helpdesk will never ask for your internet banking credentials or UPI PIN.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0; font-weight: 600;">(c) 2026 Odisha Knowledge Corporation Limited (OKCL). All rights reserved.</p>
      <p style="margin: 4px 0 0;">Plot No. 108/3607, Jayadev Vihar, Bhubaneswar, Odisha 751013 | verification@okcl-support-portal.in</p>
    </div>
  </div>
</body>
</html>
"""

html_path = os.path.join(OUTPUT_DIR, "okcl_phishing_email.html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)
print("[+] Generated OKCL Phishing Email HTML:", html_path)

# 3. Generate standard RFC-822 EML file
eml_content = f"""From: "OKCL Verification Directorate" <verification@okcl-support-portal.in>
To: candidate.odisha@gov.in
Subject: URGENT: OKCL e-Certificate & OS-CIT Examination Verification Mandatory (Ref: OKCL/2026/SEC-94812)
Date: Sun, 08 Nov 2026 14:00:00 +0530
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

{html_content}
"""
eml_path = os.path.join(OUTPUT_DIR, "okcl_phishing_email.eml")
with open(eml_path, "w", encoding="utf-8") as f:
    f.write(eml_content)
print("[+] Generated OKCL Phishing Email EML:", eml_path)

# 4. Generate Graphical PNG Image representation of the email
# (Useful for uploading directly to Image & Quishing tab in Multi-Modal Lab)
img_w, img_h = 750, 950
email_img = Image.new("RGB", (img_w, img_h), color="#F8FAFC")
draw = ImageDraw.Draw(email_img)

# Header banner
draw.rectangle([(0, 0), (img_w, 100)], fill="#1E3A8A")
draw.rectangle([(0, 96), (img_w, 100)], fill="#F97316")

# Draw Header Text
draw.text((30, 25), "ODISHA KNOWLEDGE CORPORATION LIMITED", fill="#FFFFFF")
draw.text((30, 55), "Official Verification & Certificate Authentication Notice (Ref: OKCL/2026/94812)", fill="#BAE6FD")

# Urgent warning box
draw.rectangle([(30, 120), (img_w - 30, 170)], fill="#FEF2F2", outline="#EF4444", width=2)
draw.text((45, 135), "[CRITICAL NOTICE] OS-CIT Certificate Invalidation Notice (Action within 24h Required)", fill="#991B1B")

# Meta table
draw.rectangle([(30, 190), (img_w - 30, 270)], fill="#FFFFFF", outline="#CBD5E1", width=1)
draw.text((45, 205), "Notice Ref: OKCL/EXAM/2026/MANDATE-94812", fill="#334155")
draw.text((45, 225), "Issuing Node: Office of Controller of Examinations, OKCL Bhubaneswar", fill="#334155")
draw.text((45, 245), "Deadline: TODAY BEFORE 11:59 PM IST (Mandatory Aadhaar Re-validation)", fill="#DC2626")

# Body paragraph
draw.text((30, 290), "Dear Candidate,", fill="#1E293B")
draw.text((30, 315), "Under Notification ED-OKCL/2026/441, all registered holders of OS-CIT credentials", fill="#334155")
draw.text((30, 335), "must re-authenticate digital biometric linkage to avoid credential revocation.", fill="#334155")

# QR Box card
draw.rectangle([(175, 380), (img_w - 175, 740)], fill="#FFFFFF", outline="#0284C7", width=2)
# Paste QR code centered
resized_qr = qr_img.resize((240, 240))
email_img.paste(resized_qr, ((img_w - 240) // 2, 410))

draw.text((210, 665), "SCAN WITH SMARTPHONE CAMERA / GOOGLE LENS", fill="#0369A1")
draw.text((220, 690), "URL: okcl-verification-portal.digital-kyc-auth.in", fill="#64748B")

# Footer
draw.rectangle([(0, img_h - 70), (img_w, img_h)], fill="#0F172A")
draw.text((30, img_h - 50), "(c) 2026 Odisha Knowledge Corporation Limited (OKCL) | Anti-Fraud Monitoring", fill="#94A3B8")

email_img_path = os.path.join(OUTPUT_DIR, "okcl_phishing_email.png")
email_img.save(email_img_path)
print("[+] Generated Rendered OKCL Phishing Email Image:", email_img_path)

