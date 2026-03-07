"""
download_cricsheet_data.py — Download Cricsheet T20 International ball-by-ball CSV data.

Downloads from https://cricsheet.org/downloads/ and extracts into data/raw_matches/.
"""

import os
import sys
import zipfile
import urllib.request
import shutil

# Cricsheet T20I CSV download URL (Ashwin format)
CRICSHEET_T20I_URL = "https://cricsheet.org/downloads/t20s_csv2.zip"

def download_and_extract(url: str, output_dir: str):
    """Download a zip file and extract CSVs to the output directory."""

    os.makedirs(output_dir, exist_ok=True)

    zip_path = os.path.join(output_dir, "_download.zip")

    print(f"Downloading from {url} ...")
    print("(This may take a minute — the file is ~30-50 MB)")

    try:
        urllib.request.urlretrieve(url, zip_path)
    except Exception as e:
        print(f"ERROR: Download failed: {e}")
        print("\nIf the download fails, you can manually download from:")
        print(f"  {url}")
        print(f"Then extract the contents into: {output_dir}")
        sys.exit(1)

    print(f"Downloaded to {zip_path}")

    # Extract
    print("Extracting CSV files...")
    csv_count = 0
    with zipfile.ZipFile(zip_path, "r") as zf:
        for member in zf.namelist():
            if member.endswith(".csv"):
                # Extract flat (no subdirectories)
                filename = os.path.basename(member)
                if filename:
                    target = os.path.join(output_dir, filename)
                    with zf.open(member) as src, open(target, "wb") as dst:
                        shutil.copyfileobj(src, dst)
                    csv_count += 1

    # Clean up zip
    os.remove(zip_path)

    print(f"\nDone! Extracted {csv_count} CSV files to {output_dir}")


if __name__ == "__main__":
    project_root = os.path.join(os.path.dirname(__file__), "..")
    output_dir = os.path.join(project_root, "data", "raw_matches")
    output_dir = os.path.normpath(output_dir)

    if os.listdir(output_dir) if os.path.exists(output_dir) else False:
        print(f"Data directory already has files: {output_dir}")
        resp = input("Overwrite? (y/n): ").strip().lower()
        if resp != "y":
            print("Aborted.")
            sys.exit(0)
        shutil.rmtree(output_dir)

    download_and_extract(CRICSHEET_T20I_URL, output_dir)
