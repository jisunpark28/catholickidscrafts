"""The daily Advent activity sheets (one per Instagram "Try this" tip) and the
Advent candle craft. Each entry draws one US Letter page.

Wording comes from the live Advent Q&A cards (question, short answer, Try this).
No ages, no violent imagery.
"""
from __future__ import annotations

import math

from reportlab.lib.colors import white

from kit import (
    BLUE, BROWN, CREAM, DARK_GREEN, DEEP_VIOLET, FLAME, GOLD, GREEN, GREY, H, INK, MUTED, NIGHT, RED, ROSE, SAFE,
    SKY, STRAW, STROKE, VIOLET, W, ark, book, candle, check_box, cloud, crown, cut_circle, cut_line, cut_rect,
    dotted, ellipse, ellipse_rot, fill, flame, flower, footer, frame, gift, group, header, heart, house, ink,
    key_shape, ladder, leaf, manger, mitre, moon, para, poly, rose, scissors, scroll, smiley, sparkle, sprinkle,
    star, steps, stump, sun, text, write_line,
)

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
L, R = SAFE, W - SAFE


def bg(c):
    c.setFillColor(white)
    c.rect(0, 0, W, H, fill=1, stroke=0)


def day_row(c, y, colored, shape="star", color=GOLD, labels=DAYS, title=None, r=19):
    """A row of 7 things to colour, one per day."""
    with group(c, title or "Day tracker"):
        gap = (R - L) / len(labels)
        for i, d in enumerate(labels):
            cx = L + gap * (i + 0.5)
            if shape == "star":
                star(c, cx, y, r, colored, color)
            elif shape == "heart":
                heart(c, cx, y + 2, r * 0.95, colored, color)
            elif shape == "smile":
                smiley(c, cx, y, r * 0.9, colored, color)
            elif shape == "stone":
                ellipse(c, cx, y, r * 1.15, r * 0.7, colored, color, 1.8)
            text(c, cx, y - r - 14, d, "Baloo-Bold", 10.5, INK, "center")


# 1 ---------------------------------------------------------------------------
def jesse_ornaments(c, colored):
    bg(c)
    y = header(c, "Jesse Tree Ornaments", "Who was waiting for Jesus?",
               "God's people waited a very long time for the Saviour. God sent prophets like Isaiah to promise that he would come.")
    items = [
        ("Jesse", "the root of the family", stump),
        ("Noah", "God keeps his promise", ark),
        ("Abraham", "stars in the sky", None),
        ("Jacob", "a ladder to heaven", ladder),
        ("King David", "Jesus' family", crown),
        ("Isaiah", "the promise", scroll),
    ]
    r = 74
    cols, rows = 3, 2
    top = y - 26
    gx = (R - L) / cols
    for i, (name, note, fn) in enumerate(items):
        cx = L + gx * (i % cols + 0.5)
        cy = top - r - 18 - (i // cols) * (2 * r + 64)
        with group(c, f"Ornament: {name}"):
            # hanging loop + cap
            ink(c, 1.4)
            c.setFillColor(white)
            c.circle(cx, cy + r + 14, 5, stroke=1, fill=1)
            fill(c, colored, GOLD)
            c.roundRect(cx - 12, cy + r - 4, 24, 12, 3, stroke=1, fill=1)
            cut_circle(c, cx, cy, r + 6)
            ink(c, STROKE)
            fill(c, colored, CREAM)
            c.circle(cx, cy, r, stroke=1, fill=1)
            if fn is stump:
                stump(c, cx, cy - 10, 56, colored)
            elif fn is ark:
                ark(c, cx, cy - 2, 70, colored)
            elif fn is ladder:
                ladder(c, cx, cy + 2, 36, 64, colored)
            elif fn is crown:
                crown(c, cx, cy + 4, 58, colored)
            elif fn is scroll:
                scroll(c, cx, cy + 4, 46, 48, colored)
            else:
                star(c, cx, cy + 22, 16, colored)
                for dx, dy, s in ((-28, 6, 8), (26, 10, 9), (-12, -12, 7), (14, -10, 6), (-32, 30, 5), (32, 34, 6)):
                    star(c, cx + dx, cy + dy, s, colored, GOLD, width=1.2)
            text(c, cx, cy - r + 26, name, "Baloo-Bold", 12, INK, "center")
            text(c, cx, cy - r - 22, note, "ComicRelief", 9.5, MUTED, "center")
        if i == 0:
            scissors(c, cx - r - 4, cy + r - 6)
    yb = top - 2 * (2 * r + 64) - 6
    steps(c, L + 10, yb, [
        "Colour each picture and cut out along the dashed circle.",
        "Punch a hole at the top and add a ribbon or string.",
        "Hang one on your Jesse tree (or a branch in a jar) and tell its story.",
    ], R - L - 20)
    footer(c)


# 2 ---------------------------------------------------------------------------
def prepare_the_way(c, colored):
    bg(c)
    y = header(c, "Prepare the Way", "Who was John the Baptist?",
               "John told people to get ready for the Saviour by turning away from sin. He pointed to Jesus.")
    with group(c, "Banner"):
        frame(c, L + 40, y - 70, R - L - 80, 50, 25, 1.8, colored, SKY)
        text(c, W / 2, y - 44, "\u201cPrepare the way of the Lord.\u201d", "Baloo-Bold", 18, INK, "center")
        text(c, W / 2, y - 61, "Mark 1:3", "ComicRelief", 9.5, MUTED, "center")
    yy = y - 104
    write_line(c, L + 10, yy, "My messy habit:", R - 10)
    write_line(c, L + 10, yy - 30, "Instead, I will:", R - 10)
    with group(c, "Path title"):
        text(c, W / 2, yy - 66, "Colour a stone each day you try. Step by step to Jesus!", "ComicRelief-Bold", 12, INK, "center")
    with group(c, "River Jordan"):
        ink(c, 1.2)
        for k in range(3):
            p = c.beginPath()
            base = yy - 196 - k * 9
            p.moveTo(L, base)
            for i in range(8):
                x0 = L + (R - L) * i / 8
                p.curveTo(x0 + 16, base + 6, x0 + 32, base + 6, x0 + (R - L) / 8, base)
            c.drawPath(p, fill=0, stroke=1)
        text(c, L + 4, yy - 238, "the River Jordan", "ComicRelief", 9, MUTED)
    with group(c, "Stepping stones"):
        for i, d in enumerate(DAYS):
            x = L + 34 + i * (R - L - 130) / 6
            yv = yy - 130 + (14 if i % 2 else -6)
            ellipse(c, x, yv, 30, 19, colored, GREY, 1.8)
            text(c, x, yv - 4, d, "Baloo-Bold", 11, INK, "center")
    with group(c, "Star at the end"):
        star(c, R - 36, yy - 124, 32, colored)
        text(c, R - 36, yy - 172, "Jesus", "Baloo-Bold", 12, INK, "center")
    with group(c, "Habit ideas"):
        top = yy - 262
        frame(c, L + 10, 112, R - L - 20, top - 112, 14, 1.4)
        text(c, W / 2, top - 24, "Messy habit ideas to clean up", "Baloo-Bold", 13, INK, "center")
        ideas = ["Grumbling", "Leaving toys out", "Not sharing", "Forgetting to pray", "Unkind words", "Not saying sorry"]
        for i, t in enumerate(ideas):
            cx = L + 40 + (i % 2) * (R - L - 20) / 2
            cyy = top - 52 - (i // 2) * 26
            check_box(c, cx, cyy - 3, 13)
            text(c, cx + 22, cyy, t, "ComicRelief", 11.5, INK)
    with group(c, "Lamb note"):
        text(c, W / 2, 90, "John pointed to Jesus and said: \u201cBehold, the Lamb of God!\u201d", "ComicRelief", 10.5, MUTED, "center")
    footer(c)


# 3 ---------------------------------------------------------------------------
def yes_with_a_smile(c, colored):
    bg(c)
    y = header(c, "Yes With a Smile", "How did Mary say yes to God?",
               "The angel Gabriel asked Mary to be the mother of God's Son. Mary trusted God and said yes!")
    with group(c, "Big heart"):
        heart(c, W / 2, y - 98, 72, colored, ROSE, 2.2)
        text(c, W / 2, y - 92, "Yes!", "Baloo-Bold", 34, INK, "center")
    sprinkle(c, [(W / 2 - 110, y - 50), (W / 2 + 112, y - 70), (W / 2 - 96, y - 140), (W / 2 + 100, y - 150)], 5)
    yy = y - 200
    write_line(c, L + 10, yy, "My chore:", R - 10)
    with group(c, "Chart title"):
        text(c, W / 2, yy - 36, "Each day I say yes with a smile, I colour a face.", "ComicRelief-Bold", 12, INK, "center")
    day_row(c, yy - 82, colored, "smile", GOLD, title="Smile chart")
    with group(c, "Chore ideas"):
        frame(c, L + 10, yy - 320, R - L - 20, 148, 14, 1.4)
        text(c, W / 2, yy - 194, "Chore ideas", "Baloo-Bold", 13, INK, "center")
        ideas = ["Set the table", "Tidy my toys", "Feed the pet", "Make my bed", "Help with dishes", "Fold the socks"]
        for i, s in enumerate(ideas):
            cx = L + 40 + (i % 2) * (R - L - 20) / 2
            cyy = yy - 222 - (i // 2) * 26
            check_box(c, cx, cyy - 3, 13)
            text(c, cx + 22, cyy, s, "ComicRelief", 11.5, INK)
    write_line(c, L + 10, yy - 346, "My own idea:", R - 10)
    footer(c)


# 4 ---------------------------------------------------------------------------
def white_flower_for_mary(c, colored):
    bg(c)
    y = header(c, "A White Flower for Mary", "What is the Immaculate Conception?",
               "On December 8 we celebrate that God kept Mary free from sin from the first moment of her life.")
    cx = W / 2
    with group(c, "Vase"):
        poly(c, [(cx - 50, 150), (cx + 50, 150), (cx + 68, 260), (cx + 40, 300), (cx - 40, 300), (cx - 68, 260)], colored, BLUE, 2.2)
        ink(c, 1.2)
        c.line(cx - 60, 230, cx + 60, 230)
        star(c, cx, 200, 12, colored, white, width=1.3)
    with group(c, "Stems"):
        ink(c, 2)
        stems = [((cx, 300), (cx, y - 150)), ((cx - 10, 300), (cx - 92, y - 212)), ((cx + 10, 300), (cx + 94, y - 202))]
        for (a, b) in stems:
            c.line(a[0], a[1], b[0], b[1])

        def on(k, t):
            (a, b) = stems[k]
            return a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t

        for k, t, ang in ((0, 0.35, 150), (0, 0.55, 30), (1, 0.45, 200), (2, 0.4, -20)):
            leaf(c, *on(k, t), 36, ang, colored, GREEN)
    with group(c, "White flowers"):
        flower(c, cx, y - 150, 52, colored, white, GOLD, 6, 2)
        flower(c, cx - 92, y - 212, 38, colored, white, GOLD, 5, 1.8)
        flower(c, cx + 94, y - 202, 40, colored, white, GOLD, 6, 1.8)
    with group(c, "Note"):
        text(c, cx, y - 34, "Leave the petals white. White means pure, like Mary.", "ComicRelief-Bold", 11.5, INK, "center")
    with group(c, "Hearts"):
        heart(c, L + 40, 220, 16, colored, ROSE)
        heart(c, R - 40, 250, 14, colored, ROSE)
    with group(c, "Try this"):
        para(c, cx, 124, "Put a white flower by a picture of Mary.", "Baloo-Bold", 14, R - L, 16, INK, "center")
        text(c, cx, 104, "Feast of the Immaculate Conception: December 8, a holy day in Advent.", "ComicRelief", 10, MUTED, "center")
    footer(c)


# 5 ---------------------------------------------------------------------------
def come_lord_jesus(c, colored):
    bg(c)
    y = header(c, "Come, Lord Jesus", "Why does Jesus come again?",
               "Jesus promised that he will come again in glory at the end of time. Advent reminds us to be ready.")
    top = y - 16
    with group(c, "Night sky"):
        frame(c, L, top - 260, R - L, 260, 18, 2, colored, NIGHT)
        moon(c, L + 80, top - 80, 40, colored)
        for (dx, dy, s) in ((180, -50, 10), (260, -100, 7), (330, -54, 12), (430, -110, 8), (480, -40, 9), (40, -230, 7), (484, -236, 8), (150, -120, 6)):
            star(c, L + dx, top + dy, s, colored, GOLD, width=1.2)
        cloud(c, R - 150, top - 64, 30, colored)
    with group(c, "Prayer"):
        frame(c, L + 90, top - 214, R - L - 180, 80, 16, 1.8)
        text(c, W / 2, top - 166, "Come, Lord Jesus!", "Baloo-Bold", 26, INK, "center")
        text(c, W / 2, top - 190, "Revelation 22:20", "ComicRelief", 9.5, MUTED, "center")
    yy = top - 300
    with group(c, "Chart title"):
        text(c, W / 2, yy, "Each night I pray \u201cCome, Lord Jesus,\u201d I colour a star.", "ComicRelief-Bold", 12, INK, "center")
    day_row(c, yy - 50, colored, "star", GOLD, title="Week 1 stars")
    day_row(c, yy - 130, colored, "star", GOLD, title="Week 2 stars")
    write_line(c, L + 10, 104, "Tonight I pray for:", R - 10)
    footer(c)


# 6 ---------------------------------------------------------------------------
def straw_for_the_manger(c, colored):
    bg(c)
    y = header(c, "Straw for the Manger", "How can my heart get ready for Jesus?",
               "We pray, share with others and go to Confession. Each kind act is like making a soft bed for baby Jesus.")
    cx = W / 2
    with group(c, "Star"):
        star(c, cx, y - 30, 20, colored)
        for dx in (-60, 60):
            sparkle(c, cx + dx, y - 40, 5)
    with group(c, "Manger"):
        top_y = manger(c, cx, y - 300, 300, colored)
    with group(c, "Glue area"):
        # dotted hump, drawn as short dotted segments so every dot is editable
        pts = []
        for i in range(41):
            t = i / 40
            x = (1 - t) ** 3 * (cx - 150) + 3 * (1 - t) ** 2 * t * (cx - 120) + 3 * (1 - t) * t ** 2 * (cx + 120) + t ** 3 * (cx + 150)
            yv = top_y + 3 * (1 - t) ** 2 * t * 80 + 3 * (1 - t) * t ** 2 * 80
            pts.append((x, yv))
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            dotted(c, x0, y0, x1, y1, 1.0)
        text(c, cx, top_y + 26, "Glue one straw here for each kind act.", "ComicRelief", 10.5, MUTED, "center")
    yy = y - 350
    with group(c, "Cut title"):
        text(c, L + 10, yy, "Cut out the straw. Write a kind act on each one.", "ComicRelief-Bold", 12, INK)
    scissors(c, L + 6, yy - 18)
    with group(c, "Straw pieces"):
        cols, rows = 4, 5
        bw = (R - L - 20) / cols
        bh = 30
        for i in range(cols * rows):
            x = L + 10 + (i % cols) * bw
            yv = yy - 30 - (i // cols) * (bh + 8) - bh
            cut_rect(c, x + 3, yv, bw - 6, bh)
            ink(c, 1.4)
            fill(c, colored, STRAW)
            c.roundRect(x + 9, yv + 6, bw - 18, bh - 12, 8, stroke=1, fill=1)
    footer(c)


# 7 ---------------------------------------------------------------------------
def jesse_tree_picture_a_day(c, colored):
    bg(c)
    y = header(c, "Jesse Tree: One Picture a Day", "What is a Jesse tree?",
               "A Jesse tree tells the story of God's people from creation to Jesus, with a picture for each day.")
    cx = W / 2
    base = 150
    fork = base + 150
    # branches: (end x offset, end y) ; circles sit on each branch
    branches = [(-205, fork + 120), (-130, fork + 230), (0, fork + 270), (130, fork + 230), (205, fork + 120)]
    spots = []
    for bx, by in branches:
        ex, ey = cx + bx, by
        spots.append((ex, ey))
        spots.append((cx + bx * 0.5, fork + (ey - fork) * 0.5))
    spots.append((cx - 72, fork + 186))
    spots.append((cx + 72, fork + 186))
    with group(c, "Branches"):
        ink(c, 5)
        for bx, by in branches:
            c.line(cx, fork, cx + bx, by)
    with group(c, "Tree trunk"):
        poly(c, [(cx - 34, base), (cx + 34, base), (cx + 16, fork + 10), (cx - 16, fork + 10)], colored, BROWN, 2.2)
        text(c, cx, base + 20, "Jesse", "Baloo-Bold", 12, INK, "center")
    with group(c, "Roots"):
        ink(c, 2.4)
        for dx in (-50, -20, 20, 50):
            c.line(cx + dx * 0.5, base, cx + dx, base - 14)
    with group(c, "Leaves"):
        for bx, by in branches:
            for t, side in ((0.28, 1), (0.75, -1)):
                lx, ly = cx + bx * t, fork + (by - fork) * t
                ang = math.degrees(math.atan2(by - fork, bx if bx else 0.001)) + 55 * side
                leaf(c, lx, ly, 24, ang, colored, GREEN)
    with group(c, "Picture circles"):
        for i, (x, yv) in enumerate(spots, 1):
            ink(c, 1.6)
            fill(c, colored, CREAM)
            c.circle(x, yv, 27, stroke=1, fill=1)
            text(c, x, yv + 16, str(i), "Baloo-Bold", 9, MUTED, "center")
    with group(c, "How to"):
        text(c, cx, 112, "Each day, draw one Bible picture in a circle and tell its story.", "ComicRelief-Bold", 11.5, INK, "center")
        text(c, cx, 94, "Ideas: creation, Noah's ark, Abraham's stars, Jacob's ladder, King David, Isaiah.", "ComicRelief", 9.5, MUTED, "center")
    footer(c)


# 8 ---------------------------------------------------------------------------
def helping_hands(c, colored):
    bg(c)
    y = header(c, "Helping Hands Like Mary", "Why did Mary visit Elizabeth?",
               "Mary hurried to help her cousin Elizabeth, who was going to have a baby too. Baby John jumped for joy!")
    with group(c, "Two houses"):
        house(c, L + 30, y - 190, 120, 140, colored)
        house(c, R - 150, y - 190, 120, 140, colored, CREAM, VIOLET)
        text(c, L + 90, y - 206, "Mary", "Baloo-Bold", 11, INK, "center")
        text(c, R - 90, y - 206, "Elizabeth", "Baloo-Bold", 11, INK, "center")
    with group(c, "Path of hearts"):
        for i in range(5):
            heart(c, L + 184 + i * (R - L - 368) / 4, y - 112 + 16 * math.sin(i / 4 * math.pi), 11, colored, ROSE)
    yy = y - 240
    with group(c, "Chart title"):
        text(c, W / 2, yy, "Help someone in your family this week. Colour a heart each time.", "ComicRelief-Bold", 12, INK, "center")
    day_row(c, yy - 46, colored, "heart", ROSE, title="Heart chart")
    with group(c, "Helper table"):
        top = yy - 100
        frame(c, L + 10, top - 190, R - L - 20, 190, 12, 1.4)
        text(c, L + 30, top - 24, "Who I helped", "Baloo-Bold", 12, INK)
        text(c, W / 2 + 10, top - 24, "How I helped", "Baloo-Bold", 12, INK)
        ink(c, 1)
        c.line(W / 2, top - 6, W / 2, top - 184)
    for i in range(4):
        yv = top - 66 - i * 36
        write_line(c, L + 30, yv, "", W / 2 - 14)
        write_line(c, W / 2 + 14, yv, "", R - 30)
    footer(c)


# 9 ---------------------------------------------------------------------------
def secret_kindness(c, colored):
    bg(c)
    y = header(c, "Secret Kindness Notes", "Who is Saint Nicholas?",
               "Saint Nicholas was a kind bishop who secretly gave gifts to people in need. We remember him on December 6.")
    with group(c, "Saint Nicholas mitre"):
        mitre(c, W / 2 - 70, y - 70, 50, colored)
        gift(c, W / 2 + 30, y - 100, 60, 52, colored)
    with group(c, "Intro"):
        text(c, W / 2, y - 140, "Cut out a note, write a kind message, and leave it as a secret surprise.", "ComicRelief-Bold", 11.5, INK, "center")
    top = y - 160
    tw, th = (R - L - 20) / 2, 190
    scissors(c, L + 4, top - 6)
    for i in range(4):
        x = L + 10 + (i % 2) * tw
        yv = top - 10 - (i // 2 + 1) * (th + 12) + 12
        with group(c, f"Note {i + 1}"):
            cut_rect(c, x + 4, yv, tw - 8, th)
            ink(c, 1.6)
            c.setFillColor(white)
            c.roundRect(x + 14, yv + 10, tw - 28, th - 20, 12, stroke=1, fill=1)
            star(c, x + 34, yv + th - 30, 10, colored)
            heart(c, x + tw - 36, yv + th - 30, 9, colored, ROSE)
            text(c, x + tw / 2, yv + th - 36, "A kind surprise", "Baloo-Bold", 14, INK, "center")
            text(c, x + tw / 2, yv + th - 52, "for you!", "Baloo-Bold", 12, INK, "center")
            for k in range(3):
                dotted(c, x + 30, yv + th - 82 - k * 24, x + tw - 30, yv + th - 82 - k * 24)
            text(c, x + tw / 2, yv + 22, "From: a secret friend", "ComicRelief", 10, MUTED, "center")
    footer(c)


# 10 --------------------------------------------------------------------------
def roses_for_mary(c, colored):
    bg(c)
    y = header(c, "Roses for Mary", "Who is Our Lady of Guadalupe?",
               "In 1531 Mary appeared to Saint Juan Diego in Mexico. She left her image on his cloak, surrounded by roses.")
    with group(c, "How to draw a rose"):
        text(c, W / 2, y - 22, "How to draw a rose", "Baloo-Bold", 13, INK, "center")
        xs = [L + 70, W / 2 - 60, W / 2 + 60, R - 70]
        for i, x in enumerate(xs):
            cy = y - 74
            ink(c, 1.6)
            fill(c, colored, RED if i == 3 else white)
            c.circle(x, cy, 24, stroke=1, fill=1)
            if i >= 1:
                ink(c, 1.3)
                p = c.beginPath()
                p.moveTo(x - 4, cy + 1)
                p.curveTo(x - 4, cy + 8, x + 7, cy + 8, x + 7, cy)
                p.curveTo(x + 7, cy - 12, x - 13, cy - 11, x - 13, cy + 1)
                c.drawPath(p, fill=0, stroke=1)
            if i >= 2:
                p = c.beginPath()
                p.moveTo(x - 23, cy - 6)
                p.curveTo(x - 14, cy - 23, x + 14, cy - 23, x + 23, cy - 6)
                c.drawPath(p, fill=0, stroke=1)
            if i == 3:
                leaf(c, x + 18, cy - 20, 22, -30, colored, GREEN)
            text(c, x, cy - 42, str(i + 1), "Baloo-Bold", 11, MUTED, "center")
    top = y - 140
    with group(c, "Frame"):
        frame(c, L + 10, 110, R - L - 20, top - 110, 20, 2)
        text(c, W / 2, top - 28, "Draw roses for Mary.", "Baloo-Bold", 18, INK, "center")
        text(c, W / 2, top - 46, "Fill the frame with roses, like the roses Saint Juan Diego carried in his cloak.", "ComicRelief", 10, MUTED, "center")
    with group(c, "Corner roses"):
        for (x, yv) in ((L + 44, top - 32), (R - 44, top - 32), (L + 44, 144), (R - 44, 144)):
            rose(c, x, yv, 18, colored)
            leaf(c, x + 10, yv - 18, 16, -40, colored, GREEN)
    with group(c, "Feast"):
        text(c, W / 2, 94, "Our Lady of Guadalupe: December 12", "ComicRelief", 10, MUTED, "center")
    footer(c)


# 11 --------------------------------------------------------------------------
O_NAMES = [
    ("O Wisdom", "Dec 17", "book"),
    ("O Lord", "Dec 18", "flame"),
    ("O Root of Jesse", "Dec 19", "flower"),
    ("O Key of David", "Dec 20", "key"),
    ("O Radiant Dawn", "Dec 21", "sun"),
    ("O King of Nations", "Dec 22", "crown"),
    ("O Emmanuel", "Dec 23", "heart"),
]


def o_antiphon_ornaments(c, colored):
    bg(c)
    y = header(c, "O Antiphon Ornaments", "What are the O Antiphons?",
               "From December 17 to 23 the Church sings seven special names for Jesus. Emmanuel means \u201cGod with us.\u201d")
    r = 62
    pos = []
    top = y - 18
    for i in range(7):
        row = 0 if i < 4 else 1 if i < 7 else 2
        n_in_row = 4 if row == 0 else 3
        col = i if row == 0 else i - 4
        gx = (R - L) / n_in_row
        pos.append((L + gx * (col + 0.5), top - r - 20 - row * (2 * r + 58)))
    for (name, day, sym), (cx, cy) in zip(O_NAMES, pos):
        with group(c, f"Ornament: {name}"):
            ink(c, 1.4)
            c.setFillColor(white)
            c.circle(cx, cy + r + 12, 4.5, stroke=1, fill=1)
            fill(c, colored, GOLD)
            c.roundRect(cx - 10, cy + r - 4, 20, 10, 3, stroke=1, fill=1)
            cut_circle(c, cx, cy, r + 5)
            ink(c, STROKE)
            fill(c, colored, VIOLET)
            c.circle(cx, cy, r, stroke=1, fill=1)
            c.setFillColor(white)
            ink(c, 1.4)
            c.circle(cx, cy + 10, 28, stroke=1, fill=1)
            if sym == "book":
                book(c, cx, cy + 8, 32, 22, colored, CREAM)
            elif sym == "flame":
                flame(c, cx, cy - 6, 15, colored)
            elif sym == "flower":
                flower(c, cx, cy + 8, 18, colored, ROSE, GOLD, 5, 1.2)
            elif sym == "key":
                key_shape(c, cx + 2, cy + 8, 26, colored)
            elif sym == "sun":
                sun(c, cx, cy + 2, 11, colored, GOLD, 1.2, 7, half=True)
            elif sym == "crown":
                crown(c, cx, cy + 6, 30, colored)
            else:
                heart(c, cx, cy + 10, 14, colored, RED)
            text(c, cx, cy - 34, name, "Baloo-Bold", 10 if len(name) > 13 else 11, INK, "center")
            text(c, cx, cy - 48, day, "ComicRelief", 9, INK, "center")
    scissors(c, L + 2, top - 10)
    yb = pos[-1][1] - r - 34
    steps(c, L + 10, yb, [
        "Colour the seven ornaments and cut them out.",
        "Punch a hole at the top and add a string.",
        "From December 17 to 23, hang the one for that day and say its name for Jesus.",
    ], R - L - 20)
    footer(c)


# 12 --------------------------------------------------------------------------
def family_advent_calendar(c, colored):
    bg(c)
    y = header(c, "Family Advent Calendar", "What can families do in Advent?",
               "Light the wreath, read a Bible story, and set up the nativity slowly. Give to people in need.")
    with group(c, "Calendar title"):
        text(c, W / 2, y - 18, "Write one kind act in each box. Colour the box when your family does it.", "ComicRelief-Bold", 11.5, INK, "center")
    # Advent 2026: Sun Nov 29 .. Thu Dec 24 (26 days), laid out Sun..Sat.
    import datetime as dt
    start = dt.date(2026, 11, 29)
    days = [start + dt.timedelta(days=i) for i in range(26)]
    cols = 7
    gx = (R - L) / cols
    top = y - 34
    with group(c, "Weekdays"):
        for i, d in enumerate(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]):
            text(c, L + gx * (i + 0.5), top - 12, d, "Baloo-Bold", 10.5, INK, "center")
    bh = 106
    sunday_colors = [VIOLET, VIOLET, ROSE, VIOLET]
    for i, d in enumerate(days):
        col = i % 7
        row = i // 7
        x = L + col * gx
        yv = top - 22 - (row + 1) * (bh + 4)
        label = f"{'Nov' if d.month == 11 else 'Dec'} {d.day}"
        with group(c, f"Day {label}"):
            ink(c, 1.4)
            c.setFillColor(white)
            c.roundRect(x + 2, yv, gx - 4, bh, 8, stroke=1, fill=1)
            text(c, x + 9, yv + bh - 15, str(d.day), "Baloo-Bold", 12, INK)
            if col == 0:
                week = row
                candle(c, x + gx - 22, yv + bh - 34, 10, 20, colored, sunday_colors[week], True, None, 1.2)
            if d == dt.date(2026, 12, 24):
                star(c, x + gx - 18, yv + bh - 16, 9, colored)
            for k in range(3):
                dotted(c, x + 9, yv + bh - 40 - k * 16, x + gx - 9, yv + bh - 40 - k * 16, 0.9)
    with group(c, "Key"):
        text(c, W / 2, 74, "Sundays have a candle: light one more on your Advent wreath. December 24: Christmas Eve!", "ComicRelief", 9.5, MUTED, "center")
    footer(c)


# 13 --------------------------------------------------------------------------
def four_advent_candles(c, colored):
    bg(c)
    y = header(c, "Colour the Advent Candles", "Why are the candles purple and pink?",
               "Purple means getting ready and turning our hearts back to God. The pink candle on the third Sunday is for joy!")
    base = 190
    cw, chs = 78, [300, 300, 300, 300]
    colors = [VIOLET, VIOLET, ROSE, VIOLET]
    labels = ["Week 1", "Week 2", "Week 3", "Week 4"]
    gx = (R - L - 40) / 4
    with group(c, "Greenery"):
        for i in range(9):
            leaf(c, L + 40 + i * (R - L - 80) / 8, base + 4, 34, 110 if i % 2 else 70, colored, GREEN)
    for i in range(4):
        x = L + 20 + gx * i + (gx - cw) / 2
        with group(c, f"Candle {labels[i]}"):
            candle(c, x, base, cw, chs[i], colored, colors[i], True, None, 2.2)
            text(c, x + cw / 2, base + chs[i] * 0.55, labels[i], "Baloo-Bold", 13, INK, "center")
    with group(c, "Base"):
        frame(c, L + 20, base - 34, R - L - 40, 34, 14, 2, colored, BROWN)
    with group(c, "Colour key"):
        ink(c, 1.4)
        fill(c, colored, VIOLET)
        c.roundRect(L + 60, 118, 16, 16, 3, stroke=1, fill=1)
        text(c, L + 84, 122, "Purple: weeks 1, 2 and 4", "Baloo-Bold", 11, INK)
        fill(c, colored, ROSE)
        c.roundRect(W / 2 + 30, 118, 16, 16, 3, stroke=1, fill=1)
        text(c, W / 2 + 54, 122, "Pink: week 3 (Gaudete, \u201cRejoice!\u201d)", "Baloo-Bold", 11, INK)
        text(c, W / 2, 96, "Light one more candle each Sunday of Advent.", "ComicRelief", 10, MUTED, "center")
    sprinkle(c, [(L + 26, base + 330), (R - 26, base + 320), (W / 2, base + 360)], 5)
    footer(c)


# 14 --------------------------------------------------------------------------
def paper_advent_wreath(c, colored):
    bg(c)
    y = header(c, "Paper Advent Wreath", "What does the Advent wreath mean?",
               "The round wreath has no end, like God's love. Its green branches mean life and hope.")
    cx, cy, r_out, r_in = W / 2, y - 200, 170, 108
    with group(c, "Wreath ring"):
        ink(c, 2.2)
        fill(c, colored, GREEN)
        c.circle(cx, cy, r_out, stroke=1, fill=1)
        c.setFillColor(white)
        c.circle(cx, cy, r_in, stroke=1, fill=1)
    with group(c, "Leaves"):
        n = 18
        for i in range(n):
            a = 360 * i / n
            rm = (r_out + r_in) / 2
            x = cx + rm * math.cos(math.radians(a))
            yv = cy + rm * math.sin(math.radians(a))
            leaf(c, x, yv, 26, a + 60, colored, DARK_GREEN, 1.3)
    with group(c, "Berries"):
        for i in range(6):
            a = math.radians(30 + 60 * i)
            ink(c, 1.2)
            fill(c, colored, RED)
            c.circle(cx + (r_out - 14) * math.cos(a), cy + (r_out - 14) * math.sin(a), 6, stroke=1, fill=1)
    with group(c, "Glue spots"):
        for i, a in enumerate((135, 45, 315, 225)):
            x = cx + (r_in + r_out) / 2 * math.cos(math.radians(a))
            yv = cy + (r_in + r_out) / 2 * math.sin(math.radians(a))
            ink(c, 1.2)
            c.setFillColor(white)
            c.circle(x, yv, 14, stroke=1, fill=1)
            text(c, x, yv - 3.5, "glue", "ComicRelief", 8, MUTED, "center")
    yy = cy - r_out - 30
    with group(c, "Cut title"):
        text(c, L + 10, yy, "Cut out the candles and glue them on the wreath.", "ComicRelief-Bold", 12, INK)
    scissors(c, R - 20, yy + 4)
    colors = [VIOLET, VIOLET, ROSE, VIOLET]
    for i in range(4):
        x = L + 40 + i * (R - L - 80) / 4
        with group(c, f"Cut-out candle {i + 1}"):
            cut_rect(c, x, 80, (R - L - 80) / 4 - 20, yy - 96)
            candle(c, x + 30, 92, 40, yy - 160, colored, colors[i], True, None, 1.8)
    footer(c)


# 15 --------------------------------------------------------------------------
def advent_dinner_candle(c, colored):
    bg(c)
    y = 30 + header(c, "Light the Advent Candle", "What is Advent?",
               "Advent is about four weeks of getting ready. We prepare to celebrate Jesus' birth at Christmas.")
    cx = W / 2
    with group(c, "Table"):
        frame(c, L + 20, y - 230, R - L - 40, 26, 10, 2, colored, BROWN)
    with group(c, "Wreath"):
        ellipse(c, cx, y - 196, 130, 30, colored, GREEN, 2.2)
        ellipse(c, cx, y - 196, 80, 14, colored, white, 1.6)
        for (dx, dy, a) in ((-110, -4, 170), (-70, -22, 200), (0, -28, 270), (70, -22, 340), (110, -4, 10), (-90, 16, 150), (90, 16, 30)):
            leaf(c, cx + dx, y - 196 + dy, 22, a, colored, DARK_GREEN, 1.2)
    with group(c, "Candles"):
        colors = [VIOLET, VIOLET, ROSE, VIOLET]
        for i, dx in enumerate((-96, -34, 34, 96)):
            candle(c, cx + dx - 13, y - 196 + 4 - (6 if i in (1, 2) else 0), 26, 96, colored, colors[i], i == 0, None, 1.8)
    with group(c, "Plates"):
        for dx in (-210, 210):
            ellipse(c, cx + dx, y - 205, 36, 12, colored, white, 1.6)
    with group(c, "Grace"):
        frame(c, L + 20, y - 350, R - L - 40, 100, 16, 1.8, colored, CREAM)
        text(c, cx, y - 276, "Grace before meals", "Baloo-Bold", 14, INK, "center")
        para(c, cx, y - 298, "Bless us, O Lord, and these thy gifts, which we are about to receive from thy bounty, through Christ our Lord. Amen.",
             "ComicRelief", 11.5, R - L - 90, 15, INK, "center")
    top = y - 380
    with group(c, "Week checklist"):
        text(c, cx, top, "Each Sunday, light one more candle at dinner. Tick the week.", "ComicRelief-Bold", 12, INK, "center")
        dates = ["Nov 29", "Dec 6", "Dec 13", "Dec 20"]
        gx = (R - L) / 4
        for i, d in enumerate(dates):
            x = L + gx * (i + 0.5)
            candle(c, x - 12, top - 96, 24, 52, colored, colors[i], True, None, 1.6)
            check_box(c, x - 8, top - 124, 16)
            text(c, x, top - 140, f"Week {i + 1}", "Baloo-Bold", 11, INK, "center")
            text(c, x, top - 154, d, "ComicRelief", 10, MUTED, "center")
    write_line(c, L + 10, 86, "Tonight we pray for:", R - 10)
    footer(c)


# Craft -----------------------------------------------------------------------
def advent_candle_craft(c, colored):
    bg(c)
    y = header(c, "Advent Candle Craft", "Why are the candles purple and pink?",
               "Purple means getting ready. The pink (rose) candle on the third Sunday is for joy, because Christmas is near!",
               kicker="Advent craft")
    top = y - 16
    cw, ch = 70, 210
    colors = [VIOLET, VIOLET, ROSE, VIOLET]
    names = ["Week 1", "Week 2", "Week 3", "Week 4"]
    gx = (R - L) / 4
    with group(c, "Part A title"):
        text(c, L, top, "A  Candles", "Baloo-Bold", 13, INK)
        text(c, L + 90, top, "3 violet and 1 rose. Colour, then cut on the dashed lines.", "ComicRelief", 10.5, MUTED)
    scissors(c, R - 10, top + 4)
    for i in range(4):
        x = L + gx * i + (gx - cw) / 2
        yv = top - 18 - ch
        with group(c, f"Candle {i + 1}"):
            cut_rect(c, x - 6, yv - 26, cw + 12, ch + 32)
            ink(c, 2)
            fill(c, colored, colors[i])
            c.roundRect(x, yv, cw, ch, 8, stroke=1, fill=1)
            ink(c, 1.4)
            c.line(x + cw * 0.25, yv + ch, x + cw * 0.25, yv + ch - 24)
            c.line(x + cw / 2, yv + ch, x + cw / 2, yv + ch + 5)
            text(c, x + cw / 2, yv + ch * 0.55, names[i], "Baloo-Bold", 13, INK, "center")
            text(c, x + cw / 2, yv + ch * 0.55 - 16, "Rose" if colors[i] is ROSE else "Violet", "ComicRelief", 10.5, INK, "center")
            # fold tab at the bottom
            ink(c, 1.0)
            c.setDash(1, 3)
            c.line(x, yv, x + cw, yv)
            c.setDash()
            c.setFillColor(white)
            ink(c, 1.4)
            c.rect(x + 8, yv - 20, cw - 16, 20, stroke=1, fill=1)
            text(c, x + cw / 2, yv - 14, "fold", "ComicRelief", 8.5, MUTED, "center")
    yb = top - 18 - ch - 50
    with group(c, "Part B title"):
        text(c, L, yb, "B  Flames", "Baloo-Bold", 13, INK)
        text(c, L + 90, yb, "Light one more each week.", "ComicRelief", 10.5, MUTED)
    for i in range(4):
        x = L + gx * (i + 0.5)
        with group(c, f"Flame {i + 1}"):
            cut_rect(c, x - 24, yb - 78, 48, 64)
            flame(c, x, yb - 72, 28, colored, FLAME, 1.8)
            flame(c, x, yb - 66, 13, colored, GOLD, 1.0)
    yc = yb - 104
    with group(c, "Part C title"):
        text(c, L, yc, "C  Base", "Baloo-Bold", 13, INK)
        text(c, L + 90, yc, "Cut out, fold on the dotted lines into a stand, glue each candle tab on a spot.", "ComicRelief", 10.5, MUTED)
    with group(c, "Base strip"):
        bx, bw = L + 10, R - L - 20
        y0 = yc - 96
        cut_rect(c, bx, y0, bw, 78)
        ink(c, 1.8)
        fill(c, colored, GREEN)
        c.roundRect(bx + 6, y0 + 26, bw - 12, 46, 10, stroke=1, fill=1)
        ink(c, 1.0)
        c.setDash(1, 3)
        c.line(bx, y0 + 26, bx + bw, y0 + 26)
        c.setDash()
        text(c, bx + bw / 2, y0 + 9, "fold back to stand", "ComicRelief", 8.5, MUTED, "center")
        for i in range(4):
            x = bx + bw * (i + 0.5) / 4
            ink(c, 1.2)
            c.setFillColor(white)
            c.roundRect(x - 26, y0 + 36, 52, 26, 6, stroke=1, fill=1)
            text(c, x, y0 + 45, "glue", "ComicRelief", 9, MUTED, "center")
        for i in range(5):
            leaf(c, bx + 18 + i * (bw - 36) / 4, y0 + 64, 16, 70 + 40 * (i % 2), colored, DARK_GREEN, 1.1)
    steps(c, L + 10, y0 - 24, [
        "Colour the candles and flames, then cut out every piece on the dashed lines.",
        "Fold the base back on the dotted line so it stands up. Fold each candle tab back.",
        "Glue each candle tab on a glue spot. Each Sunday of Advent, glue one more flame on top.",
    ], R - L - 20, 10.5)
    footer(c)


SHEETS = {
    "jesse-tree-ornaments": jesse_ornaments,
    "prepare-the-way": prepare_the_way,
    "yes-with-a-smile": yes_with_a_smile,
    "white-flower-for-mary": white_flower_for_mary,
    "come-lord-jesus": come_lord_jesus,
    "straw-for-the-manger": straw_for_the_manger,
    "jesse-tree-picture-a-day": jesse_tree_picture_a_day,
    "helping-hands-like-mary": helping_hands,
    "secret-kindness-notes": secret_kindness,
    "roses-for-mary": roses_for_mary,
    "o-antiphon-ornaments": o_antiphon_ornaments,
    "family-advent-calendar": family_advent_calendar,
    "colour-the-advent-candles": four_advent_candles,
    "paper-advent-wreath": paper_advent_wreath,
    "light-the-advent-candle": advent_dinner_candle,
    "advent-candle-craft": advent_candle_craft,
}
