import fitz  # PyMuPDF, to read and render PDF
import io
from PIL import Image  # Pillow to handle image objects
import pytesseract  # OCR engine to extract text from images


def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = []

    for page in doc:
        text = page.get_text().strip()
        if text:
            full_text.append(text)
        else:
            # fallback to OCR
            pix = page.get_pixmap(dpi=300)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            ocr_text = pytesseract.image_to_string(img)
            full_text.append(ocr_text)

    return "\n\n".join(full_text)