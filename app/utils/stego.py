from PIL import Image
def encode_image(input_image, output_image, secret):
    key = b"secret"

    data = secret.encode()
    length = len(data)
    data = length.to_bytes(4, "big") + data
    encoded = bytearray()
    for i, b in enumerate(data):
        k = key[i % len(key)]
        val = b ^ k
        if i % 2 == 0:
            val = val ^ 0xFF
        encoded.append(val)
    bits = []
    for byte in encoded:
        for i in range(7, -1, -1):
            bits.append((byte >> i) & 1)

    img = Image.open(input_image).convert("L")
    pixels = list(img.getdata())

    if len(bits) > len(pixels):
        raise ValueError("Image too small")

    new_pixels = []
    idx = 0

    for p in pixels:
        if idx < len(bits):
            new_pixels.append((p & ~1) | bits[idx])
            idx += 1
        else:
            new_pixels.append(p)

    img.putdata(new_pixels)
    img.save(output_image)



def extract_data_from_image(image_path, key=b"secret"):
    img = Image.open(image_path).convert("L")
    pixels = list(img.getdata())

    bits = [p & 1 for p in pixels]

    data_bytes = bytearray()
    for i in range(0, len(bits), 8):
        byte = 0
        for j in range(8):
            if i + j < len(bits):
                byte = (byte << 1) | bits[i + j]
        data_bytes.append(byte)

    decoded = bytearray()
    for i, b in enumerate(data_bytes):
        k = key[i % len(key)]
        val = b ^ k
        if i % 2 == 0:
            val = val ^ 0xFF
        decoded.append(val)
    length = int.from_bytes(decoded[:4], "big")
    return decoded[4:4 + length]