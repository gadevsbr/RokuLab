from pathlib import Path

from PIL import Image


root = Path(__file__).resolve().parent.parent
frames_dir = root / "docs" / "assets" / "community-preview-frames"
output = root / "docs" / "assets" / "rokulab-community-preview.gif"
paths = sorted(frames_dir.glob("*.png"))
if len(paths) < 2:
    raise RuntimeError("At least two PNG frames are required")

frames = []
for path in paths:
    with Image.open(path) as source:
        width = 1100
        height = round(source.height * width / source.width)
        resized = source.convert("RGB").resize((width, height), Image.Resampling.LANCZOS)
        frames.append(resized.quantize(colors=192, method=Image.Quantize.MEDIANCUT))

frames[0].save(
    output,
    save_all=True,
    append_images=frames[1:],
    duration=[1400, 700, 700, 1600],
    loop=0,
    optimize=True,
    disposal=2,
)
