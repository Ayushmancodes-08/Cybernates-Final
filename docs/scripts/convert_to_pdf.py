import os
import subprocess
import markdown

readme_path = r"a:\Cybernates\README.md"
html_path = r"a:\Cybernates\CYBERGUARD_README.html"
pdf_path = r"a:\Cybernates\CYBERGUARD_README.pdf"

with open(readme_path, "r", encoding="utf-8") as f:
    md_content = f.read()

# Convert markdown to html with table and fenced code support
html_body = markdown.markdown(
    md_content,
    extensions=["tables", "fenced_code", "toc"]
)

# Custom Enterprise Security Styling for PDF print
styled_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CYBERGUARD — Technical Architecture & Hackathon Demonstration</title>
<style>
  @page {{
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
    @bottom-right {{
      content: counter(page);
    }}
  }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    background: #ffffff;
    line-height: 1.6;
    font-size: 11pt;
  }}
  h1 {{
    color: #0f172a;
    font-size: 20pt;
    font-weight: 800;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 8px;
    margin-top: 0;
    margin-bottom: 12px;
  }}
  h2 {{
    color: #1e293b;
    font-size: 14pt;
    font-weight: 700;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
    margin-top: 24px;
    margin-bottom: 10px;
    page-break-after: avoid;
  }}
  h3 {{
    color: #334155;
    font-size: 12pt;
    font-weight: 600;
    margin-top: 16px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }}
  p, li {{
    color: #334155;
  }}
  blockquote {{
    border-left: 4px solid #3b82f6;
    background: #f8fafc;
    margin: 12px 0;
    padding: 10px 16px;
    border-radius: 0 8px 8px 0;
    color: #1e293b;
    font-size: 10.5pt;
  }}
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }}
  th, td {{
    border: 1px solid #cbd5e1;
    padding: 7px 10px;
    text-align: left;
  }}
  th {{
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
  }}
  tr:nth-child(even) {{
    background-color: #f8fafc;
  }}
  code {{
    font-family: "Consolas", "Courier New", monospace;
    background: #f1f5f9;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 9.5pt;
    color: #0284c7;
  }}
  pre {{
    background: #0f172a;
    color: #f8fafc;
    padding: 12px 16px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.45;
    margin: 12px 0;
    page-break-inside: avoid;
  }}
  pre code {{
    background: transparent;
    color: #f8fafc;
    padding: 0;
  }}
  a {{
    color: #2563eb;
    text-decoration: none;
  }}
  hr {{
    border: 0;
    border-top: 1px solid #e2e8f0;
    margin: 20px 0;
  }}
  .badge {{
    display: inline-block;
    padding: 2px 8px;
    background: #e0f2fe;
    color: #0369a1;
    border-radius: 4px;
    font-size: 8.5pt;
    font-weight: 600;
    margin-right: 4px;
  }}
</style>
</head>
<body>
{html_body}
</body>
</html>
"""

with open(html_path, "w", encoding="utf-8") as f:
    f.write(styled_html)

print("Saved HTML to:", html_path)

# Execute Edge headless to print to PDF
edge_cmd = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_path}",
    html_path
]

print("Converting HTML to PDF via Edge Headless...")
res = subprocess.run(edge_cmd, capture_output=True, text=True)

if os.path.exists(pdf_path):
    size_kb = os.path.getsize(pdf_path) / 1024
    print(f"SUCCESS: PDF created at {pdf_path} ({size_kb:.1f} KB)")
else:
    print("FAILED to create PDF. stderr:", res.stderr)
