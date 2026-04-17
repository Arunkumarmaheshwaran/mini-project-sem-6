from PIL import Image

def _bytes_to_bits(data: bytes) -> list[int]:
    """Convert bytes to a list of bits."""
    bits = []
    for byte in data:
        for i in range(7, -1, -1):
            bits.append((byte >> i) & 1)
    return bits

def _bits_to_bytes(bits: list[int]) -> bytes:
    """Convert a list of bits back to bytes."""
    out = bytearray()
    for i in range(0, len(bits), 8):
        byte = 0
        for j in range(8):
            bit = bits[i + j] if i + j < len(bits) else 0
            byte = (byte << 1) | bit
        out.append(byte)
    return bytes(out)

def _ones_complement(val: int) -> int:
    """Flip all bits in a byte."""
    return val ^ 0xFF

def encode_blocks(data: bytes, key: bytes) -> bytes:
    out = bytearray()
    for idx, block in enumerate(data, start=1):
        b = _ones_complement(block) if idx % 2 else block
        k = key[(idx - 1) % len(key)]
        out.append(b ^ k)
    return bytes(out)

def decode_blocks(encoded: bytes, key: bytes) -> bytes:
    out = bytearray()
    for idx, eb in enumerate(encoded, start=1):
        k = key[(idx - 1) % len(key)]
        b = eb ^ k
        b = _ones_complement(b) if idx % 2 else b
        out.append(b)
    return bytes(out)

def embed_data_into_image(data: bytes, cover_path: str, key: bytes, out_path: str, resize=None):
    length = len(data)
    prefixed = length.to_bytes(4, "big") + data
    encoded = encode_blocks(prefixed, key)
    bits = _bytes_to_bits(encoded)

    img = Image.open(cover_path).convert("L")
    if resize:
        img = img.resize(resize)

    pixels = list(img.getdata())
    if len(bits) > len(pixels):
        raise ValueError("Data too large for cover image")

    new_pixels = []
    bit_idx = 0
    for p in pixels:
        if bit_idx < len(bits):
            plsb = p & 1
            ebit = bits[bit_idx]
            v = ebit ^ plsb
            new_pixels.append((p + v) & 0xFF)
            bit_idx += 1
        else:
            new_pixels.append(p)

    stego = Image.new("L", img.size)
    stego.putdata(new_pixels)
    stego.save(out_path)
    return out_path

def extract_data_from_image(stego_path: str, key: bytes) -> bytes:
    """Extract embedded data from image LSBs."""
    img = Image.open(stego_path).convert("L")
    pixels = list(img.getdata())

    bits = [p & 1 for p in pixels]
    encoded = _bits_to_bytes(bits)

    if len(encoded) < 4:
        raise ValueError("Image does not contain enough data")

    # Decode first 4 bytes to get length
    decoded_first4 = decode_blocks(encoded[:4], key)
    length = int.from_bytes(decoded_first4, "big")

    total_bytes = 4 + length
    decoded = decode_blocks(encoded[:total_bytes], key)

    if len(decoded) < 4:
        raise ValueError("Decoded data too short")

    real_length = int.from_bytes(decoded[:4], "big")
    return decoded[4:4 + real_length]