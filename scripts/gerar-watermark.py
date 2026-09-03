"""
Deriva a marca d'agua da pagina a partir do lockup vertical ja publicado em
`public/brand/logo-vertical.png`.

Mesmo tratamento que `public/brand/watermark-arvore.png` ja tinha (silhueta
verde-escura em baixo alfa, pronta para background-repeat), so que aplicado
ao lockup vertical inteiro (arvore + "PRIORIZE" + assinatura), nao so a
arvore. Gera um tile pequeno de proposito: e para repetir em mosaico atras do
conteudo, nao para aparecer como um carimbo unico.

Rodar de novo sempre que o logo-vertical.png for atualizado.
"""

from pathlib import Path

from PIL import Image

BRAND = Path(__file__).resolve().parent.parent / "public" / "brand"
FONTE = BRAND / "logo-vertical.png"
DESTINO = BRAND / "watermark-vertical.png"

# mesmo tom e alfa medidos em watermark-arvore.png, para as duas marcas
# d'agua conviverem sem destoar caso um dia apareçam na mesma pagina
COR = (20, 36, 10)
ALFA = 31

LARGURA_LOGO = 130  # tamanho da logo em si, sem a margem
MARGEM = 200  # espaco transparente ao redor, o que separa uma repeticao da outra


def recorte_justo(img: Image.Image) -> Image.Image:
    caixa = img.getchannel("A").getbbox()
    return img.crop(caixa) if caixa else img


def main() -> None:
    if not FONTE.exists():
        raise SystemExit(f"fonte nao encontrada: {FONTE}")

    logo = recorte_justo(Image.open(FONTE).convert("RGBA"))

    altura_logo = round(LARGURA_LOGO * logo.size[1] / logo.size[0])
    logo = logo.resize((LARGURA_LOGO, altura_logo), Image.LANCZOS)

    silhueta = Image.new("RGBA", logo.size, (0, 0, 0, 0))
    alfa_original = logo.getchannel("A").point(lambda a: round(a * ALFA / 255))
    pintura = Image.new("RGBA", logo.size, (*COR, 0))
    pintura.putalpha(alfa_original)
    silhueta.alpha_composite(pintura)

    # a margem e o que da o espacamento entre repeticoes no background-repeat:
    # sem ela, cada tile encosta no vizinho porque a logo ja vem recortada rente
    tile = Image.new("RGBA", (logo.size[0] + MARGEM, logo.size[1] + MARGEM), (0, 0, 0, 0))
    tile.alpha_composite(silhueta, (MARGEM // 2, MARGEM // 2))

    tile.save(DESTINO, optimize=True)
    print(f"{DESTINO.name} {tile.size[0]}x{tile.size[1]} {DESTINO.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
